import type { Activity } from "@/types";

/** Google Maps directions to the activity (opens the Maps app on phones). */
export function directionsUrl(a: Pick<Activity, "lat" | "lng" | "location">): string {
  const destination = a.lat && a.lng ? `${a.lat},${a.lng}` : a.location;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

/** "2026-11-15" + "07:00" + minutes → "20261115T090000" (floating local time). */
function calendarStamp(date: string, time: string, addMinutes = 0): string {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = (time || "09:00").split(":").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d, hh, mm) + addMinutes * 60000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${t.getUTCFullYear()}${p(t.getUTCMonth() + 1)}${p(t.getUTCDate())}T${p(t.getUTCHours())}${p(t.getUTCMinutes())}00`;
}

/**
 * Google Calendar "add event" link. Times are left without a timezone so the
 * event lands at the same clock time in the user's calendar (activities are local).
 */
export function googleCalendarUrl(
  a: Pick<Activity, "id" | "name" | "date" | "time" | "location" | "description">,
  siteUrl: string,
  durationMinutes = 120
): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: a.name,
    dates: `${calendarStamp(a.date, a.time)}/${calendarStamp(a.date, a.time, durationMinutes)}`,
    location: a.location,
    details: `${a.description ? a.description + "\n\n" : ""}Meelo: ${siteUrl}/activity/${a.id}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
