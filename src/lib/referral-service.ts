import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface ReferralProfile {
  userId: string;
  referralCode: string;
  referredBy: string | null;
  referralCount: number;
  isPremium: boolean;
  premiumSince: string | null;
  createdAt: unknown;
}

export interface ReferralRecord {
  referrerId: string;
  referredUserId: string;
  referredUserName: string;
  timestamp: unknown;
}

const REFERRALS_REQUIRED = 3; // Number of referrals needed for premium

/**
 * Generate a unique referral code from user ID
 */
function generateReferralCode(userId: string): string {
  const hash = userId.slice(-6).toUpperCase();
  return `MN-${hash}`;
}

/**
 * Get or create referral profile for a user
 */
export async function getReferralProfile(userId: string): Promise<ReferralProfile> {
  const ref = doc(db, "referralProfiles", userId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data() as ReferralProfile;
  }

  // Create new profile
  const profile: ReferralProfile = {
    userId,
    referralCode: generateReferralCode(userId),
    referredBy: null,
    referralCount: 0,
    isPremium: false,
    premiumSince: null,
    createdAt: serverTimestamp(),
  };

  await setDoc(ref, profile);
  return profile;
}

/**
 * Apply a referral code during sign-up or first use
 */
export async function applyReferralCode(
  newUserId: string,
  newUserName: string,
  referralCode: string
): Promise<{ success: boolean; message: string }> {
  // Find referrer by code
  const q = query(
    collection(db, "referralProfiles"),
    where("referralCode", "==", referralCode.toUpperCase())
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    return { success: false, message: "Invalid referral code" };
  }

  const referrerDoc = snap.docs[0];
  const referrerData = referrerDoc.data() as ReferralProfile;

  // Can't refer yourself
  if (referrerData.userId === newUserId) {
    return { success: false, message: "You cannot use your own referral code" };
  }

  // Check if user already used a referral code
  const newUserRef = doc(db, "referralProfiles", newUserId);
  const newUserSnap = await getDoc(newUserRef);

  if (newUserSnap.exists() && newUserSnap.data().referredBy) {
    return { success: false, message: "You have already used a referral code" };
  }

  // Record the referral
  const referralRecordRef = doc(collection(db, "referralRecords"));
  await setDoc(referralRecordRef, {
    referrerId: referrerData.userId,
    referredUserId: newUserId,
    referredUserName: newUserName,
    timestamp: serverTimestamp(),
  });

  // Update referrer's count
  const newCount = referrerData.referralCount + 1;
  const earnedPremium = newCount >= REFERRALS_REQUIRED;

  await updateDoc(doc(db, "referralProfiles", referrerData.userId), {
    referralCount: increment(1),
    ...(earnedPremium && !referrerData.isPremium
      ? { isPremium: true, premiumSince: new Date().toISOString() }
      : {}),
  });

  // Update new user's profile
  await setDoc(
    newUserRef,
    {
      userId: newUserId,
      referralCode: generateReferralCode(newUserId),
      referredBy: referrerData.userId,
      referralCount: 0,
      isPremium: false,
      premiumSince: null,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return {
    success: true,
    message: earnedPremium
      ? `Referral applied! ${referrerData.userId} just earned Premium!`
      : "Referral code applied successfully!",
  };
}

/**
 * Get referral history (people you referred)
 */
export async function getReferralHistory(userId: string): Promise<ReferralRecord[]> {
  const q = query(
    collection(db, "referralRecords"),
    where("referrerId", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ReferralRecord);
}

/**
 * Check if user has premium status
 */
export async function checkPremiumStatus(userId: string): Promise<boolean> {
  const profile = await getReferralProfile(userId);
  return profile.isPremium;
}

/**
 * Get the shareable referral link
 */
export function getReferralLink(referralCode: string): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://meetnow.app";
  return `${baseUrl}/login?ref=${referralCode}`;
}

export const REFERRALS_NEEDED = REFERRALS_REQUIRED;
