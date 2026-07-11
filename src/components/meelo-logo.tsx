"use client";

interface MeeloLogoProps {
  variant?: "light" | "dark";
  showText?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function MeeloLogo({ variant = "dark", showText = true, className = "", size = "md" }: MeeloLogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-lg", gap: "gap-1.5" },
    md: { icon: 32, text: "text-xl", gap: "gap-2" },
    lg: { icon: 48, text: "text-3xl", gap: "gap-3" },
  };

  const s = sizes[size];
  const textColor = variant === "dark" ? "#FFFFFF" : "#1a1e2e";

  // Icon colors: gradient blue-to-purple on the m strokes
  // Light mode: darker purple strokes, dark mode: lighter purple strokes
  const mColor = variant === "dark" ? "#A78BFA" : "#5B4DC7";

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {/* Icon mark - stylized m with people dots */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Stylized m body */}
        <path
          d="M12 52 C12 52 12 28 12 28 C12 21 16.5 16 23 16 C27.5 16 30.5 18.5 32 22 C33.5 18.5 36.5 16 41 16 C47.5 16 52 21 52 28 C52 28 52 52 52 52"
          stroke={mColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M32 52 L32 26"
          stroke={mColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Left person dot (blue) */}
        <circle cx="19" cy="9" r="5.5" fill="#4A9EF5" />
        {/* Right person dot (purple) */}
        <circle cx="45" cy="9" r="5.5" fill="#8B5CF6" />
      </svg>

      {/* Text: meelo */}
      {showText && (
        <span className={`${s.text} font-black tracking-tight`} style={{ color: textColor }}>
          meelo
        </span>
      )}
    </div>
  );
}
