import { useEffect, useMemo, useState } from "react";
import type { FirestoreError } from "firebase/firestore";
import { hasFirebaseConfig } from "@/firebase/client";
import {
  ensureBootstrapData,
  subscribeActiveSessions,
  subscribeDevices,
  subscribePlayerStatus,
  subscribePlaylists,
  subscribeRooms,
  subscribeSettings,
  subscribeTributes,
} from "@/services/memorialService";
import type {
  ActiveSession,
  Playlist,
  PlayerStatus,
  RegisteredDevice,
  Room,
  RoomStatus,
  RoomViewModel,
  Settings,
  Tribute,
} from "@/types/memorial";

function timestampMs(value: { toMillis?: () => number } | null | undefined) {
  return typeof value?.toMillis === "function" ? value.toMillis() : null;
}

function deriveRoomStatus(
  room: Room,
  tribute: Tribute | null,
  playerStatus: Pick<PlayerStatus, "online"> | Pick<RegisteredDevice, "online"> | null,
): RoomStatus {
  if (playerStatus && !playerStatus.online) return "PLAYER_OFFLINE";
  if (room.status === "SYNCING") return "SYNCING";
  if (tribute?.status === "ACTIVE" || room.activeTributeId) return "ACTIVE";
  return "FREE";
}

export function useMemorialData(userReady: boolean) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playerStatuses, setPlayerStatuses] = useState<PlayerStatus[]>([]);
  const [devices, setDevices] = useState<RegisteredDevice[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(hasFirebaseConfig);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasFirebaseConfig || !userReady) {
      setLoading(false);
      return;
    }

    let alive = true;
    const onError = (err: FirestoreError) => {
      setError(err.message);
      setLoading(false);
    };

    void ensureBootstrapData().catch((err) => {
      if (!alive) return;
      setError(err instanceof Error ? err.message : "Falha ao preparar dados iniciais.");
      setLoading(false);
    });

    const unsubscribers = [
      subscribeRooms((items) => {
        setRooms(items);
        setLoading(false);
      }, onError),
      subscribeTributes(setTributes, onError),
      subscribeActiveSessions(setActiveSessions, onError),
      subscribePlaylists(setPlaylists, onError),
      subscribePlayerStatus(setPlayerStatuses, onError),
      subscribeDevices(setDevices, onError),
      subscribeSettings(setSettings, onError),
    ];

    return () => {
      alive = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [userReady]);

  const roomViews = useMemo<RoomViewModel[]>(() => {
    return rooms
      .slice()
      .sort((a, b) => a.number - b.number)
      .map((room) => {
        const activeSession = activeSessions.find((session) => session.roomId === room.id) ?? null;
        const activeSessionTribute = activeSession
          ? tributes.find((item) => item.id === activeSession.tributeId) ?? null
          : null;
        const roomActiveTribute =
          tributes.find((item) => item.id === room.activeTributeId && item.status !== "ENDED") ?? null;
        const createdTribute =
          tributes
            .filter((item) => item.roomId === room.id && item.status === "CREATED")
            .sort((a, b) => (timestampMs(b.createdAt) ?? 0) - (timestampMs(a.createdAt) ?? 0))[0] ??
          null;
        const tribute = activeSessionTribute ?? roomActiveTribute ?? createdTribute ?? null;
        const playlist = playlists.find((item) => item.id === tribute?.playlistId) ?? null;
        const roomDevices = devices.filter((item) => item.roomId === room.id);
        const device =
          roomDevices
            .slice()
            .sort((a, b) => (timestampMs(b.lastSeen) ?? 0) - (timestampMs(a.lastSeen) ?? 0))[0] ??
          null;
        const playerStatus = playerStatuses.find((item) => item.roomId === room.id) ?? null;
        return {
          room,
          tribute,
          activeSession,
          playlist,
          playerStatus,
          device,
          status: deriveRoomStatus(room, tribute, device ?? playerStatus),
        };
      });
  }, [activeSessions, devices, playerStatuses, playlists, rooms, tributes]);

  const connectedPlayers = useMemo(
    () =>
      devices.length > 0
        ? devices.filter((device) => device.online).length
        : playerStatuses.filter((status) => status.online).length,
    [devices, playerStatuses],
  );
  const lastSyncMs = useMemo(
    () =>
      Math.max(
        0,
        ...(devices.length > 0
          ? devices.map((device) => timestampMs(device.lastSeen) ?? 0)
          : playerStatuses.map((status) => timestampMs(status.lastSync) ?? 0)),
      ),
    [devices, playerStatuses],
  );

  return {
    rooms,
    tributes,
    playlists,
    settings,
    roomViews,
    connectedPlayers,
    lastSyncMs,
    loading,
    error,
    configured: hasFirebaseConfig,
  };
}
