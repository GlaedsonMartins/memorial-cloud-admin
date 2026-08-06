import type { Timestamp } from "firebase/firestore";

export const ROOM_COUNT = 6;
export const ALLOWED_SLIDE_DURATIONS = [5, 8, 10] as const;
export const MAX_PHOTOS_PER_TRIBUTE = 20;
export const MAX_VIDEO_SECONDS = 60;
export const SCHEMA_VERSION = 1;

export type SlideDuration = (typeof ALLOWED_SLIDE_DURATIONS)[number];
export type RoomStatus = "FREE" | "ACTIVE" | "PLAYER_OFFLINE" | "SYNCING";
export type TributeStatus = "CREATED" | "ACTIVE" | "ENDED" | "DELETED";
export type ActiveSessionStatus = "WAITING" | "PLAYING" | "ENDING" | "ENDED";
export type PlaylistCategory = "CATOLICA" | "EVANGELICA";
export type MediaType = "image" | "video";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  active: boolean;
  createdAt: Timestamp | null;
  schemaVersion: number;
}

export interface Room {
  id: string;
  name: string;
  number: number;
  playerId: string;
  playerUrl?: string | null;
  active: boolean;
  status: RoomStatus;
  activeTributeId: string | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  createdBy?: string | null;
  schemaVersion: number;
}

export interface CreateRoomResult {
  roomId: string;
  playerId: string;
  number: number;
  playerUrl: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  storagePath: string;
  type: MediaType;
  order: number;
  duration?: number;
  createdAt: Timestamp | null;
}

export interface PlaylistTrack {
  id: string;
  name: string;
  url: string;
  storagePath: string;
  duration: number | null;
  order: number;
  createdAt: Timestamp | null;
}

export interface Playlist {
  id: string;
  name: string;
  category: PlaylistCategory;
  tracks: PlaylistTrack[];
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  schemaVersion: number;
}

export interface Tribute {
  id: string;
  name: string;
  roomId: string;
  photos: MediaItem[];
  videos: MediaItem[];
  playlistId: string;
  slideDuration: SlideDuration;
  notes: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  startedAt: Timestamp | null;
  endedAt: Timestamp | null;
  createdBy: string;
  status: TributeStatus;
  schemaVersion: number;
}

export interface ActiveSession {
  id: string;
  roomId: string;
  tributeId: string;
  status: ActiveSessionStatus;
  startedAt: Timestamp | null;
  endedAt: Timestamp | null;
  playlistId: string;
  slideDuration: SlideDuration;
  lastUpdate: Timestamp | null;
  updatedAt: Timestamp | null;
  schemaVersion: number;
}

export interface PlayerStatus {
  id: string;
  roomId: string;
  online: boolean;
  lastHeartbeat: Timestamp | null;
  currentState: string;
  appVersion: string | null;
  lastSync: Timestamp | null;
  schemaVersion: number;
}

export interface RegisteredDevice {
  id: string;
  deviceId: string;
  deviceName: string;
  roomId: string;
  deviceToken?: string;
  setupCompleted: boolean;
  registeredAt: Timestamp | null;
  lastHeartbeat: Timestamp | null;
  lastSeen: Timestamp | null;
  online: boolean;
  currentState: string;
  appVersion: string | null;
  kioskEnabled: boolean;
  schemaVersion: number;
}

export interface Settings {
  id: string;
  companyName: string;
  logoUrl: string | null;
  logoStoragePath: string | null;
  defaultScreenUrl: string | null;
  defaultScreenStoragePath: string | null;
  heartbeatOfflineSeconds: number;
  updatedAt: Timestamp | null;
  schemaVersion: number;
}

export interface RoomViewModel {
  room: Room;
  tribute: Tribute | null;
  activeSession: ActiveSession | null;
  playlist: Playlist | null;
  playerStatus: PlayerStatus | null;
  device: RegisteredDevice | null;
  status: RoomStatus;
}

export interface TributeDraft {
  roomId: string;
  name: string;
  photos: File[];
  videos: File[];
  playlistId: string;
  slideDuration: SlideDuration;
  notes: string;
}
