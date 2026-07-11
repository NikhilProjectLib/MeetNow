"use client";

interface MeeloLogoProps {
  variant?: "light" | "dark";
  showText?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function MeeloLogo({ variant = "dark", showText = true, className = "", size = "md" }: MeeloLogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-lg", gap: "gap-1" },
    md: { icon: 32, text: "text-xl", gap: "gap-1.5" },
    lg: { icon: 48, text: "text-3xl", gap: "gap-2" },
  };

  const s = sizes[size];
  const textColor = variant === "dark" ? "#FFFFFF" : "#1e293b";

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {/* Brand mark icon - stylized m with people dots */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`grad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <path
          d="M10 48 C10 48 10 28 10 28 C10 20 15 15 22 15 C27 15 30 18 32 22 C34 18 37 15 42 15 C49 15 54 20 54 28 L54 48"
          stroke={`url(#grad-${variant})`}
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M32 48 L32 26"
          stroke={`url(#grad-${variant})`}
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <circle cx="18" cy="8" r="5" fill="#3b82f6" />
        <circle cx="46" cy="8" r="5" fill="#8b5cf6" />
      </svg>

      {/* Text: eelo (the icon represents the m) */}
      {showText && (
        <span className={`${s.text} font-extrabold tracking-tight`} style={{ color: textColor }}>
          eelo
        </span>
      )}
    </div>
  );
}
