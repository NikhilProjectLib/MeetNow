"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { getReferralProfile } from "@/lib/referral-service";
import { getPlanLimitsForTier, PlanConfig } from "@/lib/admin-service";

export type { PlanConfig as PlanLimits };

// Hardcoded fallbacks (used when Firestore config isn't loaded yet)
const FREE_FALLBACK: PlanConfig = {
  maxActivitiesPerDay: 2,
  maxJoinedActivities: 5,
  maxPlayersPerActivity: 20,
  canCustomCategory: false,
  canShareWhatsApp: true,
  adFree: false,
  priorityListing: false,
  premiumBadge: false,
};

const PREMIUM_FALLBACK: PlanConfig = {
  maxActivitiesPerDay: 999,
  maxJoinedActivities: 999,
  maxPlayersPerActivity: 500,
  canCustomCategory: true,
  adFree: true,
  canShareWhatsApp: true,
  priorityListing: true,
  premiumBadge: true,
};

export function usePremium() {
  const { user } = useAuthStore();
  const [isPremium, setIsPremium] = useState(false);
  const [userTier, setUserTier] = useState<string>("free");
  const [limits, setLimits] = useState<PlanConfig>(FREE_FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setIsPremium(false);
      setUserTier("free");
      setLimits(FREE_FALLBACK);
      setLoading(false);
      return;
    }

    async function loadPlan() {
      try {
        // 1. Get user's tier from their referral profile
        const profile = await getReferralProfile(user!.uid);
        const tier = profile.isPremium ? "premium" : (profile as any).tier || "free";
        setIsPremium(profile.isPremium);
        setUserTier(tier);

        // 2. Load limits from Firestore (admin-configured)
        const configuredLimits = await getPlanLimitsForTier(tier);
        if (configuredLimits) {
          setLimits(configuredLimits);
        } else {
          // Fallback to hardcoded
          setLimits(profile.isPremium ? PREMIUM_FALLBACK : FREE_FALLBACK);
        }
      } catch {
        setIsPremium(false);
        setLimits(FREE_FALLBACK);
      }
      setLoading(false);
    }

    loadPlan();
  }, [user?.uid]);

  return { isPremium, userTier, loading, limits };
}
