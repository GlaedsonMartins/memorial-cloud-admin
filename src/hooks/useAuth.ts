import { useEffect, useSyncExternalStore } from "react";
import { hasFirebaseConfig } from "@/firebase/client";
import { adminAuth } from "@/services/authService";

const serverSnapshot = adminAuth.getSnapshot();

// Mounted once by the root route; navigating never creates another auth subscription.
export function useAuthLifecycle() {
  useEffect(() => {
    if (!hasFirebaseConfig) return;
    const stop = adminAuth.start();
    const synchronize = () => {
      void adminAuth.synchronize();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") synchronize();
    };
    const interval = window.setInterval(synchronize, 60_000);
    window.addEventListener("online", synchronize);
    window.addEventListener("focus", synchronize);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stop();
      window.clearInterval(interval);
      window.removeEventListener("online", synchronize);
      window.removeEventListener("focus", synchronize);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
}

export function useAuth() {
  const state = useSyncExternalStore(
    adminAuth.subscribe,
    adminAuth.getSnapshot,
    () => serverSnapshot,
  );
  return {
    ...state,
    configured: hasFirebaseConfig,
    retry: adminAuth.retry,
    signIn: adminAuth.signIn,
    signOut: adminAuth.signOut,
  };
}
