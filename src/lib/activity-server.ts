import type { Activity } from "@/types";

/**
 * Server-side activity fetch for public pages and link previews
 * (WhatsApp/Instagram/Twitter crawlers don't run JavaScript).
 * Uses the Firestore REST API — activities are publicly readable.
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "meelo-connect";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.meelo.online").replace(/\/$/, "");

type FsValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  timestampValue?: string;
  nullValue?: null;
  arrayValue?: { values?: FsValue[] };
  mapValue?: { fields?: Record<string, FsValue> };
};

function decode(v: FsValue): unknown {
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return Number(v.integerValue);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.timestampValue !== undefined) return v.timestampValue;
  if (v.arrayValue) return (v.arrayValue.values || []).map(decode);
  if (v.mapValue) return decodeFields(v.mapValue.fields || {});
  return null;
}

function decodeFields(fields: Record<string, FsValue>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, decode(v)]));
}

export async function getPublicActivity(id: string): Promise<Activity | null> {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) return null;
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/activities/${id}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const doc = (await res.json()) as { fields?: Record<string, FsValue> };
    if (!doc.fields) return null;
    const d = decodeFields(doc.fields);
    const players = Array.isArray(d.players) ? (d.players as Activity["players"]) : [];
    return {
      id,
      name: String(d.name ?? "Activity"),
      emoji: String(d.emoji ?? "🎯"),
      category: String(d.category ?? ""),
      location: String(d.location ?? ""),
      lat: Number(d.lat ?? 0),
      lng: Number(d.lng ?? 0),
      date: String(d.date ?? ""),
      time: String(d.time ?? ""),
      distance: String(d.distance ?? ""),
      playersJoined: Number(d.playersJoined ?? players.length),
      playersNeeded: Number(d.playersNeeded ?? 0),
      players,
      description: String(d.description ?? ""),
      createdBy: String(d.createdBy ?? ""),
      ...(d.expiresAt ? { expiresAt: String(d.expiresAt) } : {}),
      ...(d.autoDeleteAfter ? { autoDeleteAfter: String(d.autoDeleteAfter) } : {}),
    };
  } catch {
    return null;
  }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "Sat, 6 Jun · 6:30 PM" — timezone-independent (uses the stored local date/time). */
export function formatWhen(date: string, time: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  let out = date;
  if (m) {
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const dow = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
    out = `${DAYS[dow]}, ${d} ${MONTHS[mo - 1]}`;
  }
  const t = /^(\d{1,2}):(\d{2})/.exec(time);
  if (t) {
    const h = Number(t[1]);
    out += ` · ${h % 12 || 12}:${t[2]} ${h < 12 ? "AM" : "PM"}`;
  }
  return out;
}

export function spotsLeft(a: Activity): number {
  return Math.max(0, a.playersNeeded - a.playersJoined);
}

/** Approximate (server timezone); good enough for preview wording. */
export function isPastActivity(a: Activity): boolean {
  const t = new Date(`${a.date}T${a.time || "23:59"}`).getTime();
  return Number.isFinite(t) && t < Date.now();
}

export function spotsLabel(a: Activity): string {
  if (isPastActivity(a)) return "Ended";
  const n = spotsLeft(a);
  return n === 0 ? "Full" : `${n} spot${n === 1 ? "" : "s"} left`;
}
