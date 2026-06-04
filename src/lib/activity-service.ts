import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Activity, Player } from "@/types";

const COLLECTION = "activities";

/**
 * Create a new activity in Firestore.
 * Visible to all users instantly via real-time listener.
 */
export async function createActivityInFirestore(
  activity: Omit<Activity, "id">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...activity,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update an activity in Firestore.
 */
export async function updateActivityInFirestore(
  activityId: string,
  updates: Partial<Activity>
): Promise<void> {
  const ref = doc(db, COLLECTION, activityId);
  await updateDoc(ref, updates);
}

/**
 * Delete an activity from Firestore.
 */
export async function deleteActivityInFirestore(activityId: string): Promise<void> {
  const ref = doc(db, COLLECTION, activityId);
  await deleteDoc(ref);
}

/**
 * Join an activity in Firestore.
 */
export async function joinActivityInFirestore(
  activityId: string,
  player: Player
): Promise<void> {
  const ref = doc(db, COLLECTION, activityId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const players: Player[] = data.players || [];
  if (players.some((p: Player) => p.id === player.id)) return;
  if (data.playersJoined >= data.playersNeeded) return;

  await updateDoc(ref, {
    players: [...players, player],
    playersJoined: (data.playersJoined || 0) + 1,
  });
}

/**
 * Leave an activity in Firestore.
 */
export async function leaveActivityInFirestore(
  activityId: string,
  playerId: string
): Promise<void> {
  const ref = doc(db, COLLECTION, activityId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const players: Player[] = data.players || [];
  if (!players.some((p: Player) => p.id === playerId)) return;

  await updateDoc(ref, {
    players: players.filter((p: Player) => p.id !== playerId),
    playersJoined: Math.max(0, (data.playersJoined || 1) - 1),
  });
}

/**
 * Remove a player from an activity (owner action).
 */
export async function removePlayerInFirestore(
  activityId: string,
  playerId: string
): Promise<void> {
  await leaveActivityInFirestore(activityId, playerId);
}

/**
 * Subscribe to all activities in real-time.
 * Returns an unsubscribe function.
 */
export function subscribeToActivities(
  callback: (activities: Activity[]) => void
): () => void {
  const q = query(
    collection(db, COLLECTION),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const activities: Activity[] = snapshot.docs.map((d) => ({
      ...(d.data() as Omit<Activity, "id">),
      id: d.id,
    }));
    callback(activities);
  }, (error) => {
    console.error("Firestore subscription error:", error);
  });
}
