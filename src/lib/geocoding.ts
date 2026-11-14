/**
 * Place search + reverse geocoding.
 * Uses Geoapify when a key is configured and working; falls back to
 * OpenStreetMap Nominatim (free, no key) if Geoapify is missing, rejects
 * the key (e.g. 401 "Not allowed"), errors, or returns nothing.
 */

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY || "";

export interface PlaceResult {
  formatted: string;
  address_line1: string;
  address_line2: string;
  lat: number;
  lon: number;
  distance?: number;
  category?: string;
}

type LatLng = { lat: number; lng: number };

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* ---------- Geoapify ---------- */

type GeoapifyProps = {
  formatted?: string;
  address_line1?: string;
  address_line2?: string;
  name?: string;
  street?: string;
  suburb?: string;
  city?: string;
  lat: number;
  lon: number;
  distance?: number;
  category?: string;
};
type GeoapifyFeature = { properties: GeoapifyProps };

async function geoapifySearch(query: string, near: LatLng | null, limit: number): Promise<PlaceResult[]> {
  const bias = near ? `&bias=proximity:${near.lng},${near.lat}` : "";
  const data = (await getJson(
    `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}${bias}&limit=${limit}&apiKey=${GEOAPIFY_KEY}`
  )) as { features?: GeoapifyFeature[] };
  return (data.features || []).map(({ properties: p }) => ({
    formatted: p.formatted || "",
    address_line1: p.address_line1 || p.name || "",
    address_line2: p.address_line2 || "",
    lat: p.lat,
    lon: p.lon,
    distance: p.distance,
    category: p.category,
  }));
}

async function geoapifyReverse(lat: number, lng: number): Promise<string | null> {
  const data = (await getJson(
    `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_KEY}`
  )) as { features?: GeoapifyFeature[] };
  const p = data.features?.[0]?.properties;
  if (!p) return null;
  return p.address_line1 || p.street || p.suburb || p.city || p.formatted?.split(",")[0] || null;
}

/* ---------- Nominatim (OpenStreetMap) ---------- */

type NominatimPlace = {
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  address?: Record<string, string>;
};

function nominatimLabel(r: NominatimPlace): string {
  const a = r.address || {};
  const parts = [
    r.name,
    a.road || a.pedestrian,
    a.suburb || a.neighbourhood,
    a.city || a.town || a.village,
  ].filter((x, i, arr): x is string => !!x && arr.indexOf(x) === i);
  return parts.length ? parts.slice(0, 2).join(", ") : r.display_name.split(",").slice(0, 2).join(",").trim();
}

async function nominatimSearch(query: string, near: LatLng | null, limit: number): Promise<PlaceResult[]> {
  // Prefer (but don't restrict to) results within ~100 km of the user
  const viewbox = near ? `&viewbox=${near.lng - 1},${near.lat + 1},${near.lng + 1},${near.lat - 1}` : "";
  const data = (await getJson(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=${limit}&addressdetails=1${viewbox}`
  )) as NominatimPlace[];
  return (Array.isArray(data) ? data : []).map((r) => ({
    formatted: r.display_name,
    address_line1: r.name || r.display_name.split(",")[0],
    address_line2: r.display_name.split(",").slice(1, 3).join(",").trim(),
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
  }));
}

async function nominatimReverse(lat: number, lng: number): Promise<string | null> {
  const data = (await getJson(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
  )) as NominatimPlace & { error?: string };
  if (!data || data.error || !data.display_name) return null;
  return nominatimLabel(data);
}

/* ---------- Public API ---------- */

/** Autocomplete places near the user. Never throws; returns [] on failure. */
export async function searchPlaces(query: string, near: LatLng | null, limit = 5): Promise<PlaceResult[]> {
  if (GEOAPIFY_KEY) {
    try {
      const results = await geoapifySearch(query, near, limit);
      if (results.length) return results;
    } catch {
      /* fall through to OpenStreetMap */
    }
  }
  try {
    return await nominatimSearch(query, near, limit);
  } catch {
    return [];
  }
}

/** Short human-readable address for a point, or null. Never throws. */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  if (GEOAPIFY_KEY) {
    try {
      const label = await geoapifyReverse(lat, lng);
      if (label) return label;
    } catch {
      /* fall through to OpenStreetMap */
    }
  }
  try {
    return await nominatimReverse(lat, lng);
  } catch {
    return null;
  }
}
