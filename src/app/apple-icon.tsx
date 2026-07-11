import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: "36px",
        }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path
            d="M10 48 C10 48 10 28 10 28 C10 20 15 15 22 15 C27 15 30 18 32 22 C34 18 37 15 42 15 C49 15 54 20 54 28 L54 48"
            stroke="url(#mGrad)"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path d="M32 48 L32 26" stroke="url(#mGrad)" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="18" cy="8" r="5" fill="#3b82f6" />
          <circle cx="46" cy="8" r="5" fill="#8b5cf6" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
