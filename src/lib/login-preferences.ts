const DEVICE_KEY = "memorial.admin.device-id";
const EMAIL_KEY = "memorial.admin.last-email";

export function getRememberedEmail(storage: Pick<Storage, "getItem"> | undefined) {
  try {
    return storage?.getItem(EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

export function rememberEmail(storage: Pick<Storage, "setItem"> | undefined, email: string) {
  try {
    storage?.setItem(EMAIL_KEY, email.trim());
  } catch {
    // Saving the email is optional; authentication reports unavailable persistence separately.
  }
}

export function getOrCreateDeviceId(storage: Storage, uuid: () => string) {
  try {
    const existing = storage.getItem(DEVICE_KEY);
    if (existing && /^[a-zA-Z0-9-]{16,80}$/.test(existing)) return existing;
    const id = uuid();
    storage.setItem(DEVICE_KEY, id);
    if (storage.getItem(DEVICE_KEY) !== id) throw new Error("storage-unavailable");
    return id;
  } catch {
    throw new Error("Permita o armazenamento deste site no navegador para manter seu login.");
  }
}

export function describeBrowser(userAgent: string) {
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /Firefox\/|FxiOS\//.test(userAgent)
        ? "Firefox"
        : /Chrome\/|CriOS\//.test(userAgent)
          ? "Chrome"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : "Navegador desconhecido";
  const system = /Android/.test(userAgent)
    ? "Android"
    : /iPhone|iPad|iPod/.test(userAgent)
      ? "iOS / iPadOS"
      : /Windows/.test(userAgent)
        ? "Windows"
        : /Macintosh|Mac OS/.test(userAgent)
          ? "macOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "Sistema desconhecido";
  return { browser, system };
}
