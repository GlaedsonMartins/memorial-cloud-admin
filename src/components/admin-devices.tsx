import { useEffect, useState } from "react";
import { Laptop, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import {
  endAdminDeviceSession,
  subscribeAdminDevices,
  type AdminDeviceSession,
} from "@/services/authService";

export function AdminDevices() {
  const auth = useAuth();
  const uid = auth.user?.uid;
  const [sessions, setSessions] = useState<AdminDeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<AdminDeviceSession | null>(null);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    setError(null);
    setSessions([]);
    return subscribeAdminDevices(
      uid,
      (items) => {
        setSessions(items);
        setLoading(false);
      },
      () => {
        setError("Não foi possível carregar os dispositivos.");
        setLoading(false);
      },
    );
  }, [uid, attempt]);

  async function disconnect() {
    if (!selected || ending) return;
    setEnding(true);
    try {
      if (
        selected.deviceId === auth.session?.deviceId &&
        selected.sessionId !== auth.session.sessionId
      ) {
        toast.info("O login deste dispositivo mudou. Confira a lista atualizada.");
        setSelected(null);
        return;
      }
      if (selected.deviceId === auth.session?.deviceId) await auth.signOut();
      else await endAdminDeviceSession(selected);
      toast.success("Dispositivo desconectado.");
      setSelected(null);
    } catch {
      toast.error("Não foi possível desconectar. Confira sua conexão e tente novamente.");
    } finally {
      setEnding(false);
    }
  }

  return (
    <section className="space-y-3" aria-labelledby="admin-devices-title">
      <div>
        <h3 id="admin-devices-title" className="text-sm font-semibold">
          Dispositivos conectados
        </h3>
        <p className="text-xs text-muted-foreground">
          Logins da sua conta, inclusive com o navegador fechado.
        </p>
      </div>
      {loading ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Carregando dispositivos...
        </p>
      ) : error ? (
        <div role="alert" className="space-y-2 text-xs">
          <p>{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Tentar novamente
          </Button>
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum dispositivo conectado.</p>
      ) : (
        <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {sessions.map((session) => (
            <li
              key={session.deviceId}
              className="flex items-center gap-3 rounded-md border border-border p-3"
            >
              <Laptop className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-medium">
                  {session.browser} · {session.system}
                </p>
                {session.deviceId === auth.session?.deviceId && (
                  <Badge variant="secondary" className="text-[10px]">
                    Este dispositivo
                  </Badge>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Último acesso:{" "}
                  {session.lastSeen?.toDate().toLocaleString("pt-BR") ?? "Atualizando..."}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={ending}
                onClick={() => setSelected(session)}
                aria-label={`Desconectar ${session.browser} em ${session.system}`}
              >
                <LogOut className="mr-1 h-3 w-3" />
                Desconectar
              </Button>
            </li>
          ))}
        </ul>
      )}
      <AlertDialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open && !ending) setSelected(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desconectar dispositivo?</AlertDialogTitle>
            <AlertDialogDescription>
              {selected?.browser} · {selected?.system}. O painel pedirá login novamente ao
              sincronizar ou reabrir. O email salvo será mantido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={ending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={ending}
              onClick={(event) => {
                event.preventDefault();
                void disconnect();
              }}
            >
              {ending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
