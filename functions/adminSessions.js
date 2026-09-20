import { randomUUID } from "node:crypto";
import { HttpsError } from "firebase-functions/v2/https";

const ID_PATTERN = /^[a-zA-Z0-9-]{16,80}$/;

function requireId(value) {
  if (typeof value !== "string" || !ID_PATTERN.test(value)) {
    throw new HttpsError("invalid-argument", "Identificador de sessão inválido.");
  }
  return value;
}

function sessionEnded() {
  return new HttpsError(
    "failed-precondition",
    "Este dispositivo foi desconectado. Entre novamente.",
    {
      reason: "session-ended",
    },
  );
}

// All paths are derived from the authenticated UID, never from a client-supplied owner.
// This is application logout, not revocation of Firebase refresh tokens.
export function createAdminSessionOperations({ db, assertAdmin, serverTimestamp }) {
  async function sync(request) {
    const uid = await assertAdmin(request);
    const deviceId = requireId(request.data?.deviceId);
    const mode = request.data?.mode;
    if (mode !== "start" && mode !== "resume") {
      throw new HttpsError("invalid-argument", "Operação de sessão inválida.");
    }
    const attemptId = mode === "start" ? requireId(request.data?.attemptId) : null;
    if (mode === "start") {
      const age = Date.now() / 1000 - Number(request.auth.token.auth_time ?? 0);
      if (request.auth.token.firebase?.sign_in_provider !== "password" || age > 300 || age < -60) {
        throw new HttpsError("unauthenticated", "Entre novamente para iniciar uma sessão.");
      }
    }
    const browser = String(request.data?.browser || "Navegador desconhecido").slice(0, 80);
    const system = String(request.data?.system || "Sistema desconhecido").slice(0, 80);
    const ref = db.collection("admin_sessions").doc(uid).collection("devices").doc(deviceId);
    // Generated outside the transaction so retries are idempotent.
    const newSessionId = attemptId ?? randomUUID();
    return db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      const previous = snapshot.data();
      const isNewLogin = mode === "start" && previous?.sessionId !== attemptId;
      if (previous?.state === "ended" && !isNewLogin) throw sessionEnded();
      const newSession = !snapshot.exists || isNewLogin;
      const sessionId = newSession ? newSessionId : previous.sessionId;
      const now = serverTimestamp();
      // Multiple tabs validate each minute, but only one write per browser/minute is needed.
      if (newSession || Date.now() - (previous.lastSeen?.toMillis?.() ?? 0) >= 55_000) {
        transaction.set(ref, {
          deviceId,
          sessionId,
          browser,
          system,
          state: "active",
          createdAt: newSession ? now : previous.createdAt,
          lastSeen: now,
          endedAt: null,
        });
      }
      return { deviceId, sessionId };
    });
  }

  async function end(request) {
    const uid = await assertAdmin(request);
    const deviceId = requireId(request.data?.deviceId);
    const sessionId = requireId(request.data?.sessionId);
    const ref = db.collection("admin_sessions").doc(uid).collection("devices").doc(deviceId);
    await db.runTransaction(async (transaction) => {
      const previous = (await transaction.get(ref)).data();
      // An old dialog/request must not disconnect a newer login on the same browser.
      if (previous?.state === "active" && previous.sessionId === sessionId) {
        transaction.update(ref, { state: "ended", endedAt: serverTimestamp() });
      }
    });
    return { ended: true };
  }

  return { sync, end };
}
