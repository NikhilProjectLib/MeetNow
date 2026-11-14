import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  getDoc,
  getDocs,
  where,
  runTransaction,
  writeBatch,
  Timestamp,
  arrayUnion,
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

/** Move people from the waitlist into free spots (mutates the arrays). */
export function promoteFromWaitlist(
  players: Player[],
  waitlist: Player[],
  joined: number,
  needed: number
): { joined: number; promoted: Player[] } {
  const promoted: Player[] = [];
  while (joined < needed && waitlist.length > 0) {
    const next = waitlist.shift()!;
    if (players.some((p) => p.id === next.id)) continue;
    const player = { ...next, joinedAt: new Date().toISOString() };
    players.push(player);
    promoted.push(player);
    joined++;
  }
  return { joined, promoted };
}

/**
 * Join an activity. If it's full, the player is added to the waitlist instead.
 * Runs in a transaction so two people can't take the last spot at once.
 */
export async function joinActivityInFirestore(
  activityId: string,
  player: Player
): Promise<"joined" | "waitlisted" | "noop"> {
  const actRef = doc(db, COLLECTION, activityId);
  const result = await runTransaction(db, async (tx) => {
    const snap = await tx.get(actRef);
    if (!snap.exists()) return { outcome: "noop" as const };
    const data = snap.data();
    const players: Player[] = data.players || [];
    const waitlist: Player[] = data.waitlist || [];
    if (players.some((p) => p.id === player.id) || waitlist.some((p) => p.id === player.id)) {
      return { outcome: "noop" as const };
    }
    const joined: number = data.playersJoined ?? players.length;
    if (joined >= (data.playersNeeded || 0)) {
      tx.update(actRef, { waitlist: [...waitlist, { ...player, joinedAt: new Date().toISOString() }] });
      return { outcome: "waitlisted" as const };
    }
    tx.update(actRef, { players: [...players, player], playersJoined: joined + 1 });
    return { outcome: "joined" as const, owner: data.createdBy as string, name: data.name as string };
  });

  // Notify the owner
  if (result.outcome === "joined" && result.owner && result.owner !== player.id) {
    const { owner, name } = result;
    import("./notification-service").then(({ notifyOwnerOnJoin }) => {
      notifyOwnerOnJoin(owner, player.name, activityId, name);
    });
  }
  return result.outcome;
}

/** Leave the waitlist of an activity. */
export async function leaveWaitlistInFirestore(activityId: string, playerId: string): Promise<void> {
  const actRef = doc(db, COLLECTION, activityId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(actRef);
    if (!snap.exists()) return;
    const waitlist: Player[] = snap.data().waitlist || [];
    if (!waitlist.some((p) => p.id === playerId)) return;
    tx.update(actRef, { waitlist: waitlist.filter((p) => p.id !== playerId) });
  });
}

/**
 * Remove a player (they left, or the owner removed them) and fill the freed
 * spot from the waitlist.
 */
async function removeAndPromote(
  activityId: string,
  playerId: string
): Promise<{ removed: Player; promoted: Player[]; owner: string; name: string } | null> {
  const actRef = doc(db, COLLECTION, activityId);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(actRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    const players: Player[] = data.players || [];
    const waitlist: Player[] = [...(data.waitlist || [])];
    const removed = players.find((p) => p.id === playerId);
    if (!removed) return null;
    const remaining = players.filter((p) => p.id !== playerId);
    const afterLeave = Math.max(0, (data.playersJoined ?? players.length) - 1);
    const { joined, promoted } = promoteFromWaitlist(remaining, waitlist, afterLeave, data.playersNeeded || 0);
    tx.update(actRef, { players: remaining, playersJoined: joined, waitlist });
    return { removed, promoted, owner: data.createdBy as string, name: data.name as string };
  });
}

function notifyPromoted(activityId: string, name: string, promoted: Player[]) {
  if (promoted.length === 0) return;
  import("./notification-service").then(({ notifyPromotedFromWaitlist }) => {
    promoted.forEach((p) => notifyPromotedFromWaitlist(p.id, activityId, name));
  });
}

/**
 * Leave an activity in Firestore.
 */
export async function leaveActivityInFirestore(
  activityId: string,
  playerId: string
): Promise<void> {
  const result = await removeAndPromote(activityId, playerId);
  if (!result) return;

  // Notify the owner
  if (result.owner && result.owner !== playerId) {
    import("./notification-service").then(({ notifyOwnerOnLeave }) => {
      notifyOwnerOnLeave(result.owner, result.removed.name, activityId, result.name);
    });
  }
  notifyPromoted(activityId, result.name, result.promoted);
}

/**
 * Remove a player from an activity (owner action).
 */
export async function removePlayerInFirestore(
  activityId: string,
  playerId: string
): Promise<void> {
  const result = await removeAndPromote(activityId, playerId);
  if (!result) return;

  // Notify the removed player
  import("./notification-service").then(({ notifyPlayerRemoved }) => {
    notifyPlayerRemoved(playerId, activityId, result.name);
  });
  notifyPromoted(activityId, result.name, result.promoted);
}

/* ---------------- Repeating (weekly) activities ---------------- */

const DAY_MS = 24 * 60 * 60 * 1000;

/** "2026-11-12" + n days, timezone-safe. */
export function addDaysToDate(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Today as "YYYY-MM-DD" in the user's local timezone. */
export function todayLocal(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/** How many weekly dates a series keeps scheduled. */
export const SERIES_WEEKS_AHEAD = 4;

function occurrenceId(seriesId: string, date: string) {
  return `${seriesId}_${date}`;
}

function shiftIso(iso: string | undefined, days: number): string | undefined {
  if (!iso) return undefined;
  return new Date(new Date(iso).getTime() + days * DAY_MS).toISOString();
}

/**
 * Create a weekly activity: the first date plus the next few weeks, each as
 * its own document (joins, chat and capacity are per date).
 * Returns the id of the first date.
 */
export async function createActivitySeries(activity: Omit<Activity, "id">): Promise<string> {
  const seriesId = doc(collection(db, COLLECTION)).id;
  const batch = writeBatch(db);
  let firstId = "";
  for (let i = 0; i < SERIES_WEEKS_AHEAD; i++) {
    const date = addDaysToDate(activity.date, i * 7);
    const id = occurrenceId(seriesId, date);
    if (i === 0) firstId = id;
    const expiresAt = shiftIso(activity.expiresAt, i * 7);
    batch.set(doc(db, COLLECTION, id), {
      ...activity,
      date,
      ...(expiresAt ? { expiresAt } : {}),
      recurrence: "weekly",
      seriesId,
      waitlist: [],
      createdAt: Timestamp.now(),
    });
  }
  await batch.commit();
  return firstId;
}

/**
 * Which new dates a weekly series needs so it stays SERIES_WEEKS_AHEAD dates
 * ahead (today's date counts). Pure function — no I/O.
 * - A series with no date today or later has ended → nothing.
 * - Dates the owner deleted (skipped) are never re-created.
 */
export function planSeriesDates(existing: string[], skipped: string[], today: string): string[] {
  if (existing.length === 0 || !existing.some((d) => d >= today)) return [];
  const horizon = addDaysToDate(today, (SERIES_WEEKS_AHEAD - 1) * 7);
  const have = new Set(existing);
  const skip = new Set(skipped);
  let cursor = existing.reduce((a, b) => (b > a ? b : a));
  const out: string[] = [];
  while (cursor < horizon && out.length < SERIES_WEEKS_AHEAD * 2) {
    cursor = addDaysToDate(cursor, 7);
    if (skip.has(cursor) || have.has(cursor)) continue;
    out.push(cursor);
  }
  return out;
}

const extendedThisSession = new Set<string>();

/**
 * Keep every live weekly series scheduled SERIES_WEEKS_AHEAD weeks out.
 * Creation is idempotent (deterministic ids inside a transaction), so several
 * clients doing this at once is harmless.
 */
export async function extendWeeklySeries(activities: Activity[]): Promise<void> {
  const today = todayLocal();
  const bySeries = new Map<string, Activity[]>();
  for (const a of activities) {
    if (a.recurrence !== "weekly" || !a.seriesId) continue;
    bySeries.set(a.seriesId, [...(bySeries.get(a.seriesId) || []), a]);
  }

  for (const [seriesId, dates] of bySeries) {
    const skipped = [...new Set(dates.flatMap((a) => a.skippedDates || []))];
    const toCreate = planSeriesDates(dates.map((a) => a.date), skipped, today);
    if (toCreate.length === 0) continue;
    const key = `${seriesId}@${toCreate.join(",")}`;
    if (extendedThisSession.has(key)) continue;
    extendedThisSession.add(key);

    // Copy details from the latest existing date
    const template = dates.reduce((a, b) => (b.date > a.date ? b : a));
    const owner = template.players.filter((p) => p.id === template.createdBy);
    for (const date of toCreate) {
      const ref = doc(db, COLLECTION, occurrenceId(seriesId, date));
      const expiresAt = shiftIso(template.expiresAt, (Date.parse(date) - Date.parse(template.date)) / DAY_MS);
      const next: Omit<Activity, "id"> = {
        name: template.name,
        emoji: template.emoji,
        category: template.category,
        location: template.location,
        lat: template.lat,
        lng: template.lng,
        date,
        time: template.time,
        distance: "0 km",
        playersNeeded: template.playersNeeded,
        // Each new date starts empty except for the organizer
        players: owner,
        playersJoined: owner.length,
        description: template.description,
        createdBy: template.createdBy,
        ...(expiresAt ? { expiresAt } : {}),
        ...(template.autoDeleteAfter ? { autoDeleteAfter: template.autoDeleteAfter } : {}),
        waitlist: [],
        recurrence: "weekly",
        seriesId,
        ...(skipped.length ? { skippedDates: skipped } : {}),
      };
      try {
        await runTransaction(db, async (tx) => {
          if (!(await tx.get(ref)).exists()) tx.set(ref, { ...next, createdAt: Timestamp.now() });
        });
      } catch {
        break; // no permission / offline — another client will do it
      }
    }
  }
}

/**
 * Owner action: delete one date of a weekly series. The date is remembered on
 * the remaining dates so the scheduler doesn't re-create it.
 */
export async function deleteSeriesDate(activityId: string, seriesId: string, date: string): Promise<void> {
  const snap = await getDocs(query(collection(db, COLLECTION), where("seriesId", "==", seriesId)));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => {
    if (d.id === activityId) batch.delete(d.ref);
    else batch.update(d.ref, { skippedDates: arrayUnion(date) });
  });
  await batch.commit();
}

/** Owner action: delete this date and every later date (stops repeating). */
export async function deleteSeriesFromDate(seriesId: string, fromDate: string): Promise<void> {
  const snap = await getDocs(query(collection(db, COLLECTION), where("seriesId", "==", seriesId)));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => {
    if ((d.data().date || "") >= fromDate) batch.delete(d.ref);
  });
  await batch.commit();
}

/**
 * Subscribe to all activities in real-time.
 * Returns an unsubscribe function.
 */
export function subscribeToActivities(
  callback: (activities: Activity[]) => void
): () => void {
  const q = query(
    collection(db, COLLECTION)
  );

  return onSnapshot(q, (snapshot) => {
    const activities: Activity[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || "",
        emoji: data.emoji || "\u2728",
        category: data.category || "other",
        location: data.location || "",
        lat: data.lat || 0,
        lng: data.lng || 0,
        date: data.date || "",
        time: data.time || "",
        distance: data.distance || "0 km",
        playersJoined: data.playersJoined || 0,
        playersNeeded: data.playersNeeded || 10,
        players: data.players || [],
        description: data.description || "",
        createdBy: data.createdBy || "",
        waitlist: data.waitlist || [],
        ...(data.recurrence === "weekly" && { recurrence: "weekly" as const }),
        ...(data.seriesId && { seriesId: data.seriesId }),
        ...(data.skippedDates && { skippedDates: data.skippedDates }),
      } as Activity;
    });
    callback(activities);
  }, (error) => {
    console.error("Firestore subscription error:", error.message);
  });
}
