import { ImageResponse } from "next/og";
import { formatWhen, getPublicActivity, isPastActivity, spotsLabel, spotsLeft } from "@/lib/activity-server";

export const alt = "Activity on Meelo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 300;

/** Twemoji SVG as a data URI; null if unavailable (never breaks the image). */
async function emojiDataUri(emoji: string): Promise<string | null> {
  const cps = Array.from(emoji).map((c) => c.codePointAt(0)!.toString(16));
  const code = (emoji.includes("‍") ? cps : cps.filter((c) => c !== "fe0f")).join("-");
  if (!code) return null;
  try {
    const res = await fetch(`https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/${code}.svg`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    return `data:image/svg+xml;base64,${Buffer.from(await res.text()).toString("base64")}`;
  } catch {
    return null;
  }
}

/** Preview card shown when an activity link is shared (WhatsApp, Instagram, …). */
export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await getPublicActivity(id);

  const name = a?.name ?? "Find nearby activities";
  const emoji = a?.emoji ?? "📍";
  const when = a ? formatWhen(a.date, a.time) : "Discover · Create · Join";
  const location = a?.location ?? "";
  const spots = a ? spotsLabel(a) : "";
  const ended = a ? isPastActivity(a) : false;
  const full = a ? spotsLeft(a) === 0 || ended : false;
  const emojiSrc = await emojiDataUri(emoji);
  const pct = a && a.playersNeeded > 0 ? Math.min(100, Math.round((a.playersJoined / a.playersNeeded) * 100)) : 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #0b0b12 0%, #1e1b4b 60%, #4c1d95 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 168,
              height: 168,
              borderRadius: 40,
              background: "rgba(255,255,255,0.1)",
              fontSize: 96,
              fontWeight: 800,
            }}
          >
            {emojiSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={emojiSrc} width={112} height={112} alt="" />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div
              style={{
                fontSize: name.length > 34 ? 56 : 68,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: -1.5,
                display: "flex",
              }}
            >
              {name.length > 60 ? name.slice(0, 57) + "…" : name}
            </div>
            <div style={{ fontSize: 36, marginTop: 18, color: "#c4b5fd", display: "flex" }}>{when}</div>
            {location && (
              <div style={{ fontSize: 30, marginTop: 10, color: "rgba(255,255,255,0.7)", display: "flex" }}>
                {location.length > 48 ? location.slice(0, 45) + "…" : location}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 560 }}>
            {spots && (
              <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: full ? "#fca5a5" : "#86efac" }}>
                {ended ? "This activity has ended" : full ? "Activity full" : spots}
              </div>
            )}
            {a && (
              <div style={{ display: "flex", height: 14, borderRadius: 7, background: "rgba(255,255,255,0.15)" }}>
                <div style={{ width: `${pct}%`, height: 14, borderRadius: 7, background: full ? "#f87171" : "#22c55e" }} />
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1, display: "flex" }}>Meelo</div>
            <div style={{ fontSize: 26, color: "rgba(255,255,255,0.7)", display: "flex" }}>{ended ? "Find more nearby →" : "Tap to join →"}</div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
