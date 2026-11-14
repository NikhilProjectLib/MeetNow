import { collection, deleteDoc, doc, getDocs, runTransaction } from "firebase/firestore";
import { ref, get, remove } from "firebase/database";
import { deleteUser, signOut as firebaseSignOut } from "firebase/auth";
import { db, rtdb, auth } from "./firebase";
import { isNativeApp } from "./native";
import type { Player } from "@/types";

/** Firebase only deletes accounts that signed in recently (~5 min). */
const RECENT_LOGIN_MS = 4 * 60 * 1000;

export class RecentLoginRequiredError extends Error {
  constructor() {
    super("Please log in again to delete your account.");
    this.name = "RecentLoginRequiredError";
  }
}

/** True if the signed-in user can be deleted without logging in again. */
export function hasRecentLogin(): boolean {
  const last = auth.currentUser?.metadata.lastSignInTime;
  if (!last) return false;
  return Date.now() - new Date(last).getTime() < RECENT_LOGIN_MS;
}

/**
 * Permanently delete the signed-in user's account and personal data:
 * - activities they created (and those activities' group chats)
 * - their spot / waitlist entry in activities they joined
 * - chat messages they sent, their notifications and chat read-state
 * - their profile, then the login itself
 *
 * Checks the recent-login requirement BEFORE deleting anything, so data is
 * never removed while the account itself survives.
 */
export async function deleteMyAccount(onProgress?: (step: string) => void): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  if (!hasRecentLogin()) throw new RecentLoginRequiredError();
  const uid = user.uid;
  const step = (s: string) => onProgress?.(s);

  // 1. Activities
  step("Removing your activities…");
  const snap = await getDocs(collection(db, "activities"));
  const joinedIds: string[] = [];
  for (const d of snap.docs) {
    const data = d.data();
    const players: Player[] = data.players || [];
    const waitlist: Player[] = data.waitlist || [];
    if (data.createdBy === uid) {
      await deleteDoc(d.ref);
      await remove(ref(rtdb, `chats/${d.id}`)).catch(() => {});
      continue;
    }
    const inPlayers = players.some((p) => p.id === uid);
    const inWaitlist = waitlist.some((p) => p.id === uid);
    if (!inPlayers && !inWaitlist) continue;
    joinedIds.push(d.id);
    await runTransaction(db, async (tx) => {
      const fresh = await tx.get(d.ref);
      if (!fresh.exists()) return;
      const f = fresh.data();
      const fp: Player[] = f.players || [];
      const fw: Player[] = f.waitlist || [];
      const wasPlayer = fp.some((p) => p.id === uid);
      tx.update(d.ref, {
        players: fp.filter((p) => p.id !== uid),
        ...(wasPlayer && { playersJoined: Math.max(0, (f.playersJoined ?? fp.length) - 1) }),
        ...(fw.length && { waitlist: fw.filter((p) => p.id !== uid) }),
      });
    });
  }

  // 2. Chat messages they sent in activities they were part of
  step("Deleting your messages…");
  for (const activityId of joinedIds) {
    try {
      const msgs = await get(ref(rtdb, `chats/${activityId}/messages`));
      const removals: Promise<void>[] = [];
      msgs.forEach((m) => {
        if (m.val()?.senderId === uid) removals.push(remove(m.ref));
      });
      await Promise.all(removals);
    } catch {
      /* chat may not exist */
    }
  }

  // 3. Notifications + chat read-state
  step("Deleting notifications…");
  await remove(ref(rtdb, `notifications/${uid}`)).catch(() => {});
  await remove(ref(rtdb, `chatLastSeen/${uid}`)).catch(() => {});

  // 4. Profile
  step("Deleting your profile…");
  await deleteDoc(doc(db, "users", uid));

  // 5. Login
  step("Deleting your login…");
  if (isNativeApp()) {
    const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
    await FirebaseAuthentication.signOut().catch(() => {});
  }
  try {
    await deleteUser(user);
  } catch (err) {
    if ((err as { code?: string }).code === "auth/requires-recent-login") throw new RecentLoginRequiredError();
    throw err;
  }
  await firebaseSignOut(auth).catch(() => {});
}
