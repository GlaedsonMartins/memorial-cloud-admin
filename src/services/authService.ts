import { onIdTokenChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { collection, doc, onSnapshot, query, where, type Timestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import {
  getFirebaseAuth,
  getFirebaseDb,
  getFirebaseFunctions,
  hasFirebaseConfig,
  prepareFirebaseAuth,
} from "@/firebase/client";
import { AdminAuthController, type SessionIdentity } from "@/lib/admin-auth-controller";
import {
  describeBrowser,
  getOrCreateDeviceId,
  getRememberedEmail,
  rememberEmail,
} from "@/lib/login-preferences";

export interface AdminDeviceSession extends SessionIdentity {
  browser: string;
  system: string;
  state: "active" | "ended";
  createdAt: Timestamp | null;
  lastSeen: Timestamp | null;
}

function storage() {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function readLoginEmail() {
  return getRememberedEmail(storage());
}

export async function endAdminDeviceSession(session: SessionIdentity) {
  await httpsCallable<SessionIdentity, { ended: boolean }>(
    getFirebaseFunctions(),
    "endAdminDeviceSession",
    { timeout: 15_000 },
  )(session);
}

export function subscribeAdminDevices(
  uid: string,
  callback: (sessions: AdminDeviceSession[]) => void,
  onError: (error: Error) => void,
) {
  // Real-time snapshots are required to reflect remote logout without refreshing.
  const sessions = query(
    collection(getFirebaseDb(), "admin_sessions", uid, "devices"),
    where("state", "==", "active"),
  );
  return onSnapshot(
    sessions,
    (snapshot) => {
      callback(
        snapshot.docs
          .map((item) => item.data() as AdminDeviceSession)
          .sort((a, b) => (b.lastSeen?.toMillis() ?? 0) - (a.lastSeen?.toMillis() ?? 0)),
      );
    },
    onError,
  );
}

export const adminAuth = new AdminAuthController<User>(
  {
    prepare: async () => {
      // Never silently create another device on each page load if storage is blocked.
      const local = storage();
      if (!local)
        throw new Error("Permita o armazenamento deste site no navegador para manter seu login.");
      getOrCreateDeviceId(local, () => crypto.randomUUID());
      await prepareFirebaseAuth();
      await getFirebaseAuth().authStateReady();
    },
    currentUser: () => getFirebaseAuth().currentUser,
    subscribe: (callback) => onIdTokenChanged(getFirebaseAuth(), callback),
    exclusive: async (operation) =>
      navigator.locks
        ? await navigator.locks.request("memorial-admin-auth", operation)
        : await operation(),
    signIn: async (email, password) =>
      (await signInWithEmailAndPassword(getFirebaseAuth(), email, password)).user,
    signOut: () => signOut(getFirebaseAuth()),
    sync: async (attemptId) => {
      const deviceId = getOrCreateDeviceId(window.localStorage, () => crypto.randomUUID());
      const callable = httpsCallable<
        {
          deviceId: string;
          mode: "start" | "resume";
          attemptId?: string;
          browser: string;
          system: string;
        },
        SessionIdentity
      >(getFirebaseFunctions(), "syncAdminDeviceSession", { timeout: 15_000 });
      const result = await callable({
        deviceId,
        mode: attemptId ? "start" : "resume",
        ...(attemptId ? { attemptId } : {}),
        ...describeBrowser(navigator.userAgent),
      });
      // assertAdmin may have granted the existing account its admin claim.
      const user = getFirebaseAuth().currentUser;
      if (user && !(await user.getIdTokenResult()).claims.admin) await user.getIdToken(true);
      return result.data;
    },
    end: endAdminDeviceSession,
    watch: (uid, session, changed) =>
      onSnapshot(
        doc(getFirebaseDb(), "admin_sessions", uid, "devices", session.deviceId),
        (snapshot) => {
          // Cached data cannot invalidate a freshly completed login.
          if (
            !snapshot.metadata.fromCache &&
            (!snapshot.exists() ||
              snapshot.data().state !== "active" ||
              snapshot.data().sessionId !== session.sessionId)
          )
            changed();
        },
        changed,
      ),
    rememberEmail: (email) => rememberEmail(storage(), email),
    uuid: () => crypto.randomUUID(),
  },
  hasFirebaseConfig,
);
