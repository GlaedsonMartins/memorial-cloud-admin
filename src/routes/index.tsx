import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Activity,
  AlertTriangle,
  Copy,
  Clock,
  FileAudio,
  Image as ImageIcon,
  KeyRound,
  Loader2,
  LogOut,
  Music,
  Play,
  Plus,
  Radio,
  PencilLine,
  Save,
  Settings as SettingsIcon,
  Square,
  Trash2,
  Upload,
  Video,
  Volume2,
  VolumeX,
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
import { Slider } from "@/components/ui/slider";
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
  createPlaylist,
  deactivateRoom,
  deleteTribute,
  deletePlaylist,
  deleteRoomDevice,
  deleteSettingsImage,
  addPlaylistTrack,
  endTribute,
  movePlaylistTrack,
  removePlaylistTrack,
  saveSettings,
  startTribute,
  updateTributeAudioSettings,
  updateTribute,
  updatePlaylist,
  updateRoomName,
  uploadSettingsImage,
} from "@/services/memorialService";
import {
  ALLOWED_SLIDE_DURATIONS,
  DEFAULT_AUDIO_SETTINGS,
  normalizeAudioSettings,
  MAX_PHOTOS_PER_TRIBUTE,
  MAX_VIDEO_SECONDS,
  type MediaItem,
  type AudioSettings,
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

function MediaSettingCard({
  title,
  description,
  imageUrl,
  emptyLabel,
  onReplace,
  onRemove,
  disabled,
  children,
}: {
  title: string;
  description: string;
  imageUrl: string | null | undefined;
  emptyLabel: string;
  onReplace: () => void;
  onRemove: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      {children}
      <div className="flex items-start gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-background">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="px-2 text-center text-[11px] text-muted-foreground">{emptyLabel}</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{title}</div>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              disabled={disabled}
              onClick={onReplace}
            >
              <Upload className="mr-2 h-3.5 w-3.5" />
              Trocar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-destructive/40 text-destructive hover:bg-destructive/10"
              disabled={disabled || !imageUrl}
              onClick={onRemove}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Excluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

type VideoDraftItem = {
  file: File;
  muted: boolean;
};

function RoomCard({ view, onManage }: { view: RoomViewModel; onManage: () => void }) {
  const mediaCount = (view.tribute?.photos.length ?? 0) + (view.tribute?.videos.length ?? 0);
  const currentPhoto = view.tribute?.photos[0];
  const displayName = view.device?.deviceName?.trim() || view.room.name;

  return (
    <section className="flex min-h-[320px] flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-xs font-semibold tabular-nums">
            {String(view.room.number).padStart(2, "0")}
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-primary">{displayName}</h3>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Sala {String(view.room.number).padStart(2, "0")} · {view.room.playerId}
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
  const [existingPhotos, setExistingPhotos] = useState<MediaItem[]>([]);
  const [existingVideos, setExistingVideos] = useState<MediaItem[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<VideoDraftItem[]>([]);
  const [playlistId, setPlaylistId] = useState("");
  const [playlistEditorOpen, setPlaylistEditorOpen] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [slideDuration, setSlideDuration] = useState<SlideDuration>(5);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const [audioSaving, setAudioSaving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const activeTribute = roomView?.tribute ?? null;
  const selectedRoomId = roomView?.room.id ?? null;
  const editingPlaylist = playlists.find((playlist) => playlist.id === editingPlaylistId) ?? null;

  useEffect(() => {
    if (!open || !selectedRoomId) return;
    setName(activeTribute?.name ?? "");
    setNotes(activeTribute?.notes ?? "");
    setPlaylistId(activeTribute?.playlistId ?? playlists[0]?.id ?? "");
    setSlideDuration(activeTribute?.slideDuration ?? 5);
    setAudioSettings(normalizeAudioSettings(activeTribute?.audioSettings));
    setExistingPhotos(sortMedia(activeTribute?.photos ?? []));
    setExistingVideos(sortMedia(activeTribute?.videos ?? []).map(normalizeVideoItem));
    setPhotos([]);
    setVideos([]);
    setUploadProgress(0);
  }, [activeTribute, open, playlists, selectedRoomId]);

  useEffect(() => {
    if (!open) return;
    if (playlists.length === 0) {
      if (playlistId !== "") setPlaylistId("");
      return;
    }

    const playlistExists = playlists.some((item) => item.id === playlistId);
    if (!playlistExists) {
      setPlaylistId(
        activeTribute?.playlistId && playlists.some((item) => item.id === activeTribute.playlistId)
          ? activeTribute.playlistId
          : (playlists[0]?.id ?? ""),
      );
    }
  }, [activeTribute?.playlistId, open, playlistId, playlists]);

  const totalPhotos = existingPhotos.length + photos.length;
  const canSubmit = Boolean(
    roomView &&
    name.trim() &&
    playlistId &&
    !saving &&
    (activeTribute ? totalPhotos > 0 : photos.length > 0),
  );

  async function handlePhotoFiles(files: FileList | null) {
    if (!files) return;
    const allowedPhotoTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/pjpeg",
      "image/x-png",
    ];
    const allowedPhotoExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const acceptedFiles: File[] = [];
    const rejectedFiles: File[] = [];

    for (const file of Array.from(files)) {
      const typeAllowed = allowedPhotoTypes.includes(file.type);
      const extension = String(file.name).toLowerCase().split(".").pop();
      const extensionAllowed = extension ? allowedPhotoExtensions.includes(`.${extension}`) : false;
      if (typeAllowed || extensionAllowed) {
        acceptedFiles.push(file);
      } else {
        rejectedFiles.push(file);
      }
    }

    if (rejectedFiles.length > 0) {
      toast.error(`${rejectedFiles.length} arquivo(s) nao aceito(s). Use JPG, PNG ou WEBP.`);
    }

    if (acceptedFiles.length === 0) {
      return;
    }

    const available = MAX_PHOTOS_PER_TRIBUTE - existingPhotos.length - photos.length;
    if (available <= 0) {
      toast.warning(`Limite de ${MAX_PHOTOS_PER_TRIBUTE} fotos por homenagem.`);
      return;
    }

    if (acceptedFiles.length > available) {
      toast.warning(`Limite de ${MAX_PHOTOS_PER_TRIBUTE} fotos por homenagem.`);
    }

    setPhotos((current) => [...current, ...acceptedFiles.slice(0, available)]);
    toast.success(
      `${Math.min(acceptedFiles.length, available)} foto(s) adicionada(s) ao rascunho.`,
    );
  }

  async function handleVideoFiles(files: FileList | null) {
    if (!files) return;
    const checked: VideoDraftItem[] = [];
    for (const file of Array.from(files).filter((item) => item.type.startsWith("video/"))) {
      const duration = await readVideoDuration(file);
      if (duration > MAX_VIDEO_SECONDS) {
        toast.error(`${file.name} ultrapassa 1 minuto.`);
      } else {
        checked.push({ file, muted: true });
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
        existingPhotos,
        existingVideos,
        photos,
        videos,
        playlistId,
        slideDuration,
        audioSettings,
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

  async function handleAudioSettingsSave() {
    if (!activeTribute) return;
    setAudioSaving(true);
    try {
      await updateTributeAudioSettings(activeTribute.id, audioSettings);
      toast.success("Volume da homenagem atualizado na TV.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao atualizar o volume.");
    } finally {
      setAudioSaving(false);
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
      toast.success("Homenagem encerrada.");
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
        className="scrollbar-hide w-full overflow-y-auto border-border bg-surface p-0 sm:max-w-2xl"
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
              <AudioSettingsSection
                settings={audioSettings}
                disabled={saving || audioSaving}
                onChange={setAudioSettings}
                onSave={activeTribute ? handleAudioSettingsSave : undefined}
              />
            </TabsContent>

            <TabsContent value="media" className="mt-5 space-y-4">
              <MusicLibrarySection
                playlists={playlists}
                selectedPlaylistId={playlistId}
                activePlaylistId={activeTribute?.playlistId ?? null}
                onSelectPlaylist={setPlaylistId}
                onCreatePlaylist={() => {
                  setEditingPlaylistId(null);
                  setPlaylistEditorOpen(true);
                }}
                onEditPlaylist={(playlist) => {
                  setEditingPlaylistId(playlist.id);
                  setPlaylistEditorOpen(true);
                }}
              />

              <UploadBox
                icon={<ImageIcon className="h-4 w-4" />}
                title="Adicionar fotos"
                description="JPG, PNG ou WEBP · maximo 20"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/jpg,image/png,image/webp,image/*"
                multiple
                onChange={handlePhotoFiles}
              />
              <SavedMediaList
                items={existingPhotos}
                kind="photo"
                saving={saving}
                onRemove={(id) =>
                  setExistingPhotos((items) => items.filter((item) => item.id !== id))
                }
                onReplace={(id, file) => {
                  setExistingPhotos((items) => items.filter((item) => item.id !== id));
                  setPhotos((items) => [...items, file]);
                  toast.success("Foto marcada para troca.");
                }}
              />
              <FileList
                files={photos}
                kind="photo"
                onRemove={(index) => setPhotos((items) => items.filter((_, i) => i !== index))}
              />

              <UploadBox
                icon={<Video className="h-4 w-4" />}
                title="Adicionar videos"
                description="Videos de ate 1 minuto"
                accept="video/*"
                multiple
                onChange={handleVideoFiles}
              />
              <SavedMediaList
                items={existingVideos}
                kind="video"
                saving={saving}
                onRemove={(id) =>
                  setExistingVideos((items) => items.filter((item) => item.id !== id))
                }
                onToggleMuted={(id, muted) =>
                  setExistingVideos((items) =>
                    items.map((item) => (item.id === id ? { ...item, videoMuted: muted } : item)),
                  )
                }
                onReplace={async (id, file) => {
                  const duration = await readVideoDuration(file);
                  if (duration > MAX_VIDEO_SECONDS) {
                    toast.error(`${file.name} ultrapassa 1 minuto.`);
                    return;
                  }
                  const nextMuted =
                    existingVideos.find((item) => item.id === id)?.videoMuted ?? true;
                  setExistingVideos((items) => items.filter((item) => item.id !== id));
                  setVideos((items) => [...items, { file, muted: nextMuted }]);
                  toast.success("Video marcado para troca.");
                }}
              />
              <VideoDraftList
                items={videos}
                onRemove={(index) => setVideos((items) => items.filter((_, i) => i !== index))}
                onToggleMuted={(index) =>
                  setVideos((items) =>
                    items.map((item, currentIndex) =>
                      currentIndex === index ? { ...item, muted: !item.muted } : item,
                    ),
                  )
                }
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

        <PlaylistEditorDialog
          open={playlistEditorOpen}
          playlist={editingPlaylist}
          onOpenChange={(open) => {
            setPlaylistEditorOpen(open);
            if (!open) {
              setEditingPlaylistId(null);
            }
          }}
          onSaved={(playlistId, created) => {
            if (created) {
              setPlaylistId(playlistId);
            }
          }}
          onDeleted={(deletedPlaylistId) => {
            setPlaylistId((current) => {
              if (current !== deletedPlaylistId) return current;
              return playlists.find((item) => item.id !== deletedPlaylistId)?.id ?? "";
            });
          }}
        />
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

function AudioSettingsSection({
  settings,
  disabled,
  onChange,
  onSave,
}: {
  settings: AudioSettings;
  disabled: boolean;
  onChange: (settings: AudioSettings) => void;
  onSave?: () => void;
}) {
  const controls = [
    {
      key: "masterVolume" as const,
      label: "Volume geral",
      description: "Controla toda a homenagem.",
      value: Math.round(settings.masterVolume * 100),
      max: 100,
      step: 1,
      suffix: "%",
    },
    {
      key: "musicVolume" as const,
      label: "Volume da musica",
      description: "Pode amplificar a playlist ate 200%.",
      value: Math.round(settings.musicVolume * 200),
      max: 200,
      step: 1,
      suffix: "%",
    },
    {
      key: "videoVolume" as const,
      label: "Volume dos videos",
      description: "Controla o audio original dos videos.",
      value: Math.round(settings.videoVolume * 100),
      max: 100,
      step: 1,
      suffix: "%",
    },
  ];

  return (
    <section className="rounded-md border border-border bg-background/45 p-4">
      <div className="mb-4 flex items-start gap-3">
        <Volume2 className="mt-0.5 h-4 w-4 text-primary" />
        <div>
          <h3 className="text-sm font-semibold">Volume da homenagem</h3>
          <p className="text-xs text-muted-foreground">
            Ajuste a musica e os videos sem alterar os arquivos.
          </p>
        </div>
      </div>
      <div className="space-y-5">
        {controls.map((control) => (
          <div key={control.key} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-medium">{control.label}</div>
                <div className="text-muted-foreground">{control.description}</div>
              </div>
              <span className="tabular-nums text-primary">
                {control.value}
                {control.suffix}
              </span>
            </div>
            <Slider
              min={0}
              max={control.max}
              step={control.step}
              value={[control.value]}
              disabled={disabled}
              onValueChange={([value]) => {
                onChange({
                  ...settings,
                  [control.key]: value / control.max,
                });
              }}
              aria-label={control.label}
            />
          </div>
        ))}
      </div>
      {onSave && (
        <Button className="mt-5 h-9 w-full" disabled={disabled} onClick={onSave}>
          {audioSavingLabel(disabled)}
        </Button>
      )}
    </section>
  );
}

function audioSavingLabel(disabled: boolean) {
  return disabled ? "Atualizando volume..." : "Aplicar volume na TV";
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

function SavedMediaList({
  items,
  kind,
  saving,
  onRemove,
  onReplace,
  onToggleMuted,
}: {
  items: MediaItem[];
  kind: "photo" | "video";
  saving: boolean;
  onRemove: (id: string) => void;
  onReplace: (id: string, file: File) => void | Promise<void>;
  onToggleMuted?: (id: string, muted: boolean) => void;
}) {
  if (items.length === 0) return null;
  const accept = kind === "photo" ? ".jpg,.jpeg,.png,.webp,image/*" : "video/*";
  const title = kind === "photo" ? "Fotos carregadas" : "Videos carregados";

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{title}</span>
        <span className="tabular-nums">{items.length}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-md border border-border bg-background/45"
          >
            <div className="relative aspect-video bg-black/70">
              {kind === "photo" ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <video
                  src={item.url}
                  className="h-full w-full object-cover"
                  muted={item.videoMuted !== false}
                  preload="metadata"
                />
              )}
              <Badge className="absolute left-2 top-2 rounded-sm bg-black/70 text-white">
                {String(index + 1).padStart(2, "0")}
              </Badge>
              {kind === "video" && (
                <Badge className="absolute right-2 top-2 rounded-sm bg-black/70 text-white">
                  {item.videoMuted === false ? "Com som" : "Mutado"}
                </Badge>
              )}
            </div>
            <div className="space-y-2 p-3">
              <div className="truncate text-sm font-medium">{item.name}</div>
              {kind === "video" && onToggleMuted && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-full justify-start"
                  disabled={saving}
                  onClick={() => onToggleMuted(item.id, item.videoMuted === false)}
                >
                  {item.videoMuted === false ? (
                    <VolumeX className="mr-2 h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="mr-2 h-3.5 w-3.5" />
                  )}
                  {item.videoMuted === false ? "Mutar video" : "Ativar som"}
                </Button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="secondary" size="sm" className="h-8" disabled={saving}>
                  <label>
                    <input
                      type="file"
                      className="hidden"
                      accept={accept}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (file) void onReplace(item.id, file);
                      }}
                    />
                    <Upload className="h-3.5 w-3.5" />
                    Trocar
                  </label>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-destructive/40 text-destructive hover:bg-destructive/10"
                  disabled={saving}
                  onClick={() => onRemove(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FileList({
  files,
  kind,
  onRemove,
}: {
  files: File[];
  kind: "photo" | "video";
  onRemove: (index: number) => void;
}) {
  if (files.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">
        {kind === "photo" ? "Fotos novas" : "Videos novos"}
      </div>
      {files.map((file, index) => (
        <div
          key={`${file.name}-${index}`}
          className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-md border border-border bg-background/45 px-3 py-2 text-sm"
        >
          <FilePreview file={file} kind={kind} />
          <span className="truncate">
            {String(index + 1).padStart(2, "0")} · {file.name}
          </span>
          <button
            type="button"
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

function VideoDraftList({
  items,
  onRemove,
  onToggleMuted,
}: {
  items: VideoDraftItem[];
  onRemove: (index: number) => void;
  onToggleMuted: (index: number) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">Videos novos</div>
      {items.map((item, index) => (
        <div
          key={`${item.file.name}-${index}`}
          className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-md border border-border bg-background/45 px-3 py-2 text-sm"
        >
          <FilePreview file={item.file} kind="video" />
          <span className="truncate">
            {String(index + 1).padStart(2, "0")} · {item.file.name}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 px-3"
              onClick={() => onToggleMuted(index)}
            >
              {item.muted ? (
                <VolumeX className="mr-2 h-3.5 w-3.5" />
              ) : (
                <Volume2 className="mr-2 h-3.5 w-3.5" />
              )}
              {item.muted ? "Mutado" : "Com som"}
            </Button>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => onRemove(index)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function FilePreview({ file, kind }: { file: File; kind: "photo" | "video" }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  return (
    <div className="aspect-square overflow-hidden rounded-sm border border-border bg-black/70">
      {kind === "photo" ? (
        <img src={url} alt={file.name} className="h-full w-full object-cover" />
      ) : (
        <video src={url} className="h-full w-full object-cover" muted preload="metadata" />
      )}
    </div>
  );
}

function MusicLibrarySection({
  playlists,
  selectedPlaylistId,
  activePlaylistId,
  onSelectPlaylist,
  onCreatePlaylist,
  onEditPlaylist,
}: {
  playlists: Playlist[];
  selectedPlaylistId: string;
  activePlaylistId: string | null;
  onSelectPlaylist: (playlistId: string) => void;
  onCreatePlaylist: () => void;
  onEditPlaylist: (playlist: Playlist) => void;
}) {
  const grouped = groupPlaylistsByCategory(playlists);
  const selectedPlaylist = playlists.find((playlist) => playlist.id === selectedPlaylistId) ?? null;

  return (
    <section className="space-y-3 rounded-md border border-border bg-background/45 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Music className="h-4 w-4" />
            Musica de fundo
          </div>
          <p className="text-xs text-muted-foreground">
            Selecione a playlist que vai tocar junto do slide.
          </p>
        </div>
        <Button variant="secondary" size="sm" className="h-8" onClick={onCreatePlaylist}>
          <Plus className="mr-2 h-3.5 w-3.5" />
          Nova playlist
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface/70 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Playlist da homenagem
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="min-w-[240px] flex-1">
              <Select value={selectedPlaylistId} onValueChange={onSelectPlaylist}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione a playlist" />
                </SelectTrigger>
                <SelectContent>
                  {playlists.map((playlist) => (
                    <SelectItem key={playlist.id} value={playlist.id}>
                      {playlist.name} · {playlistCategoryLabel(playlist.category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPlaylist && (
              <>
                <Badge variant="outline" className="h-5 rounded-sm px-1.5 text-[10px]">
                  {playlistCategoryLabel(selectedPlaylist.category)}
                </Badge>
                <Badge className="h-5 rounded-sm border-primary/40 bg-primary/10 px-1.5 text-[10px] text-primary">
                  escolhida
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>

      {playlists.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-background/60 px-4 py-5 text-sm text-muted-foreground">
          Nenhuma playlist cadastrada.
        </div>
      ) : (
        <div className="space-y-4">
          {(["CATOLICA", "EVANGELICA"] as const).map((category) => (
            <div key={category} className="space-y-2">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {playlistCategoryLabel(category)}
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {grouped[category].map((playlist) => {
                  const selected = playlist.id === selectedPlaylistId;
                  const active = playlist.id === activePlaylistId;
                  return (
                    <article
                      key={playlist.id}
                      className={cn(
                        "rounded-md border px-3 py-3 transition-colors",
                        selected
                          ? "border-primary/70 bg-primary/10 shadow-[0_0_0_1px_rgba(59,130,246,0.18)]"
                          : "border-border bg-surface/80 hover:bg-background",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">{playlist.name}</span>
                            {active && (
                              <Badge className="h-5 rounded-sm border-status-live/40 bg-status-live/15 px-1.5 text-[10px] text-status-live">
                                ativa
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {playlist.tracks.length} faixa(s)
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => onEditPlaylist(playlist)}
                          >
                            <PencilLine className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PlaylistEditorDialog({
  open,
  playlist,
  onOpenChange,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  playlist: Playlist | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (playlistId: string, created: boolean) => void;
  onDeleted: (playlistId: string) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Playlist["category"]>("CATOLICA");
  const [saving, setSaving] = useState(false);
  const [trackSaving, setTrackSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const trackInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(playlist?.name ?? "");
    setCategory(playlist?.category ?? "CATOLICA");
    setSaving(false);
    setTrackSaving(false);
    setUploadProgress(0);
  }, [open, playlist]);

  const isNativePlaylist =
    playlist?.id === "playlist-catolica" || playlist?.id === "playlist-evangelica";
  const normalizedTracks = (playlist?.tracks ?? []).slice().sort((a, b) => a.order - b.order);

  async function handleSave() {
    setSaving(true);
    try {
      if (playlist) {
        await updatePlaylist(playlist.id, { name, category });
        toast.success("Playlist atualizada.");
        onSaved(playlist.id, false);
      } else {
        const playlistId = await createPlaylist(name, category);
        toast.success("Playlist criada.");
        onSaved(playlistId, true);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar playlist.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!playlist) return;
    if (isNativePlaylist) {
      toast.error("As playlists nativas nao podem ser excluidas.");
      return;
    }
    if (!window.confirm(`Excluir a playlist ${playlist.name}?`)) return;
    setSaving(true);
    try {
      await deletePlaylist(playlist);
      toast.success("Playlist excluida.");
      onDeleted(playlist.id);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao excluir playlist.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddTracks(files: File[]) {
    if (!playlist || !files || files.length === 0) return;
    setTrackSaving(true);
    try {
      for (const file of Array.from(files)) {
        await addPlaylistTrack(playlist.id, file, setUploadProgress);
      }
      toast.success("Faixa(s) enviada(s).");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao enviar faixa.";
      toast.error(`Falha ao enviar MP3 para ${playlist.name}: ${message}`);
    } finally {
      setTrackSaving(false);
      setUploadProgress(0);
    }
  }

  async function handleRemoveTrack(trackId: string) {
    if (!playlist) return;
    setTrackSaving(true);
    try {
      await removePlaylistTrack(playlist.id, trackId);
      toast.success("Faixa removida.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao remover faixa.");
    } finally {
      setTrackSaving(false);
    }
  }

  async function handleMoveTrack(trackId: string, direction: "up" | "down") {
    if (!playlist) return;
    setTrackSaving(true);
    try {
      await movePlaylistTrack(playlist.id, trackId, direction);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao reordenar faixa.");
    } finally {
      setTrackSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="scrollbar-hide max-h-[90vh] overflow-y-auto border-border bg-surface sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{playlist ? "Editar playlist" : "Nova playlist"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nome">
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </Field>
            <Field label="Categoria">
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as Playlist["category"])}
                disabled={isNativePlaylist}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CATOLICA">Catolica</SelectItem>
                  <SelectItem value="EVANGELICA">Evangelica</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {playlist ? (
            <section className="space-y-3 rounded-md border border-border bg-background/45 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">Faixas da playlist</h3>
                  <p className="text-xs text-muted-foreground">
                    Adicione MP3, remova ou reorganize a ordem de execucao.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-9 gap-2"
                  disabled={trackSaving}
                  onClick={() => {
                    const input = trackInputRef.current;
                    if (!input) return;
                    if (typeof input.showPicker === "function") {
                      input.showPicker();
                      return;
                    }
                    input.click();
                  }}
                >
                  <FileAudio className="h-4 w-4" />
                  Adicionar MP3
                </Button>
                <input
                  ref={trackInputRef}
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/*,.mp3"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    event.target.value = "";
                    void handleAddTracks(files);
                  }}
                />
              </div>

              {trackSaving && (
                <div className="space-y-2 rounded-md border border-border bg-background/45 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Enviando arquivo</span>
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

              {normalizedTracks.length === 0 ? (
                <div className="rounded-md border border-dashed border-border bg-background/60 px-4 py-5 text-sm text-muted-foreground">
                  Nenhuma faixa adicionada ainda.
                </div>
              ) : (
                <div className="space-y-2">
                  {normalizedTracks.map((track, index) => (
                    <div
                      key={track.id}
                      className="grid gap-3 rounded-md border border-border bg-surface px-3 py-3 md:grid-cols-[1fr_auto]"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{track.name}</span>
                          <Badge variant="outline" className="h-5 rounded-sm px-1.5 text-[10px]">
                            {String(index + 1).padStart(2, "0")}
                          </Badge>
                        </div>
                        <audio className="w-full" controls preload="none" src={track.url} />
                      </div>
                      <div className="flex items-start gap-2 md:justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={trackSaving || index === 0}
                          onClick={() => handleMoveTrack(track.id, "up")}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={trackSaving || index === normalizedTracks.length - 1}
                          onClick={() => handleMoveTrack(track.id, "down")}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-destructive/40 text-destructive hover:bg-destructive/10"
                          disabled={trackSaving}
                          onClick={() => handleRemoveTrack(track.id)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section className="rounded-md border border-dashed border-border bg-background/45 px-4 py-5 text-sm text-muted-foreground">
              Salve a playlist primeiro para adicionar faixas.
            </section>
          )}

          <div className="flex flex-wrap gap-2">
            <Button disabled={saving} onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              {playlist ? "Salvar alteracoes" : "Criar playlist"}
            </Button>
            {playlist && !isNativePlaylist && (
              <Button variant="destructive" disabled={saving} onClick={() => void handleDelete()}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir playlist
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function groupPlaylistsByCategory(playlists: Playlist[]) {
  return {
    CATOLICA: playlists.filter((playlist) => playlist.category === "CATOLICA"),
    EVANGELICA: playlists.filter((playlist) => playlist.category === "EVANGELICA"),
  } satisfies Record<Playlist["category"], Playlist[]>;
}

function playlistCategoryLabel(category: Playlist["category"]) {
  return category === "CATOLICA" ? "Catolica" : "Evangelica";
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
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const defaultScreenInputRef = useRef<HTMLInputElement | null>(null);

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

  async function handleDeleteImage(kind: "logo" | "defaultScreen") {
    const label = kind === "logo" ? "logo" : "tela institucional";
    if (!window.confirm(`Excluir ${label}?`)) return;
    setSaving(true);
    try {
      await deleteSettingsImage(kind);
      toast.success(kind === "logo" ? "Logo excluida." : "Tela institucional excluida.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao excluir imagem.");
    } finally {
      setSaving(false);
    }
  }

  function openImagePicker(kind: "logo" | "defaultScreen") {
    const input = kind === "logo" ? logoInputRef.current : defaultScreenInputRef.current;
    if (!input) return;
    input.click();
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
        `Excluir ${view.room.name} e todos os dados vinculados? Isso remove homenagens, dispositivos e arquivos da sala.`,
      )
    ) {
      return;
    }
    setSavingRooms(true);
    try {
      await deactivateRoom(view.room);
      toast.success("Sala excluida.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao excluir sala.");
    } finally {
      setSavingRooms(false);
    }
  }

  async function handleDeleteDevice(view: RoomViewModel) {
    const deviceLabel = view.device?.deviceName ?? "dispositivo vinculado";
    if (
      !window.confirm(
        `Excluir ${deviceLabel} da ${view.room.name}? Isso remove o vínculo para permitir um novo registro no Memorial Player.`,
      )
    ) {
      return;
    }

    setSavingRooms(true);
    try {
      await deleteRoomDevice(view.room.id);
      toast.success("Dispositivo desvinculado da sala.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao excluir dispositivo.");
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
            <div className="scrollbar-hide grid max-h-80 gap-4 overflow-y-auto pr-1 md:grid-cols-2">
              {rooms.map((view) => (
                <div
                  key={view.room.id}
                  className="space-y-3 rounded-lg border border-border bg-surface/80 p-4 shadow-sm"
                >
                  <div>
                    <div className="text-sm font-semibold tracking-tight text-primary">
                      {view.device?.deviceName?.trim() || view.room.name}
                    </div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Sala {String(view.room.number).padStart(2, "0")} - {view.room.playerId}
                    </div>
                  </div>
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
                    Excluir sala
                  </Button>
                  <div className="rounded-md border border-border bg-background/45 px-3 py-2 text-xs text-muted-foreground">
                    {view.device
                      ? `${view.device.deviceName} · ${view.device.online ? "online" : "offline"}`
                      : "Nenhum dispositivo registrado"}
                  </div>
                  {view.device && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-full border-destructive/40 text-destructive hover:bg-destructive/10"
                      disabled={savingRooms}
                      onClick={() => handleDeleteDevice(view)}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Excluir dispositivo
                    </Button>
                  )}
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
          <div className="grid gap-4 md:grid-cols-2">
            <MediaSettingCard
              title="Logo"
              description="Exibida no app quando configurada."
              imageUrl={settings?.logoUrl}
              emptyLabel="Nenhuma logo enviada"
              onReplace={() => openImagePicker("logo")}
              onRemove={() => void handleDeleteImage("logo")}
              disabled={saving}
            >
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  void handleImage("logo", file);
                }}
              />
            </MediaSettingCard>
            <MediaSettingCard
              title="Tela institucional"
              description="Mostrada quando a homenagem não estiver ativa."
              imageUrl={settings?.defaultScreenUrl}
              emptyLabel="Nenhuma tela institucional enviada"
              onReplace={() => openImagePicker("defaultScreen")}
              onRemove={() => void handleDeleteImage("defaultScreen")}
              disabled={saving}
            >
              <input
                ref={defaultScreenInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  void handleImage("defaultScreen", file);
                }}
              />
            </MediaSettingCard>
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

  useEffect(() => {
    if (!open) {
      setName("");
      setSaving(false);
    }
  }, [open]);

  async function handleCreateRoom() {
    setSaving(true);
    try {
      await createRoom(name);
      toast.success("Sala criada com Player provisionado.");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao criar sala.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="scrollbar-hide border-border bg-surface sm:max-w-lg">
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

function sortMedia(items: MediaItem[]) {
  return items.slice().sort((a, b) => a.order - b.order);
}

function normalizeVideoItem(item: MediaItem) {
  return {
    ...item,
    videoMuted: item.videoMuted ?? true,
  };
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
