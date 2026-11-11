import {
  getAuth,
  signInWithPopup,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from "firebase/auth";
import { app } from "./firebase";
import { isNativeApp } from "./native";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth };

/**
 * Sign in with Google popup
 */
export async function signInWithGoogle(): Promise<User> {
  if (isNativeApp()) {
    // Google blocks OAuth popups inside Android WebViews, so use the native
    // Google account picker and hand the ID token to the web Firebase SDK.
    const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
    const native = await FirebaseAuthentication.signInWithGoogle();
    const idToken = native.credential?.idToken;
    if (!idToken) throw new Error("Google sign-in was cancelled");
    const result = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
    return result.user;
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Create account with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  return result.user;
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  if (isNativeApp()) {
    const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
    await FirebaseAuthentication.signOut().catch(() => {});
  }
  await firebaseSignOut(auth);
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
