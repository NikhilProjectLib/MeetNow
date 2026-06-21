"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { checkPremiumStatus } from "@/lib/referral-service";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  fullWidth?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdBanner({ slot, format = "auto", fullWidth = true, className = "" }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const { user } = useAuthStore();
  const [isPremium, setIsPremium] = useState(false);

  // Check premium status to hide ads
  useEffect(() => {
    if (user?.uid) {
      checkPremiumStatus(user.uid).then(setIsPremium).catch(() => {});
    }
  }, [user?.uid]);

  useEffect(() => {
    if (pushed.current || isPremium) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet or blocked
    }
  }, [isPremium]);

  // Premium users don't see ads
  if (isPremium) return null;

  return (
    <div className={`ad-container overflow-hidden ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-3862555394015481"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={fullWidth ? "true" : "false"}
      />
    </div>
  );
}
