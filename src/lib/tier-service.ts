import { UserProfile, isPremium } from "./referral-service";

/**
 * Feature limits for Basic vs Premium tiers
 *
 * Basic (Free):
 * - Join up to 3 active activities
 * - Create up to 1 active activity
 * - Chat: view-only (last 24h messages)
 * - Explore radius: 5km max
 * - Activity history: last 7 days
 * - Ads shown
 *
 * Premium (3 referrals):
 * - Unlimited joins
 * - Unlimited creates
 * - Full chat access
 * - Unlimited explore radius
 * - Full activity history
 * - Ad-free
 */

export interface TierLimits {
  maxActiveJoins: number;
  maxActiveCreates: number;
  chatFullAccess: boolean;
  maxExploreRadiusKm: number | null; // null = unlimited
  historyDays: number | null; // null = unlimited
  showAds: boolean;
}

const BASIC_LIMITS: TierLimits = {
  maxActiveJoins: 3,
  maxActiveCreates: 1,
  chatFullAccess: false,
  maxExploreRadiusKm: 5,
  historyDays: 7,
  showAds: true,
};

const PREMIUM_LIMITS: TierLimits = {
  maxActiveJoins: Infinity,
  maxActiveCreates: Infinity,
  chatFullAccess: true,
  maxExploreRadiusKm: null,
  historyDays: null,
  showAds: false,
};

/**
 * Get limits for user's current tier
 */
export function getTierLimits(profile: UserProfile | null): TierLimits {
  if (isPremium(profile)) return PREMIUM_LIMITS;
  return BASIC_LIMITS;
}

/**
 * Check if user can join another activity
 */
export function canJoinActivity(
  profile: UserProfile | null,
  currentActiveJoins: number
): { allowed: boolean; reason?: string } {
  const limits = getTierLimits(profile);
  if (currentActiveJoins >= limits.maxActiveJoins) {
    return {
      allowed: false,
      reason: `Basic plan allows max ${limits.maxActiveJoins} active activities. Invite 3 friends to unlock unlimited!`,
    };
  }
  return { allowed: true };
}

/**
 * Check if user can create another activity
 */
export function canCreateActivity(
  profile: UserProfile | null,
  currentActiveCreates: number
): { allowed: boolean; reason?: string } {
  const limits = getTierLimits(profile);
  if (currentActiveCreates >= limits.maxActiveCreates) {
    return {
      allowed: false,
      reason: `Basic plan allows max ${limits.maxActiveCreates} active activity. Invite 3 friends to unlock unlimited!`,
    };
  }
  return { allowed: true };
}

/**
 * Check if user can send chat messages
 */
export function canSendChat(profile: UserProfile | null): {
  allowed: boolean;
  reason?: string;
} {
  const limits = getTierLimits(profile);
  if (!limits.chatFullAccess) {
    return {
      allowed: false,
      reason: "Upgrade to Premium to send messages. Invite 3 friends!",
    };
  }
  return { allowed: true };
}

/**
 * Get max explore radius for user
 */
export function getMaxExploreRadius(profile: UserProfile | null): number | null {
  return getTierLimits(profile).maxExploreRadiusKm;
}

/**
 * Check if ads should be shown
 */
export function shouldShowAds(profile: UserProfile | null): boolean {
  return getTierLimits(profile).showAds;
}

/**
 * Get history days limit
 */
export function getHistoryDaysLimit(profile: UserProfile | null): number | null {
  return getTierLimits(profile).historyDays;
}
