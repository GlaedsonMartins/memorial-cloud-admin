import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type DocumentData,
  type FirestoreError,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getFirebaseDb, getFirebaseFunctions } from "@/firebase/client";
import {
  deleteStoredFile,
  uploadFile,
  type UploadProgressHandler,
} from "@/services/storageService";
import {
  ROOM_COUNT,
  SCHEMA_VERSION,
  type ActiveSession,
  type CreateRoomResult,
  type MediaItem,
  type Playlist,
  type PlayerStatus,
  type RegisteredDevice,
  type Room,
  type Settings,
  type Tribute,
  type TributeDraft,
} from "@/types/memorial";

type CollectionName =
  | "rooms"
  | "tributes"
  | "active_sessions"
  | "playlists"
  | "player_status"
  | "devices"
  | "settings"
  | "history";

function withId<T>(snapshot: QueryDocumentSnapshot<DocumentData>) {
  return { id: snapshot.id, ...snapshot.data() } as T;
}

function subscribeCollection<T>(
  name: CollectionName,
  callback: (items: T[]) => void,
  onError: (error: FirestoreError) => void,
  orderedBy?: string,
): Unsubscribe {
  const db = getFirebaseDb();
  const base = collection(db, name);
  const ref = orderedBy ? query(base, orderBy(orderedBy)) : query(base);
  return onSnapshot(ref, (snapshot) => callback(snapshot.docs.map(withId<T>)), onError);
}

export function subscribeRooms(
  callback: (items: Room[]) => void,
  onError: (error: FirestoreError) => void,
) {
  return subscribeCollection<Room>(
    "rooms",
    (items) => callback(items.filter((room) => room.active !== false)),
    onError,
    "number",
  );
}

export function subscribeTributes(
  callback: (items: Tribute[]) => void,
  onError: (error: FirestoreError) => void,
) {
  return subscribeCollection<Tribute>("tributes", callback, onError, "createdAt");
}

export function subscribeActiveSessions(
  callback: (items: ActiveSession[]) => void,
  onError: (error: FirestoreError) => void,
) {
  return subscribeCollection<ActiveSession>("active_sessions", callback, onError);
}

export function subscribePlaylists(
  callback: (items: Playlist[]) => void,
  onError: (error: FirestoreError) => void,
) {
  return subscribeCollection<Playlist>("playlists", callback, onError, "name");
}

function normalizePlaylistTracks(tracks: Playlist["tracks"]) {
  return tracks
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((track, index) => ({ ...track, order: index + 1 }));
}

export function subscribePlayerStatus(
  callback: (items: PlayerStatus[]) => void,
  onError: (error: FirestoreError) => void,
) {
  return subscribeCollection<PlayerStatus>("player_status", callback, onError);
}

export function subscribeDevices(
  callback: (items: RegisteredDevice[]) => void,
  onError: (error: FirestoreError) => void,
) {
  return subscribeCollection<RegisteredDevice>("devices", callback, onError, "deviceName");
}

export function subscribeSettings(
  callback: (settings: Settings | null) => void,
  onError: (error: FirestoreError) => void,
) {
  const db = getFirebaseDb();
  return onSnapshot(
    doc(db, "settings", "general"),
    (snapshot) =>
      callback(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Settings) : null),
    onError,
  );
}

export async function ensureBootstrapData() {
  const db = getFirebaseDb();
  const roomSnapshot = await getDocs(collection(db, "rooms"));
  const playlistSnapshot = await getDocs(collection(db, "playlists"));
  const batch = writeBatch(db);

  const existingRoomIds = new Set(roomSnapshot.docs.map((item) => item.id));
  for (let number = 1; number <= ROOM_COUNT; number += 1) {
    const id = `room-${String(number).padStart(2, "0")}`;
    if (!existingRoomIds.has(id)) {
      batch.set(doc(db, "rooms", id), {
        name: `Sala ${String(number).padStart(2, "0")}`,
        number,
        playerId: `player-${String(number).padStart(2, "0")}`,
        playerUrl: `/sala/${number}`,
        active: true,
        status: "FREE",
        activeTributeId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: null,
        schemaVersion: SCHEMA_VERSION,
      });
    }
  }

  if (playlistSnapshot.empty) {
    [
      { id: "playlist-catolica", name: "Catolica", category: "CATOLICA" },
      { id: "playlist-evangelica", name: "Evangelica", category: "EVANGELICA" },
    ].forEach((playlist) => {
      batch.set(doc(db, "playlists", playlist.id), {
        name: playlist.name,
        category: playlist.category,
        tracks: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        schemaVersion: SCHEMA_VERSION,
      });
    });
  }

  batch.set(
    doc(db, "settings", "general"),
    {
      companyName: "Memorial Cloud",
      logoUrl: null,
      logoStoragePath: null,
      defaultScreenUrl: null,
      defaultScreenStoragePath: null,
      heartbeatOfflineSeconds: 45,
      updatedAt: serverTimestamp(),
      schemaVersion: SCHEMA_VERSION,
    },
    { merge: true },
  );

  await batch.commit();
}

export async function createPlaylist(name: string, category: Playlist["category"]) {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("O nome da playlist e obrigatorio.");
  }
  if (trimmedName.length > 60) {
    throw new Error("O nome da playlist deve ter no maximo 60 caracteres.");
  }

  const db = getFirebaseDb();
  const playlistRef = doc(collection(db, "playlists"));
  await setDoc(playlistRef, {
    name: trimmedName,
    category,
    tracks: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    schemaVersion: SCHEMA_VERSION,
  });
  return playlistRef.id;
}

export async function updatePlaylist(
  playlistId: string,
  updates: Pick<Playlist, "name" | "category">,
) {
  const trimmedName = updates.name.trim();
  if (!trimmedName) {
    throw new Error("O nome da playlist e obrigatorio.");
  }
  if (trimmedName.length > 60) {
    throw new Error("O nome da playlist deve ter no maximo 60 caracteres.");
  }

  await updateDoc(doc(getFirebaseDb(), "playlists", playlistId), {
    name: trimmedName,
    category: updates.category,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePlaylist(playlist: Playlist) {
  await Promise.all(playlist.tracks.map((track) => deleteStoredFile(track.storagePath)));
  await deleteDoc(doc(getFirebaseDb(), "playlists", playlist.id));
}

function isAudioFile(file: File) {
  const type = file.type.toLowerCase();
  return (
    type.includes("audio") ||
    type === "application/octet-stream" ||
    file.name.toLowerCase().endsWith(".mp3")
  );
}

export async function addPlaylistTrack(
  playlistId: string,
  file: File,
  onProgress?: UploadProgressHandler,
) {
  if (!isAudioFile(file)) {
    throw new Error("Envie apenas arquivos MP3.");
  }

  const db = getFirebaseDb();
  const playlistSnapshot = await getDoc(doc(db, "playlists", playlistId));
  if (!playlistSnapshot.exists()) {
    throw new Error("Playlist nao encontrada.");
  }
  const playlist = { id: playlistSnapshot.id, ...playlistSnapshot.data() } as Playlist;
  const upload = await uploadFile(file, `playlists/${playlist.id}/tracks`, onProgress);
  const nextTracks = normalizePlaylistTracks([
    ...playlist.tracks,
    {
      id: crypto.randomUUID(),
      name: upload.name,
      url: upload.url,
      storagePath: upload.storagePath,
      duration: null,
      order: playlist.tracks.length + 1,
      createdAt: serverTimestamp(),
    },
  ]);

  await updateDoc(doc(db, "playlists", playlist.id), {
    tracks: nextTracks,
    updatedAt: serverTimestamp(),
  });
}

export async function removePlaylistTrack(playlistId: string, trackId: string) {
  const db = getFirebaseDb();
  const playlistSnapshot = await getDoc(doc(db, "playlists", playlistId));
  if (!playlistSnapshot.exists()) {
    throw new Error("Playlist nao encontrada.");
  }
  const playlist = { id: playlistSnapshot.id, ...playlistSnapshot.data() } as Playlist;
  const track = playlist.tracks.find((item) => item.id === trackId);
  if (!track) return;

  const nextTracks = normalizePlaylistTracks(playlist.tracks.filter((item) => item.id !== trackId));
  await updateDoc(doc(db, "playlists", playlist.id), {
    tracks: nextTracks,
    updatedAt: serverTimestamp(),
  });
  await deleteStoredFile(track.storagePath);
}

export async function movePlaylistTrack(
  playlistId: string,
  trackId: string,
  direction: "up" | "down",
) {
  const db = getFirebaseDb();
  const playlistSnapshot = await getDoc(doc(db, "playlists", playlistId));
  if (!playlistSnapshot.exists()) {
    throw new Error("Playlist nao encontrada.");
  }
  const playlist = { id: playlistSnapshot.id, ...playlistSnapshot.data() } as Playlist;
  const tracks = normalizePlaylistTracks(playlist.tracks);
  const index = tracks.findIndex((item) => item.id === trackId);
  if (index < 0) return;
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= tracks.length) return;

  const nextTracks = tracks.slice();
  [nextTracks[index], nextTracks[swapIndex]] = [nextTracks[swapIndex], nextTracks[index]];
  const normalized = normalizePlaylistTracks(nextTracks);
  await updateDoc(doc(db, "playlists", playlist.id), {
    tracks: normalized,
    updatedAt: serverTimestamp(),
  });
}

export async function createTribute(
  draft: TributeDraft,
  userId: string,
  onProgress?: UploadProgressHandler,
) {
  const db = getFirebaseDb();
  const tributeRef = doc(collection(db, "tributes"));
  const baseFolder = `tributes/${tributeRef.id}`;
  const totalFiles = draft.photos.length + draft.videos.length;
  let completed = 0;

  const reportProgress = (fileProgress: number) => {
    if (totalFiles === 0) return onProgress?.(100);
    onProgress?.(Math.round((completed * 100 + fileProgress) / totalFiles));
  };

  const photos: MediaItem[] = [];
  for (const [index, file] of draft.photos.entries()) {
    const upload = await uploadFile(file, `${baseFolder}/photos`, reportProgress);
    completed += 1;
    photos.push({
      id: crypto.randomUUID(),
      name: upload.name,
      url: upload.url,
      storagePath: upload.storagePath,
      type: "image",
      order: index + 1,
      createdAt: null,
    });
  }

  const videos: MediaItem[] = [];
  for (const [index, file] of draft.videos.entries()) {
    const upload = await uploadFile(file, `${baseFolder}/videos`, reportProgress);
    completed += 1;
    videos.push({
      id: crypto.randomUUID(),
      name: upload.name,
      url: upload.url,
      storagePath: upload.storagePath,
      type: "video",
      order: index + 1,
      createdAt: null,
    });
  }

  const tributePayload = {
    name: draft.name,
    roomId: draft.roomId,
    photos,
    videos,
    playlistId: draft.playlistId,
    slideDuration: draft.slideDuration,
    notes: draft.notes,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    startedAt: null,
    endedAt: null,
    createdBy: userId,
    status: "CREATED",
    schemaVersion: SCHEMA_VERSION,
  };

  await setDoc(tributeRef, tributePayload);
  onProgress?.(100);
  return tributeRef.id;
}

export async function updateTribute(
  tribute: Tribute,
  draft: TributeDraft,
  onProgress?: UploadProgressHandler,
) {
  const db = getFirebaseDb();
  const baseFolder = `tributes/${tribute.id}`;
  const totalFiles = draft.photos.length + draft.videos.length;
  let completed = 0;
  const retainedPhotos = draft.existingPhotos ?? tribute.photos;
  const retainedVideos = draft.existingVideos ?? tribute.videos;

  const reportProgress = (fileProgress: number) => {
    if (totalFiles === 0) return onProgress?.(100);
    onProgress?.(Math.round((completed * 100 + fileProgress) / totalFiles));
  };

  const nextPhotos: MediaItem[] = retainedPhotos.map((item, index) => ({
    ...item,
    order: index + 1,
  }));
  for (const [index, file] of draft.photos.entries()) {
    const upload = await uploadFile(file, `${baseFolder}/photos`, reportProgress);
    completed += 1;
    nextPhotos.push({
      id: crypto.randomUUID(),
      name: upload.name,
      url: upload.url,
      storagePath: upload.storagePath,
      type: "image",
      order: retainedPhotos.length + index + 1,
      createdAt: null,
    });
  }

  const nextVideos: MediaItem[] = retainedVideos.map((item, index) => ({
    ...item,
    order: index + 1,
  }));
  for (const [index, file] of draft.videos.entries()) {
    const upload = await uploadFile(file, `${baseFolder}/videos`, reportProgress);
    completed += 1;
    nextVideos.push({
      id: crypto.randomUUID(),
      name: upload.name,
      url: upload.url,
      storagePath: upload.storagePath,
      type: "video",
      order: retainedVideos.length + index + 1,
      createdAt: null,
    });
  }

  const batch = writeBatch(db);
  batch.update(doc(db, "tributes", tribute.id), {
    name: draft.name,
    photos: nextPhotos,
    videos: nextVideos,
    playlistId: draft.playlistId,
    slideDuration: draft.slideDuration,
    notes: draft.notes,
    updatedAt: serverTimestamp(),
  });

  if (tribute.status === "ACTIVE") {
    batch.set(
      doc(db, "active_sessions", tribute.roomId),
      {
        playlistId: draft.playlistId,
        slideDuration: draft.slideDuration,
        status: "PLAYING",
        lastUpdate: serverTimestamp(),
        updatedAt: serverTimestamp(),
        schemaVersion: SCHEMA_VERSION,
      },
      { merge: true },
    );
  }

  await batch.commit();
  await Promise.all([
    ...findRemovedMedia(tribute.photos, retainedPhotos).map((item) =>
      deleteStoredFile(item.storagePath),
    ),
    ...findRemovedMedia(tribute.videos, retainedVideos).map((item) =>
      deleteStoredFile(item.storagePath),
    ),
  ]);
  onProgress?.(100);
}

function findRemovedMedia(previous: MediaItem[], retained: MediaItem[]) {
  const retainedIds = new Set(retained.map((item) => item.id));
  return previous.filter((item) => !retainedIds.has(item.id));
}

export async function startTribute(tribute: Tribute) {
  const db = getFirebaseDb();
  const batch = writeBatch(db);
  const roomRef = doc(db, "rooms", tribute.roomId);
  const tributeRef = doc(db, "tributes", tribute.id);
  const sessionRef = doc(db, "active_sessions", tribute.roomId);

  batch.update(tributeRef, {
    status: "ACTIVE",
    startedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.update(roomRef, {
    status: "ACTIVE",
    activeTributeId: tribute.id,
    updatedAt: serverTimestamp(),
  });
  batch.set(sessionRef, {
    roomId: tribute.roomId,
    tributeId: tribute.id,
    status: "PLAYING",
    startedAt: serverTimestamp(),
    endedAt: null,
    playlistId: tribute.playlistId,
    slideDuration: tribute.slideDuration,
    lastUpdate: serverTimestamp(),
    updatedAt: serverTimestamp(),
    schemaVersion: SCHEMA_VERSION,
  });

  await batch.commit();
}

export async function endTribute(room: Room, tribute: Tribute) {
  const db = getFirebaseDb();
  const batch = writeBatch(db);
  const historyRef = doc(db, "history", tribute.id);
  const tributeRef = doc(db, "tributes", tribute.id);
  const roomRef = doc(db, "rooms", room.id);
  const sessionRef = doc(db, "active_sessions", room.id);

  batch.set(historyRef, {
    ...tribute,
    status: "ENDED",
    endedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.update(tributeRef, {
    status: "ENDED",
    endedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.update(roomRef, {
    status: "FREE",
    activeTributeId: null,
    updatedAt: serverTimestamp(),
  });
  batch.set(
    sessionRef,
    {
      status: "ENDED",
      endedAt: serverTimestamp(),
      lastUpdate: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await batch.commit();
}

export async function deleteTribute(tribute: Tribute) {
  await Promise.all([
    ...tribute.photos.map((item) => deleteStoredFile(item.storagePath)),
    ...tribute.videos.map((item) => deleteStoredFile(item.storagePath)),
  ]);
  const db = getFirebaseDb();
  await deleteDoc(doc(db, "tributes", tribute.id));
}

export async function saveSettings(
  settings: Pick<Settings, "companyName" | "heartbeatOfflineSeconds">,
) {
  const db = getFirebaseDb();
  await setDoc(
    doc(db, "settings", "general"),
    {
      companyName: settings.companyName,
      heartbeatOfflineSeconds: settings.heartbeatOfflineSeconds,
      updatedAt: serverTimestamp(),
      schemaVersion: SCHEMA_VERSION,
    },
    { merge: true },
  );
}

export async function uploadSettingsImage(kind: "logo" | "defaultScreen", file: File) {
  const upload = await uploadFile(file, `settings/${kind}`);
  const db = getFirebaseDb();
  const payload =
    kind === "logo"
      ? { logoUrl: upload.url, logoStoragePath: upload.storagePath }
      : { defaultScreenUrl: upload.url, defaultScreenStoragePath: upload.storagePath };
  await setDoc(
    doc(db, "settings", "general"),
    { ...payload, updatedAt: serverTimestamp(), schemaVersion: SCHEMA_VERSION },
    { merge: true },
  );
}

export async function updateRoomName(roomId: string, name: string) {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("O nome da sala e obrigatorio.");
  }
  if (trimmedName.length > 40) {
    throw new Error("O nome da sala deve ter no maximo 40 caracteres.");
  }

  await updateDoc(doc(getFirebaseDb(), "rooms", roomId), {
    name: trimmedName,
    updatedAt: serverTimestamp(),
  });
}

export async function createRoom(name: string) {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("O nome da sala e obrigatorio.");
  }
  if (trimmedName.length > 40) {
    throw new Error("O nome da sala deve ter no maximo 40 caracteres.");
  }

  const callable = httpsCallable<{ name: string }, CreateRoomResult>(
    getFirebaseFunctions(),
    "createRoom",
  );
  const result = await callable({ name: trimmedName });
  return result.data;
}

export async function deactivateRoom(room: Room) {
  if (room.activeTributeId || room.status === "ACTIVE") {
    throw new Error("Encerre a homenagem ativa antes de desativar esta sala.");
  }

  await updateDoc(doc(getFirebaseDb(), "rooms", room.id), {
    active: false,
    status: "FREE",
    activeTributeId: null,
    updatedAt: serverTimestamp(),
  });
}

export async function updateRoomSyncing(roomId: string) {
  await updateDoc(doc(getFirebaseDb(), "rooms", roomId), {
    status: "SYNCING",
    updatedAt: serverTimestamp(),
  });
}
