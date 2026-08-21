import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const require = createRequire(import.meta.url);

function requireFirebaseToolsAuth() {
  try {
    return require("firebase-tools/lib/auth");
  } catch (error) {
    if (error.code !== "MODULE_NOT_FOUND") throw error;
    return require(
      join(process.env.APPDATA, "npm", "node_modules", "firebase-tools", "lib", "auth.js"),
    );
  }
}

const { getGlobalDefaultAccount, getAccessToken } = requireFirebaseToolsAuth();

const projectId = process.env.FIREBASE_PROJECT_ID || "memorial-cloud-5da8e";
const databaseId = process.env.FIREBASE_DATABASE_ID || "memorialcloud";
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const adminName = process.env.ADMIN_NAME || "Glaedson Administrador";

function requireEnv(name, value) {
  if (!value) {
    console.error(`Set ${name}.`);
    process.exit(1);
  }
}

requireEnv("ADMIN_EMAIL", adminEmail);
if (adminPassword && adminPassword.length < 6) {
  console.error("ADMIN_PASSWORD must have at least 6 characters.");
  process.exit(1);
}

const envPath = resolve(".env");
const envContents = await readFile(envPath, "utf8").catch(() => "");
const firebaseApiKey =
  process.env.VITE_FIREBASE_API_KEY ||
  envContents.match(/^VITE_FIREBASE_API_KEY=(.+)$/m)?.[1]?.trim();

requireEnv("VITE_FIREBASE_API_KEY", firebaseApiKey);

const account = getGlobalDefaultAccount();

if (!account?.tokens?.refresh_token) {
  console.error("No Firebase CLI login found. Run firebase login first.");
  process.exit(1);
}

const tokenResult = await getAccessToken(account.tokens.refresh_token, [
  "https://www.googleapis.com/auth/cloud-platform",
  "https://www.googleapis.com/auth/firebase",
]);

const accessToken = tokenResult?.access_token;

requireEnv("Firebase CLI access token", accessToken);

async function googleJson(url, body, options = {}) {
  const response = await fetch(url, {
    method: options.method || "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message = data?.error?.message || response.statusText;
    const error = new Error(message);
    error.status = response.status;
    error.body = data;
    throw error;
  }

  return data;
}

async function publicIdentityJson(path, body) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/${path}?key=${encodeURIComponent(firebaseApiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message = data?.error?.message || response.statusText;
    const error = new Error(message);
    error.status = response.status;
    error.body = data;
    throw error;
  }

  return data;
}

async function lookupUserByEmail() {
  try {
    const data = await googleJson(
      `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:lookup`,
      { email: [adminEmail] },
    );

    return data.users?.[0] ?? null;
  } catch (error) {
    if (error.status === 404 || error.message === "USER_NOT_FOUND") {
      return null;
    }
    throw error;
  }
}

async function ensureAuthUser() {
  const existing = await lookupUserByEmail();

  if (existing?.localId) {
    const update = {
      localId: existing.localId,
      email: adminEmail,
      displayName: adminName,
      emailVerified: true,
      disabled: false,
      customAttributes: JSON.stringify({ admin: true }),
    };
    if (adminPassword) update.password = adminPassword;
    await googleJson(`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:update`, update);

    return existing.localId;
  }

  requireEnv("ADMIN_PASSWORD when the account does not exist", adminPassword);

  const created = await publicIdentityJson("accounts:signUp", {
    email: adminEmail,
    password: adminPassword,
    displayName: adminName,
    returnSecureToken: false,
  });

  await googleJson(
    `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:update`,
    {
      localId: created.localId,
      email: adminEmail,
      displayName: adminName,
      emailVerified: true,
      disabled: false,
      customAttributes: JSON.stringify({ admin: true }),
    },
  );

  return created.localId;
}

function firestoreValue(value) {
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return { integerValue: String(value) };
  if (value === null) return { nullValue: null };
  return { stringValue: String(value) };
}

async function writeAdminProfile(uid) {
  const now = new Date().toISOString();
  const fields = {
    name: firestoreValue(adminName),
    email: firestoreValue(adminEmail),
    role: firestoreValue("ADMIN"),
    active: firestoreValue(true),
    schemaVersion: firestoreValue(1),
    updatedAt: { timestampValue: now },
  };

  const updateMask = Object.keys(fields)
    .map((field) => `updateMask.fieldPaths=${encodeURIComponent(field)}`)
    .join("&");

  await googleJson(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/users/${uid}?${updateMask}`,
    { fields },
    { method: "PATCH" },
  );
}

const uid = await ensureAuthUser();
await writeAdminProfile(uid);

console.log(`Admin access granted to ${adminEmail} (${uid}).`);
