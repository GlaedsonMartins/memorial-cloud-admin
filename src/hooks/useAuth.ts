import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { hasFirebaseConfig } from "@/firebase/client";
import { subscribeToAuth } from "@/services/authService";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(hasFirebaseConfig);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasFirebaseConfig) {
      setLoading(false);
      return;
    }

    try {
      return subscribeToAuth((nextUser) => {
        setUser(nextUser);
        setLoading(false);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao iniciar autenticação.");
      setLoading(false);
    }
  }, []);

  return { user, loading, error, configured: hasFirebaseConfig };
}
