import { deleteObject, getDownloadURL, listAll, ref, uploadBytesResumable } from "firebase/storage";
import { getFirebaseStorage } from "@/firebase/client";

export type UploadProgressHandler = (progress: number) => void;

function cleanFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export async function uploadFile(file: File, folder: string, onProgress?: UploadProgressHandler) {
  const storage = getFirebaseStorage();
  const path = `${folder}/${crypto.randomUUID()}-${cleanFileName(file.name)}`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file, { contentType: file.type });

  await new Promise<void>((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress?.(progress);
      },
      reject,
      () => resolve(),
    );
  });

  return {
    name: file.name,
    url: await getDownloadURL(task.snapshot.ref),
    storagePath: path,
  };
}

export async function deleteStoredFile(storagePath: string | null | undefined) {
  if (!storagePath) return;
  await deleteObject(ref(getFirebaseStorage(), storagePath));
}

export async function deleteStoredFolder(storagePath: string) {
  const folder = await listAll(ref(getFirebaseStorage(), storagePath));
  await Promise.all(folder.items.map((item) => deleteObject(item)));
}
