import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";

export type UserTier = "basic" | "premium";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  tier: UserTier;
  referralCode: string;
  referredBy: string | null;
  referralCount: number;
  premiumUnlockedAt: string | null;
  createdAt: string;
}

/**
 * Generate a unique referral code (MEELO-XXXX format)
 */
function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `MEELO-${code}`;
}

/**
 * Get or create user profile in Firestore
 */
export async function getOrCreateUserProfile(
  uid: string,
  displayName: string,
  email: string,
  photoURL: string | null,
  referredByCode?: string
): Promise<UserProfile> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }

  // New user — create profile
  let referralCode = generateReferralCode();

  // Ensure unique code
  let attempts = 0;
  while (attempts < 5) {
    const existing = await findUserByReferralCode(referralCode);
    if (!existing) break;
    referralCode = generateReferralCode();
    attempts++;
  }

  // Validate referral code if provided
  let validReferredBy: string | null = null;
  if (referredByCode && referredByCode.trim()) {
    const referrer = await findUserByReferralCode(referredByCode.trim().toUpperCase());
    if (referrer && referrer.uid !== uid) {
      validReferredBy = referredByCode.trim().toUpperCase();
      // Increment referrer's count
      await incrementReferralCount(referrer.uid);
    }
  }

  const profile: UserProfile = {
    uid,
    displayName,
    email,
    photoURL,
    tier: "basic",
    referralCode,
    referredBy: validReferredBy,
    referralCount: 0,
    premiumUnlockedAt: null,
    createdAt: new Date().toISOString(),
  };

  await setDoc(userRef, profile);
  return profile;
}

/**
 * Find a user by their referral code
 */
export async function findUserByReferralCode(code: string): Promise<UserProfile | null> {
  const q = query(collection(db, "users"), where("referralCode", "==", code));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as UserProfile;
}

/**
 * Increment referral count and check for premium upgrade
 */
async function incrementReferralCount(uid: string): Promise<void> {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    referralCount: increment(1),
  });

  // Check if user now qualifies for premium
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data() as UserProfile;
    if (data.referralCount >= 3 && data.tier === "basic") {
      await updateDoc(userRef, {
        tier: "premium",
        premiumUnlockedAt: new Date().toISOString(),
      });
    }
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;
  return userSnap.data() as UserProfile;
}

/**
 * Check if user has premium access
 */
export function isPremium(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return profile.tier === "premium";
}

/**
 * Get referral progress (x out of 3)
 */
export function getReferralProgress(profile: UserProfile | null): {
  count: number;
  needed: number;
  isComplete: boolean;
} {
  const count = profile?.referralCount || 0;
  return {
    count: Math.min(count, 3),
    needed: 3,
    isComplete: count >= 3,
  };
}
