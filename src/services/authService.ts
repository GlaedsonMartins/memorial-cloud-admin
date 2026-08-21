import {
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { getFirebaseAuth, getFirebaseFunctions } from "@/firebase/client";

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export function subscribeToIdToken(callback: (user: User | null) => void) {
  return onIdTokenChanged(getFirebaseAuth(), callback);
}

export async function validateAdminSession() {
  const callable = httpsCallable<void, { valid: boolean }>(
    getFirebaseFunctions(),
    "validateAdminSession",
  );
  await callable();
}

export async function signInAdmin(email: string, password: string) {
  const result = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  return result.user;
}

export async function signOutAdmin() {
  await signOut(getFirebaseAuth());
}
