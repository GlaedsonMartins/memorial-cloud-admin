import assert from "node:assert/strict";
import { test } from "node:test";
import { AdminAuthController, type AuthDependencies } from "../src/lib/admin-auth-controller.ts";
import {
  describeBrowser,
  getOrCreateDeviceId,
  getRememberedEmail,
  rememberEmail,
} from "../src/lib/login-preferences.ts";

const user = { uid: "admin-a", email: "admin@example.test" };
const session = { deviceId: "browser-0000000001", sessionId: "session-0000000001" };
function fixture() {
  let current: typeof user | null = user;
  let failure: unknown;
  let watched: () => void = () => {};
  const events: string[] = [];
  const deps: AuthDependencies<typeof user> = {
    prepare: async () => {
      events.push("prepare");
    },
    currentUser: () => current,
    subscribe: () => () => {},
    exclusive: async (operation) => operation(),
    signIn: async () => {
      events.push("sign-in");
      current = user;
      return user;
    },
    signOut: async () => {
      events.push("sign-out");
      current = null;
    },
    sync: async (attemptId) => {
      events.push(attemptId ? `start:${attemptId}` : "resume");
      if (failure) throw failure;
      return session;
    },
    end: async () => {
      events.push("end");
      if (failure) throw failure;
    },
    watch: (_uid, _session, changed) => {
      watched = changed;
      return () => {};
    },
    rememberEmail: (email) => {
      events.push(`email:${email}`);
    },
    uuid: () => "login-attempt-000001",
  };
  const controller = new AdminAuthController(deps);
  return {
    controller,
    deps,
    events,
    fail: (error: unknown) => {
      failure = error;
    },
    current: () => current,
    remoteChange: () => watched(),
  };
}

test("restored user is hidden until server validation finishes; concurrent sync is deduplicated", async () => {
  const f = fixture();
  assert.equal(f.controller.getSnapshot().user, null);
  await Promise.all([
    f.controller.synchronize(),
    f.controller.synchronize(),
    f.controller.synchronize(),
  ]);
  assert.equal(f.controller.getSnapshot().user, user);
  assert.equal(f.events.filter((event) => event === "resume").length, 1);
});

test("initial network failure keeps Firebase login and supports retry", async () => {
  const f = fixture();
  f.fail({ code: "functions/unavailable" });
  await f.controller.synchronize();
  assert.equal(f.controller.getSnapshot().user, null);
  assert.equal(f.controller.getSnapshot().loading, false);
  assert.ok(f.controller.getSnapshot().error);
  assert.equal(f.current(), user);
  f.fail(null);
  await f.controller.retry();
  assert.equal(f.controller.getSnapshot().user, user);
});

test("transient heartbeat failure does not sign out an already validated user", async () => {
  const f = fixture();
  await f.controller.synchronize();
  f.fail({ code: "functions/unavailable" });
  await f.controller.synchronize();
  assert.equal(f.controller.getSnapshot().user, user);
  assert.equal(f.events.includes("sign-out"), false);
});

test("remote logout signs out and cannot silently restart an ended session", async () => {
  const f = fixture();
  await f.controller.synchronize();
  f.fail({ code: "functions/failed-precondition", details: { reason: "session-ended" } });
  f.remoteChange();
  await f.controller.synchronize();
  assert.equal(f.current(), null);
  assert.equal(f.controller.getSnapshot().user, null);
  assert.match(f.controller.getSnapshot().error!, /desconectado/);
  assert.equal(
    f.events.some((event) => event.startsWith("start:")),
    false,
  );
});

test("closed browser discovers logout before releasing dashboard", async () => {
  const f = fixture();
  f.fail({ details: { reason: "session-ended" } });
  await f.controller.synchronize();
  assert.equal(f.controller.getSnapshot().user, null);
  assert.equal(f.current(), null);
});

test("login waits for persistence and retries registration with the same attempt ID", async () => {
  const f = fixture();
  f.fail({ code: "functions/unavailable" });
  await assert.rejects(f.controller.signIn(" admin@example.test ", "not-saved"));
  assert.deepEqual(f.events.slice(0, 3), ["prepare", "sign-in", "start:login-attempt-000001"]);
  f.fail(null);
  await f.controller.retry();
  assert.equal(f.events.filter((event) => event === "start:login-attempt-000001").length, 2);
  assert.ok(f.events.includes("email:admin@example.test"));
});

test("manual logout ends server record before signing out and preserves remembered email", async () => {
  const f = fixture();
  await f.controller.synchronize();
  await f.controller.signOut();
  assert.deepEqual(f.events.slice(-2), ["end", "sign-out"]);
  assert.equal(f.controller.getSnapshot().user, null);
});

test("failed remote closure is not reported as successful manual logout", async () => {
  const f = fixture();
  await f.controller.synchronize();
  f.fail(new Error("offline"));
  await assert.rejects(f.controller.signOut(), /offline/);
  assert.equal(f.current(), user);
});

test("missing function during rollout is not treated as account revocation", async () => {
  const f = fixture();
  f.fail({ code: "functions/not-found" });
  await f.controller.synchronize();
  assert.equal(f.current(), user);
});

test("storage denial blocks login before password authentication", async () => {
  const f = fixture();
  f.deps.prepare = async () => {
    throw new Error("armazenamento indisponível");
  };
  await assert.rejects(f.controller.signIn(user.email, "not-saved"), /armazenamento/);
  assert.equal(f.events.includes("sign-in"), false);
});

test("browser ID and email survive subsequent visits; password is never stored", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  } as Storage;
  assert.equal(
    getOrCreateDeviceId(storage, () => session.deviceId),
    session.deviceId,
  );
  assert.equal(
    getOrCreateDeviceId(storage, () => "another-browser-123"),
    session.deviceId,
  );
  rememberEmail(storage, " admin@example.test ");
  assert.equal(getRememberedEmail(storage), user.email);
  assert.equal(values.size, 2);
  const blocked = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
  } as unknown as Storage;
  assert.equal(getRememberedEmail(blocked), "");
  assert.doesNotThrow(() => rememberEmail(blocked, user.email));
  assert.throws(() => getOrCreateDeviceId(blocked, () => session.deviceId), /armazenamento/);
});

test("browser labels distinguish Edge, Chrome and mobile Safari", () => {
  assert.deepEqual(describeBrowser("Windows Chrome/120 Safari/537 Edg/120"), {
    browser: "Edge",
    system: "Windows",
  });
  assert.deepEqual(describeBrowser("Android Chrome/120 Safari/537"), {
    browser: "Chrome",
    system: "Android",
  });
  assert.deepEqual(describeBrowser("iPhone Safari/600"), {
    browser: "Safari",
    system: "iOS / iPadOS",
  });
});
