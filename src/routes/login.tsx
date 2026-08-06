import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LogIn, Radio } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hasFirebaseConfig } from "@/firebase/client";
import { useAuth } from "@/hooks/useAuth";
import { signInAdmin } from "@/services/authService";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Login · Memorial Cloud Admin" }],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.user) {
      void navigate({ to: "/" });
    }
  }, [auth.user, navigate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      await signInAdmin(email.trim(), password);
      toast.success("Login realizado.");
      void navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao autenticar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-border bg-surface p-6"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background">
            <Radio className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Memorial Cloud Admin</h1>
            <p className="text-xs text-muted-foreground">Acesso administrativo</p>
          </div>
        </div>

        {!hasFirebaseConfig && (
          <div className="mb-4 rounded-md border border-status-paused/50 bg-status-paused/10 px-3 py-2 text-xs text-status-paused">
            Configure as variaveis VITE_FIREBASE_* para habilitar o login.
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Senha</Label>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>
          <Button
            className="h-10 w-full"
            disabled={loading || !hasFirebaseConfig || !email || !password}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            Entrar
          </Button>
        </div>
      </form>
    </div>
  );
}
