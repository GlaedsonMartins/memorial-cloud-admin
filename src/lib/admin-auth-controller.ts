export interface SessionIdentity {
  deviceId: string;
  sessionId: string;
}

interface AuthUser {
  uid: string;
  email: string | null;
}

export interface AuthState<U> {
  user: U | null;
  loading: boolean;
  error: string | null;
  session: SessionIdentity | null;
}

export interface AuthDependencies<U extends AuthUser> {
  prepare: () => Promise<void>;
  currentUser: () => U | null;
  subscribe: (callback: () => void) => () => void;
  exclusive: <T>(operation: () => Promise<T>) => Promise<T>;
  signIn: (email: string, password: string) => Promise<U>;
  signOut: () => Promise<void>;
  sync: (attemptId?: string) => Promise<SessionIdentity>;
  end: (session: SessionIdentity) => Promise<void>;
  watch: (uid: string, session: SessionIdentity, changed: () => void) => () => void;
  rememberEmail: (email: string) => void;
  uuid: () => string;
}

function confirmedFailure(error: unknown) {
  const value = error as { code?: string; details?: { reason?: string } } | null;
  return (
    [
      "functions/unauthenticated",
      "functions/permission-denied",
      "auth/user-disabled",
      "auth/user-token-expired",
      "auth/invalid-user-token",
    ].includes(value?.code ?? "") || value?.details?.reason === "session-ended"
  );
}

export function authErrorMessage(error: unknown) {
  if ((error as { details?: { reason?: string } })?.details?.reason === "session-ended") {
    return "Este dispositivo foi desconectado. Entre novamente.";
  }
  const code = (error as { code?: string })?.code;
  if (
    ["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(code ?? "")
  ) {
    return "Email ou senha incorretos.";
  }
  if (
    [
      "auth/network-request-failed",
      "functions/unavailable",
      "functions/deadline-exceeded",
    ].includes(code ?? "")
  ) {
    return "Não foi possível validar seu login. Confira sua conexão e tente novamente.";
  }
  return error instanceof Error
    ? error.message
    : "Não foi possível validar seu login. Tente novamente.";
}

// One controller for the entire application. Auth callbacks, login, logout and heartbeat
// share a queue; a Web Lock also serializes these operations across browser tabs.
export class AdminAuthController<U extends AuthUser> {
  private state: AuthState<U>;
  private listeners = new Set<() => void>();
  private queue: Promise<unknown> = Promise.resolve();
  private syncInFlight: Promise<void> | null = null;
  private unwatch: (() => void) | null = null;
  private watchedKey = "";
  private pendingLogin: { uid: string; attemptId: string } | null = null;
  private deps: AuthDependencies<U>;

  constructor(deps: AuthDependencies<U>, configured = true) {
    this.deps = deps;
    this.state = { user: null, loading: configured, error: null, session: null };
  }

  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private update(update: Partial<AuthState<U>>) {
    this.state = { ...this.state, ...update };
    this.listeners.forEach((listener) => listener());
  }

  private run<T>(operation: () => Promise<T>) {
    const next = this.queue.then(() => this.deps.exclusive(operation));
    this.queue = next.catch(() => undefined);
    return next;
  }

  private clearWatch() {
    this.unwatch?.();
    this.unwatch = null;
    this.watchedKey = "";
  }

  private async validate() {
    const user = this.deps.currentUser();
    if (!user) {
      this.clearWatch();
      this.pendingLogin = null;
      this.update({ user: null, session: null, loading: false });
      return;
    }
    if (this.state.user?.uid !== user.uid) {
      this.clearWatch();
      this.update({ user: null, session: null, loading: true, error: null });
    }
    if (this.pendingLogin?.uid !== user.uid) this.pendingLogin = null;
    const session = await this.deps.sync(this.pendingLogin?.attemptId);
    // A signout from another tab may arrive while the request is in flight.
    if (this.deps.currentUser()?.uid !== user.uid) return;
    this.pendingLogin = null;
    this.deps.rememberEmail(user.email ?? "");
    this.update({ user, session, loading: false, error: null });
    const watchKey = `${user.uid}/${session.deviceId}/${session.sessionId}`;
    if (watchKey !== this.watchedKey) {
      this.clearWatch();
      this.watchedKey = watchKey;
      this.unwatch = this.deps.watch(user.uid, session, () => {
        void this.synchronize();
      });
    }
  }

  private async handleFailure(error: unknown) {
    if (confirmedFailure(error)) {
      this.clearWatch();
      this.pendingLogin = null;
      this.update({ user: null, session: null, loading: false, error: authErrorMessage(error) });
      await this.deps.signOut();
    } else {
      // Existing validated sessions stay usable during transient network errors.
      this.update({ loading: false, error: authErrorMessage(error) });
    }
  }

  synchronize = () => {
    if (this.syncInFlight) return this.syncInFlight;
    this.syncInFlight = this.run(async () => {
      try {
        await this.deps.prepare();
        await this.validate();
      } catch (error) {
        await this.handleFailure(error);
      }
    }).finally(() => {
      this.syncInFlight = null;
    });
    return this.syncInFlight;
  };

  retry = () => {
    if (!this.state.user) this.update({ loading: true, error: null });
    return this.synchronize();
  };

  signIn = (email: string, password: string) =>
    this.run(async () => {
      this.update({ loading: true, error: null });
      try {
        await this.deps.prepare();
        const user = await this.deps.signIn(email.trim(), password);
        this.pendingLogin = { uid: user.uid, attemptId: this.deps.uuid() };
        await this.validate();
      } catch (error) {
        await this.handleFailure(error);
        throw new Error(authErrorMessage(error));
      }
    });

  signOut = () =>
    this.run(async () => {
      // Do not report a successful logout if the server failed to close the record.
      if (this.state.session) await this.deps.end(this.state.session);
      this.clearWatch();
      this.pendingLogin = null;
      await this.deps.signOut();
      this.update({ user: null, session: null, loading: false, error: null });
    });

  start() {
    const unsubscribe = this.deps.subscribe(() => {
      void this.synchronize();
    });
    void this.synchronize();
    return () => {
      unsubscribe();
      this.clearWatch();
    };
  }
}
