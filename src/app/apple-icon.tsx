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
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 52 C12 52 12 28 12 28 C12 21 16.5 16 23 16 C27.5 16 30.5 18.5 32 22 C33.5 18.5 36.5 16 41 16 C47.5 16 52 21 52 28 C52 28 52 52 52 52"
            stroke="#5B4DC7"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path d="M32 52 L32 26" stroke="#5B4DC7" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="19" cy="9" r="5" fill="#4A9EF5" />
          <circle cx="45" cy="9" r="5" fill="#8B5CF6" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
