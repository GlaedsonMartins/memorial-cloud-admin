import { useEffect, useRef, useState } from "react";
import type { User } from "firebase/auth";
import { getFirebaseAuth, hasFirebaseConfig } from "@/firebase/client";
import {
  signOutAdmin,
  subscribeToAuth,
  subscribeToIdToken,
  validateAdminSession,
} from "@/services/authService";

const SESSION_VALIDATION_INTERVAL_MS = 60_000;

function isConfirmedAuthorizationFailure(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";
  return [
    "functions/unauthenticated",
    "functions/permission-denied",
    "functions/not-found",
  ].includes(code);
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(hasFirebaseConfig);
  const [error, setError] = useState<string | null>(null);
  const validationInFlight = useRef(false);

  useEffect(() => {
    if (!hasFirebaseConfig) {
      setLoading(false);
      return;
    }

    try {
      const validateSilently = async (nextUser: User | null) => {
        if (!nextUser || validationInFlight.current) return;
        validationInFlight.current = true;
        try {
          await validateAdminSession();
        } catch (validationError) {
          if (isConfirmedAuthorizationFailure(validationError)) {
            await signOutAdmin().catch(() => undefined);
          }
        } finally {
          validationInFlight.current = false;
        }
      };

      const unsubscribeAuth = subscribeToAuth((nextUser) => {
        setUser(nextUser);
        setLoading(false);
        void validateSilently(nextUser);
      });
      const unsubscribeToken = subscribeToIdToken((nextUser) => {
        setUser(nextUser);
        void validateSilently(nextUser);
      });
      const interval = window.setInterval(() => {
        void validateSilently(getFirebaseAuth().currentUser);
      }, SESSION_VALIDATION_INTERVAL_MS);

      return () => {
        unsubscribeAuth();
        unsubscribeToken();
        window.clearInterval(interval);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao iniciar autenticação.");
      setLoading(false);
    }
  }, []);

  return { user, loading, error, configured: hasFirebaseConfig };
}
