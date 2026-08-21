import { randomBytes } from "node:crypto";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

initializeApp();

const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "memorial-cloud-5da8e";
const DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || "memorialcloud";
const SCHEMA_VERSION = 1;
const PLAYER_APP_VERSION = "1.0.0";
const db = getFirestore(DATABASE_ID);
const auth = getAuth();

function normalizeName(value) {
  const name = typeof value === "string" ? value.trim() : "";
  if (!name) {
    throw new HttpsError("invalid-argument", "O nome da sala e obrigatorio.");
  }
  if (name.length > 40) {
    throw new HttpsError("invalid-argument", "O nome da sala deve ter no maximo 40 caracteres.");
  }
  return name;
}

async function assertAdmin(context) {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Login administrativo obrigatorio.");
  }

  let authUser;
  try {
    authUser = await auth.getUser(uid);
  } catch (error) {
    if (error?.code === "auth/user-not-found") {
      throw new HttpsError("unauthenticated", "Conta administrativa removida.");
    }
    throw error;
  }
  if (authUser.disabled) {
    throw new HttpsError("permission-denied", "Conta administrativa desativada.");
  }

  const authTime = Number(context.auth.token.auth_time ?? 0);
  const tokensValidAfter = authUser.tokensValidAfterTime
    ? Math.floor(new Date(authUser.tokensValidAfterTime).getTime() / 1000)
    : 0;
  if (authTime > 0 && tokensValidAfter > 0 && authTime < tokensValidAfter) {
    throw new HttpsError("unauthenticated", "Sessao administrativa revogada.");
  }

  const userSnapshot = await db.collection("users").doc(uid).get();
  const user = userSnapshot.data();
  if (user?.active === true && user?.role === "ADMIN") return uid;

  throw new HttpsError("permission-denied", "Apenas administradores podem criar salas.");
}

async function deleteDeviceAuthUser(deviceId) {
  if (!deviceId || !deviceId.startsWith("device-")) return;
  try {
    await auth.deleteUser(deviceId);
  } catch (error) {
    if (error?.code !== "auth/user-not-found") throw error;
  }
}

function buildDeviceToken() {
  return randomBytes(32).toString("base64url");
}

async function createDeviceSessionToken(deviceId, roomId) {
  return auth.createCustomToken(deviceId, {
    device: true,
    deviceId,
    roomId,
  });
}

async function reserveNextRoomNumber() {
  const counterRef = db.collection("system").doc("room_sequence");
  return db.runTransaction(async (transaction) => {
    const counter = await transaction.get(counterRef);
    let nextNumber = Number(counter.data()?.nextNumber ?? 0);

    if (!nextNumber) {
      const latestRoom = await transaction.get(
        db.collection("rooms").orderBy("number", "desc").limit(1),
      );
      nextNumber = (Number(latestRoom.docs[0]?.data()?.number ?? 0) || 0) + 1;
    }

    transaction.set(
      counterRef,
      {
        nextNumber: nextNumber + 1,
        updatedAt: FieldValue.serverTimestamp(),
        schemaVersion: SCHEMA_VERSION,
      },
      { merge: true },
    );

    return nextNumber;
  });
}

export const createRoom = onCall(async (request) => {
  const createdBy = await assertAdmin(request);
  const name = normalizeName(request.data?.name);
  const number = await reserveNextRoomNumber();
  const suffix = String(number).padStart(4, "0");
  const roomId = `room-${suffix}`;
  const playerId = `player-${suffix}`;
  const playerUrl = `/sala/${roomId}`;

  const batch = db.batch();
  batch.set(db.collection("rooms").doc(roomId), {
    name,
    number,
    playerId,
    playerUrl,
    active: true,
    status: "FREE",
    activeTributeId: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdBy,
    schemaVersion: SCHEMA_VERSION,
  });
  batch.set(db.collection("player_status").doc(playerId), {
    roomId,
    online: false,
    currentState: "OFFLINE",
    currentSessionId: null,
    currentTributeId: null,
    queueLength: 0,
    currentError: null,
    appVersion: null,
    lastHeartbeat: null,
    lastSync: null,
    schemaVersion: SCHEMA_VERSION,
  });

  await batch.commit();

  return {
    roomId,
    playerId,
    number,
    playerUrl,
    projectId: PROJECT_ID,
  };
});

export const listActiveRooms = onCall(async () => {
  const snapshot = await db.collection("rooms").where("active", "==", true).get();
  return {
    rooms: snapshot.docs
      .map((docSnapshot) => {
        const room = docSnapshot.data();
        return {
          id: docSnapshot.id,
          name: room.name,
          number: room.number,
          playerUrl: room.playerUrl ?? `/sala/${docSnapshot.id}`,
        };
      })
      .sort((a, b) => a.number - b.number),
  };
});

export const registerDevice = onCall(async (request) => {
  const deviceName =
    typeof request.data?.deviceName === "string" ? request.data.deviceName.trim() : "";
  const roomId = typeof request.data?.roomId === "string" ? request.data.roomId.trim() : "";

  if (!deviceName) {
    throw new HttpsError("invalid-argument", "O nome do dispositivo e obrigatorio.");
  }
  if (deviceName.length > 60) {
    throw new HttpsError(
      "invalid-argument",
      "O nome do dispositivo deve ter no maximo 60 caracteres.",
    );
  }
  if (!roomId) {
    throw new HttpsError("invalid-argument", "Selecione uma sala.");
  }

  const roomSnapshot = await db.collection("rooms").doc(roomId).get();
  const room = roomSnapshot.data();
  if (!roomSnapshot.exists || room?.active !== true) {
    throw new HttpsError("failed-precondition", "Sala inexistente ou inativa.");
  }

  const deviceId = `device-${randomBytes(16).toString("hex")}`;
  const deviceToken = buildDeviceToken();
  const now = FieldValue.serverTimestamp();

  await db.collection("devices").doc(deviceId).set({
    deviceId,
    deviceName,
    roomId,
    deviceToken,
    setupCompleted: true,
    registeredAt: now,
    lastHeartbeat: now,
    lastSeen: now,
    online: true,
    currentState: "READY",
    appVersion: PLAYER_APP_VERSION,
    kioskEnabled: true,
    schemaVersion: SCHEMA_VERSION,
  });

  return {
    deviceId,
    deviceName,
    roomId,
    deviceToken,
    setupCompleted: true,
    customToken: await createDeviceSessionToken(deviceId, roomId),
  };
});

export const refreshDeviceSession = onCall(async (request) => {
  const deviceId = typeof request.data?.deviceId === "string" ? request.data.deviceId.trim() : "";
  const deviceToken =
    typeof request.data?.deviceToken === "string" ? request.data.deviceToken.trim() : "";

  if (!deviceId || !deviceToken) {
    throw new HttpsError("invalid-argument", "Configuracao local do dispositivo invalida.");
  }

  const deviceSnapshot = await db.collection("devices").doc(deviceId).get();
  const device = deviceSnapshot.data();
  if (
    !deviceSnapshot.exists ||
    device?.deviceToken !== deviceToken ||
    device?.setupCompleted !== true
  ) {
    throw new HttpsError("not-found", "Dispositivo nao encontrado ou removido.");
  }

  return {
    deviceId,
    roomId: device.roomId,
    deviceName: device.deviceName,
    setupCompleted: true,
    customToken: await createDeviceSessionToken(deviceId, device.roomId),
  };
});

export const validateAdminSession = onCall(async (request) => {
  await assertAdmin(request);
  return { valid: true };
});

export const deleteRoomDevices = onCall(async (request) => {
  await assertAdmin(request);
  const roomId = typeof request.data?.roomId === "string" ? request.data.roomId.trim() : "";

  if (!roomId) {
    throw new HttpsError("invalid-argument", "Sala invalida.");
  }

  const [deviceSnapshot, playerStatusSnapshot] = await Promise.all([
    db.collection("devices").where("roomId", "==", roomId).get(),
    db.collection("player_status").where("roomId", "==", roomId).get(),
  ]);

  await Promise.all(deviceSnapshot.docs.map((device) => deleteDeviceAuthUser(device.id)));

  const batch = db.batch();
  deviceSnapshot.docs.forEach((device) => batch.delete(device.ref));
  playerStatusSnapshot.docs.forEach((status) => batch.delete(status.ref));
  if (deviceSnapshot.size || playerStatusSnapshot.size) await batch.commit();

  return {
    deletedDevices: deviceSnapshot.size,
    deletedPlayerStatuses: playerStatusSnapshot.size,
  };
});
