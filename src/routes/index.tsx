import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Copy,
  Clock,
  Image as ImageIcon,
  KeyRound,
  Loader2,
  LogOut,
  Music,
  Play,
  Plus,
  Radio,
  Save,
  Settings as SettingsIcon,
  Square,
  Trash2,
  Upload,
  Video,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { hasFirebaseConfig } from "@/firebase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMemorialData } from "@/hooks/useMemorialData";
import { cn } from "@/lib/utils";
import { signOutAdmin } from "@/services/authService";
import {
  createRoom,
  createTribute,
  deactivateRoom,
  deleteTribute,
  endTribute,
  saveSettings,
  startTribute,
  updateTribute,
  updateRoomName,
  uploadSettingsImage,
} from "@/services/memorialService";
import {
  ALLOWED_SLIDE_DURATIONS,
  MAX_PHOTOS_PER_TRIBUTE,
  MAX_VIDEO_SECONDS,
  type Playlist,
  type Room,
  type RoomViewModel,
  type Settings,
  type SlideDuration,
  type Tribute,
} from "@/types/memorial";

export const Route = createFileRoute("/")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Memorial Cloud Admin" },
      {
        name: "description",
        content:
          "Painel administrativo para controlar homenagens das salas velatorias via Firebase.",
      },
    ],
  }),
});

function DashboardPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const data = useMemorialData(Boolean(auth.user));
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [createRoomOpen, setCreateRoomOpen] = useState(false);

  useEffect(() => {
    if (!auth.loading && auth.configured && !auth.user) {
      void navigate({ to: "/login" });
    }
  }, [auth.configured, auth.loading, auth.user, navigate]);

  const selectedRoom = useMemo(
    () => data.roomViews.find((room) => room.room.id === selectedRoomId) ?? null,
    [data.roomViews, selectedRoomId],
  );

  if (!hasFirebaseConfig) {
    return <FirebaseSetupScreen />;
  }

  if (auth.loading || data.loading) {
    return <LoadingScreen label="Carregando Memorial Admin" />;
  }

  if (!auth.user) {
    return <LoadingScreen label="Redirecionando para login" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface">
              <Radio className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-[15px] font-semibold leading-tight">Memorial Cloud Admin</h1>
              <p className="text-xs text-muted-foreground">
                {data.settings?.companyName ?? "Painel administrativo"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <HeaderPill icon={<Activity className="h-3.5 w-3.5 text-status-live" />}>
              {data.connectedPlayers}/{data.roomViews.length || 0} dispositivos online
            </HeaderPill>
            <HeaderPill icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />}>
              {new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "short",
                timeStyle: "medium",
              }).format(new Date())}
            </HeaderPill>
            <Button variant="secondary" className="h-9" onClick={() => setCreateRoomOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova sala
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSettingsOpen(true)}
            >
              <SettingsIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => void signOutAdmin().then(() => navigate({ to: "/login" }))}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-8">
        {data.error && (
          <div className="mb-5 flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            {data.error}
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Visao geral das salas</h2>
            <p className="text-sm text-muted-foreground">
              Crie e gerencie salas conectadas ao Memorial Player em tempo real.
            </p>
          </div>
          <Badge variant="outline" className="rounded-md border-border px-3 py-1.5">
            Ultima sincronizacao:{" "}
            {data.lastSyncMs ? formatDateTime(new Date(data.lastSyncMs)) : "sem registro"}
          </Badge>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.roomViews.map((view) => (
            <RoomCard
              key={view.room.id}
              view={view}
              onManage={() => setSelectedRoomId(view.room.id)}
            />
          ))}
        </div>
      </main>

      <RoomManagerSheet
        open={Boolean(selectedRoom)}
        onOpenChange={(open) => !open && setSelectedRoomId(null)}
        roomView={selectedRoom}
        playlists={data.playlists}
        userId={auth.user.uid}
      />

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={data.settings}
        rooms={data.roomViews}
      />

      <CreateRoomDialog open={createRoomOpen} onOpenChange={setCreateRoomOpen} />
    </div>
  );
}

function HeaderPill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="hidden items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground md:flex">
      {icon}
      <span>{children}</span>
    </div>
  );
}

function RoomCard({ view, onManage }: { view: RoomViewModel; onManage: () => void }) {
  const mediaCount = (view.tribute?.photos.length ?? 0) + (view.tribute?.videos.length ?? 0);
  const currentPhoto = view.tribute?.photos[0];

  return (
    <section className="flex min-h-[320px] flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-xs font-semibold tabular-nums">
            {String(view.room.number).padStart(2, "0")}
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight">{view.room.name}</h3>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {view.room.playerId}
            </p>
          </div>
        </div>
        <StatusBadge status={view.status} />
      </div>

      <div className="grid flex-1 grid-cols-[140px_1fr] gap-4 px-5 py-4">
        <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-black/70">
          {currentPhoto ? (
            <img
              src={currentPhoto.url}
              alt={view.tribute?.name ?? "Homenagem"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageIcon className="h-5 w-5" />
              <span className="text-[10px] uppercase tracking-wider">Sem midia</span>
            </div>
          )}
          {view.status === "ACTIVE" && (
            <div className="absolute left-2 top-2 rounded-sm bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
              AO VIVO
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-3">
          <div className="space-y-3">
            <Metric label="Homenagem" value={view.tribute?.name ?? "Sala livre"} />
            <div className="grid grid-cols-2 gap-3 text-xs">
              <IconMetric
                icon={<ImageIcon className="h-3.5 w-3.5" />}
                value={`${view.tribute?.photos.length ?? 0} fotos`}
              />
              <IconMetric
                icon={<Video className="h-3.5 w-3.5" />}
                value={`${view.tribute?.videos.length ?? 0} videos`}
              />
              <IconMetric
                icon={<Music className="h-3.5 w-3.5" />}
                value={view.playlist?.name ?? "sem playlist"}
              />
              <IconMetric
                icon={<Clock className="h-3.5 w-3.5" />}
                value={`${view.tribute?.slideDuration ?? 5}s`}
              />
            </div>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <button
              className="flex max-w-full items-center gap-1.5 text-left text-primary hover:text-primary/80"
              onClick={() => copyText(getPlayerUrl(view.room))}
            >
              <Copy className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{getPlayerUrl(view.room)}</span>
            </button>
            <div className="flex items-center gap-1.5">
              {(view.device ?? view.playerStatus)?.online ? (
                <Wifi className="h-3.5 w-3.5 text-status-live" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-status-offline" />
              )}
              Dispositivo{" "}
              {(view.device ?? view.playerStatus)?.online ? "online" : "offline ou sem heartbeat"}
            </div>
            <div>
              Ultima sync:{" "}
              {view.device?.lastSeen
                ? formatTimestamp(view.device.lastSeen)
                : view.playerStatus?.lastSync
                  ? formatTimestamp(view.playerStatus.lastSync)
                  : "sem registro"}
            </div>
            {view.device && (
              <div className="truncate">
                {view.device.deviceName} · {view.device.currentState}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-[1fr_auto_auto] gap-2 border-t border-border bg-background/40 px-5 py-3">
        <Button onClick={onManage} className="h-9">
          <Upload className="mr-2 h-4 w-4" />
          Gerenciar sala
        </Button>
        <Badge variant="secondary" className="h-9 rounded-md px-3">
          {mediaCount} midias
        </Badge>
        <Badge variant="outline" className="h-9 rounded-md border-border px-3">
          {view.activeSession?.status ?? "WAITING"}
        </Badge>
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: RoomViewModel["status"] }) {
  const map = {
    FREE: "Livre",
    ACTIVE: "Homenagem ativa",
    PLAYER_OFFLINE: "Player offline",
    SYNCING: "Sincronizando",
  };
  const classes = {
    FREE: "border-border bg-muted/40 text-muted-foreground",
    ACTIVE: "border-status-live/50 bg-status-live/15 text-status-live",
    PLAYER_OFFLINE: "border-status-offline/50 bg-status-offline/15 text-status-offline",
    SYNCING: "border-status-paused/50 bg-status-paused/15 text-status-paused",
  };
  return (
    <span className={cn("rounded-md border px-2.5 py-1 text-xs font-medium", classes[status])}>
      {map[status]}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="truncate text-sm font-medium">{value}</div>
    </div>
  );
}

function IconMetric({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-muted-foreground">
      {icon}
      <span className="truncate">{value}</span>
    </span>
  );
}

function RoomManagerSheet({
  open,
  onOpenChange,
  roomView,
  playlists,
  userId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomView: RoomViewModel | null;
  playlists: Playlist[];
  userId: string;
}) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [playlistId, setPlaylistId] = useState("");
  const [slideDuration, setSlideDuration] = useState<SlideDuration>(5);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!open || !roomView) return;
    setName(roomView.tribute?.name ?? "");
    setNotes(roomView.tribute?.notes ?? "");
    setPlaylistId(roomView.tribute?.playlistId ?? playlists[0]?.id ?? "");
    setSlideDuration(roomView.tribute?.slideDuration ?? 5);
    setPhotos([]);
    setVideos([]);
    setUploadProgress(0);
  }, [open, playlists, roomView]);

  const activeTribute = roomView?.tribute ?? null;
  const canSubmit = Boolean(
    roomView && name.trim() && playlistId && !saving && (activeTribute || photos.length > 0),
  );

  async function handlePhotoFiles(files: FileList | null) {
    if (!files) return;
    const allowedPhotoTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/pjpeg", "image/x-png"];
    const allowedPhotoExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const next = Array.from(files).filter((file) => {
      const typeAllowed = allowedPhotoTypes.includes(file.type);
      const extension = String(file.name).toLowerCase().split(".").pop();
      const extensionAllowed = extension
        ? allowedPhotoExtensions.includes(`.${extension}`)
        : false;
      return typeAllowed || extensionAllowed;
    });

    if (next.length === 0) {
      toast.error("Nenhuma foto valida selecionada. Use JPG, PNG ou WEBP.");
      return;
    }

    const available = MAX_PHOTOS_PER_TRIBUTE - photos.length;
    if (next.length > available) {
      toast.warning(`Limite de ${MAX_PHOTOS_PER_TRIBUTE} fotos por homenagem.`);
    }

    setPhotos((current) => [...current, ...next.slice(0, available)]);
  }

  async function handleVideoFiles(files: FileList | null) {
    if (!files) return;
    const checked: File[] = [];
    for (const file of Array.from(files).filter((item) => item.type.startsWith("video/"))) {
      const duration = await readVideoDuration(file);
      if (duration > MAX_VIDEO_SECONDS) {
        toast.error(`${file.name} ultrapassa 1 minuto.`);
      } else {
        checked.push(file);
      }
    }
    setVideos((current) => [...current, ...checked]);
  }

  async function handleCreate() {
    if (!roomView || !canSubmit) return;
    setSaving(true);
    try {
      const draft = {
        roomId: roomView.room.id,
        name: name.trim(),
        notes: notes.trim(),
        photos,
        videos,
        playlistId,
        slideDuration,
      };

      if (activeTribute) {
        await updateTribute(activeTribute, draft, setUploadProgress);
        toast.success("Homenagem atualizada sem reiniciar a sessao.");
      } else {
        await createTribute(draft, userId, setUploadProgress);
        toast.success("Homenagem criada. Clique em Iniciar para transmitir.");
      }

      setPhotos([]);
      setVideos([]);
      setUploadProgress(0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar homenagem.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStart(tribute: Tribute) {
    setSaving(true);
    try {
      await startTribute(tribute);
      toast.success("Homenagem iniciada no contrato active_sessions.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao iniciar homenagem.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEnd(tribute: Tribute) {
    if (!roomView) return;
    setSaving(true);
    try {
      await endTribute(roomView.room, tribute);
      toast.success("Homenagem encerrada e registrada no historico.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao encerrar homenagem.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(tribute: Tribute) {
    if (!window.confirm("Excluir esta homenagem e seus arquivos do Storage?")) return;
    setSaving(true);
    try {
      await deleteTribute(tribute);
      toast.success("Homenagem excluida sem deixar arquivos orfaos.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao excluir homenagem.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-border bg-surface p-0 sm:max-w-2xl"
      >
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="text-base font-semibold">
            {roomView?.room.name ?? "Sala"}
          </SheetTitle>
          <SheetDescription>
            Crie, inicie, encerre ou exclua a homenagem vinculada a esta sala.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-6 py-6">
          {activeTribute && (
            <section className="rounded-md border border-border bg-background/45 p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">{activeTribute.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {activeTribute.status} · {activeTribute.photos.length} fotos ·{" "}
                    {activeTribute.videos.length} videos
                  </p>
                </div>
                <StatusBadge status={activeTribute.status === "ACTIVE" ? "ACTIVE" : "FREE"} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={saving || activeTribute.status === "ACTIVE"}
                  onClick={() => handleStart(activeTribute)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Iniciar
                </Button>
                <Button
                  variant="secondary"
                  disabled={saving || activeTribute.status !== "ACTIVE"}
                  onClick={() => handleEnd(activeTribute)}
                >
                  <Square className="mr-2 h-4 w-4" />
                  Encerrar
                </Button>
                <Button
                  variant="destructive"
                  disabled={saving || activeTribute.status === "ACTIVE"}
                  onClick={() => handleDelete(activeTribute)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </section>
          )}

          <Tabs defaultValue="tribute">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tribute">Homenagem</TabsTrigger>
              <TabsTrigger value="media">Midias</TabsTrigger>
            </TabsList>

            <TabsContent value="tribute" className="mt-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome do falecido">
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ex.: Maria da Silva"
                  />
                </Field>
                <Field label="Playlist">
                  <Select value={playlistId} onValueChange={setPlaylistId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {playlists.map((playlist) => (
                        <SelectItem key={playlist.id} value={playlist.id}>
                          {playlist.name} · {playlist.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Tempo do slide">
                  <Select
                    value={String(slideDuration)}
                    onValueChange={(value) => setSlideDuration(Number(value) as SlideDuration)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALLOWED_SLIDE_DURATIONS.map((seconds) => (
                        <SelectItem key={seconds} value={String(seconds)}>
                          {seconds} segundos
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Observacoes">
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Informacoes internas opcionais"
                />
              </Field>
            </TabsContent>

            <TabsContent value="media" className="mt-5 space-y-4">
              <UploadBox
                icon={<ImageIcon className="h-4 w-4" />}
                title="Fotos"
                description="JPG, PNG ou WEBP · maximo 20"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/jpg,image/png,image/webp,image/*"
                multiple
                onChange={handlePhotoFiles}
              />
              <FileList
                files={photos}
                onRemove={(index) => setPhotos((items) => items.filter((_, i) => i !== index))}
              />

              <UploadBox
                icon={<Video className="h-4 w-4" />}
                title="Videos opcionais"
                description="Videos de ate 1 minuto"
                accept="video/*"
                multiple
                onChange={handleVideoFiles}
              />
              <FileList
                files={videos}
                onRemove={(index) => setVideos((items) => items.filter((_, i) => i !== index))}
              />
            </TabsContent>
          </Tabs>

          {saving && (
            <div className="rounded-md border border-border bg-background/45 px-4 py-3 text-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-muted-foreground">Upload e gravacao</span>
                <span className="tabular-nums">{uploadProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-sm bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-border bg-surface px-6 py-4">
          <Button className="h-11 w-full" disabled={!canSubmit} onClick={handleCreate}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {activeTribute ? "Atualizar homenagem" : "Criar homenagem"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function UploadBox({
  icon,
  title,
  description,
  accept,
  multiple,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accept: string;
  multiple?: boolean;
  onChange: (files: FileList | null) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-border bg-background/45 px-4 py-4 transition-colors hover:bg-background">
      <input
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(event) => onChange(event.target.files)}
      />
      <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface">
        {icon}
      </div>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}

function FileList({ files, onRemove }: { files: File[]; onRemove: (index: number) => void }) {
  if (files.length === 0) return null;
  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <div
          key={`${file.name}-${index}`}
          className="flex items-center justify-between gap-3 rounded-md border border-border bg-background/45 px-3 py-2 text-sm"
        >
          <span className="truncate">
            {String(index + 1).padStart(2, "0")} · {file.name}
          </span>
          <button
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onRemove(index)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function SettingsDialog({
  open,
  onOpenChange,
  settings,
  rooms,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings | null;
  rooms: RoomViewModel[];
}) {
  const [companyName, setCompanyName] = useState("");
  const [heartbeatOfflineSeconds, setHeartbeatOfflineSeconds] = useState(45);
  const [roomNames, setRoomNames] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savingRooms, setSavingRooms] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCompanyName(settings?.companyName ?? "Memorial Cloud");
    setHeartbeatOfflineSeconds(settings?.heartbeatOfflineSeconds ?? 45);
    setRoomNames(Object.fromEntries(rooms.map((view) => [view.room.id, view.room.name])));
  }, [open, rooms, settings]);

  async function handleSave() {
    setSaving(true);
    try {
      await saveSettings({
        companyName: companyName.trim() || "Memorial Cloud",
        heartbeatOfflineSeconds,
      });
      toast.success("Configuracoes salvas.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar configuracoes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleImage(kind: "logo" | "defaultScreen", file: File | undefined) {
    if (!file) return;
    setSaving(true);
    try {
      await uploadSettingsImage(kind, file);
      toast.success(kind === "logo" ? "Logo enviada." : "Tela padrao enviada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha no upload.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveRooms() {
    setSavingRooms(true);
    try {
      const changedRooms = rooms.filter((view) => roomNames[view.room.id] !== view.room.name);
      await Promise.all(
        changedRooms.map((view) => updateRoomName(view.room.id, roomNames[view.room.id] ?? "")),
      );
      toast.success(
        changedRooms.length > 0
          ? "Nomes das salas atualizados."
          : "Nenhuma sala precisava ser atualizada.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar nomes das salas.");
    } finally {
      setSavingRooms(false);
    }
  }

  async function handleDeactivateRoom(view: RoomViewModel) {
    if (
      !window.confirm(
        `Desativar ${view.room.name}? Ela saira do painel, mas historico e IDs serao preservados.`,
      )
    ) {
      return;
    }
    setSavingRooms(true);
    try {
      await deactivateRoom(view.room);
      toast.success("Sala desativada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao desativar sala.");
    } finally {
      setSavingRooms(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-surface sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configuracoes gerais</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Nome da funeraria">
            <Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
          </Field>
          <Field label="Intervalo para considerar Player offline (segundos)">
            <Input
              type="number"
              min={15}
              value={heartbeatOfflineSeconds}
              onChange={(event) => setHeartbeatOfflineSeconds(Number(event.target.value))}
            />
          </Field>
          <Separator />
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold tracking-tight">Nomes das salas</h3>
              <p className="text-xs text-muted-foreground">
                O nome visivel pode mudar. IDs e Players seguem estaveis para integracao.
              </p>
            </div>
            <div className="grid max-h-64 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
              {rooms.map((view) => (
                <div key={view.room.id} className="space-y-2">
                  <Field
                    label={`Sala ${String(view.room.number).padStart(2, "0")} · ${view.room.playerId}`}
                  >
                    <Input
                      value={roomNames[view.room.id] ?? ""}
                      maxLength={40}
                      onChange={(event) =>
                        setRoomNames((current) => ({
                          ...current,
                          [view.room.id]: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full border-destructive/40 text-destructive hover:bg-destructive/10"
                    disabled={savingRooms}
                    onClick={() => handleDeactivateRoom(view)}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Desativar sala
                  </Button>
                  <div className="rounded-md border border-border bg-background/45 px-3 py-2 text-xs text-muted-foreground">
                    {view.device
                      ? `${view.device.deviceName} · ${view.device.online ? "online" : "offline"}`
                      : "Nenhum dispositivo registrado"}
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="secondary"
              className="w-full"
              disabled={savingRooms}
              onClick={handleSaveRooms}
            >
              {savingRooms ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar nomes das salas
            </Button>
          </section>
          <Separator />
          <div className="grid gap-3 md:grid-cols-2">
            <label className="rounded-md border border-border bg-background/45 p-3 text-sm">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleImage("logo", event.target.files?.[0])}
              />
              <Upload className="mb-2 h-4 w-4 text-muted-foreground" />
              Enviar logo
            </label>
            <label className="rounded-md border border-border bg-background/45 p-3 text-sm">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => handleImage("defaultScreen", event.target.files?.[0])}
              />
              <Upload className="mb-2 h-4 w-4 text-muted-foreground" />
              Tela institucional
            </label>
          </div>
          <Button className="w-full" disabled={saving} onClick={handleSave}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar configuracoes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateRoomDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<Awaited<ReturnType<typeof createRoom>> | null>(null);

  useEffect(() => {
    if (!open) {
      setName("");
      setCreated(null);
      setSaving(false);
    }
  }, [open]);

  async function handleCreateRoom() {
    setSaving(true);
    try {
      const result = await createRoom(name);
      setCreated(result);
      toast.success("Sala criada com Player provisionado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao criar sala.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-surface sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova sala</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Nome da sala">
            <Input
              value={name}
              maxLength={40}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Capela Principal"
            />
          </Field>
          <Button className="w-full" disabled={saving || !name.trim()} onClick={handleCreateRoom}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Criar sala e Player
          </Button>

          {created && (
            <section className="space-y-3 rounded-md border border-border bg-background/45 p-4 text-sm">
              <div className="flex items-center gap-2 font-semibold">
                <KeyRound className="h-4 w-4 text-primary" />
                Sala pronta para registro
              </div>
              <CredentialLine label="Sala" value={`${created.roomId} · ${created.playerId}`} />
              <CredentialLine label="URL do Player" value={created.playerUrl} copy />
              <p className="text-xs text-muted-foreground">
                Abra o Memorial Player no mini computador, acesse /setup e selecione esta sala.
              </p>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CredentialLine({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="grid gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <button
        className="flex min-w-0 items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2 text-left"
        onClick={() => copy && copyText(value)}
      >
        <span className="truncate">{value}</span>
        {copy && <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
    </div>
  );
}

function FirebaseSetupScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-xl rounded-lg border border-border bg-surface p-6">
        <h1 className="text-lg font-semibold">Firebase ainda nao configurado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Crie um arquivo `.env` com as variaveis `VITE_FIREBASE_API_KEY`,
          `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET` e
          `VITE_FIREBASE_APP_ID`.
        </p>
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {label}
      </div>
    </div>
  );
}

function formatTimestamp(value: { toDate?: () => Date } | null) {
  return value?.toDate ? formatDateTime(value.toDate()) : "sem registro";
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getPlayerUrl(room: Room) {
  if (room.playerUrl) return room.playerUrl;
  return `/sala/${room.id}`;
}

function copyText(value: string) {
  void navigator.clipboard
    ?.writeText(value)
    .then(() => toast.success("Copiado."))
    .catch(() => toast.error("Nao foi possivel copiar."));
}

function readVideoDuration(file: File) {
  return new Promise<number>((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration || 0);
    };
    video.onerror = () => resolve(Number.POSITIVE_INFINITY);
    video.src = URL.createObjectURL(file);
  });
}
