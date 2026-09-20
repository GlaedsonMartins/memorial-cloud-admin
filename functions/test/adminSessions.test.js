import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { initializeApp, deleteApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { createAdminSessionOperations } from "../adminSessions.js";

// Deliberately refuses production: these tests exercise actual transactions and rules.
if (!process.env.FIRESTORE_EMULATOR_HOST?.startsWith("127.0.0.1:"))
  throw new Error("A local Firestore emulator is required.");
const projectId = "demo-memorial-sessions";
const app = initializeApp({ projectId });
const db = getFirestore(app);
const uid = "admin-a";
const deviceId = "browser-0000000001";
const secondDeviceId = "browser-0000000002";
const operations = createAdminSessionOperations({
  db,
  serverTimestamp: () => FieldValue.serverTimestamp(),
  assertAdmin: async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Login required");
    const account = (await db.doc(`users/${request.auth.uid}`).get()).data();
    if (!account?.active || account.role !== "ADMIN")
      throw new HttpsError("permission-denied", "Admin required");
    return request.auth.uid;
  },
});
function request(data, userId = uid) {
  return {
    auth: {
      uid: userId,
      token: {
        auth_time: Math.floor(Date.now() / 1000),
        firebase: { sign_in_provider: "password" },
      },
    },
    data,
  };
}
const resume = (id = deviceId) =>
  request({ mode: "resume", deviceId: id, browser: "Chrome", system: "Windows" });

before(async () => {
  await fetch(
    `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${projectId}/databases/(default)/documents`,
    { method: "DELETE" },
  );
  await Promise.all(
    [uid, "admin-b"].map((id) => db.doc(`users/${id}`).set({ active: true, role: "ADMIN" })),
  );
});
after(async () => {
  await db.terminate();
  await deleteApp(app);
});

test("session lifecycle, ownership and Firestore access rules", async (t) => {
  let first;
  let second;
  await t.test("concurrent tabs migrate an existing login to one device record", async () => {
    const results = await Promise.all([
      operations.sync(resume()),
      operations.sync(resume()),
      operations.sync(resume()),
    ]);
    first = results[0];
    assert.ok(results.every((result) => result.sessionId === first.sessionId));
    assert.equal((await db.collection(`admin_sessions/${uid}/devices`).get()).size, 1);
  });
  await t.test("another browser stays independently connected", async () => {
    second = await operations.sync(resume(secondDeviceId));
    assert.notEqual(first.sessionId, second.sessionId);
  });
  await t.test("other admin cannot end the owner's session", async () => {
    await operations.end(request(first, "admin-b"));
    assert.equal(
      (await db.doc(`admin_sessions/${uid}/devices/${deviceId}`).get()).data().state,
      "active",
    );
  });
  await t.test("logout is idempotent and resume cannot reactivate it", async () => {
    await operations.end(request(first));
    await operations.end(request(first));
    await assert.rejects(
      operations.sync(resume()),
      (error) => error.details?.reason === "session-ended",
    );
    assert.equal((await operations.sync(resume(secondDeviceId))).sessionId, second.sessionId);
  });
  await t.test("explicit new login replaces only that browser's session", async () => {
    const start = request({ mode: "start", deviceId, attemptId: "login-attempt-000001" });
    const fresh = await operations.sync(start);
    assert.equal((await operations.sync(start)).sessionId, fresh.sessionId);
    await operations.end(request(first));
    assert.equal((await operations.sync(resume())).sessionId, fresh.sessionId);
    await operations.end(request(fresh));
    await assert.rejects(
      operations.sync(start),
      (error) => error.details?.reason === "session-ended",
    );
  });
  await t.test("invalid IDs, unsigned users and players cannot register sessions", async () => {
    await assert.rejects(operations.sync({ data: resume().data }), { code: "unauthenticated" });
    await assert.rejects(operations.sync(resume("../admin-b/devices/other")), {
      code: "invalid-argument",
    });
    await assert.rejects(operations.sync(request(resume().data, "player-a")), {
      code: "permission-denied",
    });
    const oldLogin = request({ mode: "start", deviceId, attemptId: "login-attempt-000002" });
    oldLogin.auth.token.auth_time -= 301;
    await assert.rejects(operations.sync(oldLogin), { code: "unauthenticated" });
  });

  // The emulator accepts unsigned test JWTs; these never leave localhost.
  function token(userId, claims = {}) {
    const now = Math.floor(Date.now() / 1000);
    const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
    return `${encode({ alg: "none", typ: "JWT" })}.${encode({ sub: userId, user_id: userId, aud: projectId, iss: `https://securetoken.google.com/${projectId}`, iat: now, exp: now + 3600, auth_time: now, firebase: { sign_in_provider: "password" }, ...claims })}.`;
  }
  async function rest(path, userId, options = {}, claims) {
    return fetch(
      `http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/${projectId}/databases/(default)/documents/${path}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(userId ? { Authorization: `Bearer ${token(userId, claims)}` } : {}),
        },
      },
    );
  }
  await t.test(
    "rules allow own device reads and queries, deny other admins and anonymous users",
    async () => {
      const path = `admin_sessions/${uid}/devices/${deviceId}`;
      assert.equal((await rest(path, uid)).status, 200);
      assert.equal((await rest(path, "admin-b")).status, 403);
      assert.equal((await rest(path)).status, 403);
      const query = {
        structuredQuery: {
          from: [{ collectionId: "devices" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "state" },
              op: "EQUAL",
              value: { stringValue: "active" },
            },
          },
        },
      };
      assert.equal(
        (
          await rest(`admin_sessions/${uid}:runQuery`, uid, {
            method: "POST",
            body: JSON.stringify(query),
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await rest(`admin_sessions/${uid}:runQuery`, "admin-b", {
            method: "POST",
            body: JSON.stringify(query),
          })
        ).status,
        403,
      );
    },
  );
  await t.test(
    "rules deny direct creation, modification and deletion even to the owner",
    async () => {
      const body = JSON.stringify({ fields: { state: { stringValue: "active" } } });
      for (const id of [deviceId, "new-browser-00001"]) {
        assert.equal(
          (await rest(`admin_sessions/${uid}/devices/${id}`, uid, { method: "PATCH", body }))
            .status,
          403,
        );
      }
      assert.equal(
        (await rest(`admin_sessions/${uid}/devices/${deviceId}`, uid, { method: "DELETE" })).status,
        403,
      );
    },
  );
  await t.test(
    "inactive account loses read permission; Player room access is unchanged",
    async () => {
      await db.doc(`users/${uid}`).update({ active: false });
      assert.equal((await rest(`admin_sessions/${uid}/devices/${deviceId}`, uid)).status, 403);
      await db.doc("rooms/test-room").set({ name: "Test room" });
      assert.equal(
        (
          await rest(
            "rooms/test-room",
            "device-player",
            {},
            { device: true, deviceId: "device-player", roomId: "test-room" },
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await rest(
            `admin_sessions/${uid}/devices/${deviceId}`,
            "device-player",
            {},
            { device: true, roomId: "test-room" },
          )
        ).status,
        403,
      );
    },
  );
});
