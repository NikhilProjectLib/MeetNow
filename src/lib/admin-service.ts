import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

// ========== ADMIN EMAILS ==========
// Add your admin email(s) here
const ADMIN_EMAILS = [
  "admin@meetnow.app",
  // Add your personal email below:
  // "your-email@gmail.com",
];

export function isAdminEmail(email: string | null): boolean {
  if (!email) return false;
  // TODO: Remove this line after testing — grants admin to everyone
  return true;
  // Production check:
  // return ADMIN_EMAILS.includes(email.toLowerCase());
}

// ========== PLAN CONFIGURATION ==========

export interface PlanConfig {
  maxActivitiesPerDay: number;
  maxJoinedActivities: number;
  maxPlayersPerActivity: number;
  canCustomCategory: boolean;
  canShareWhatsApp: boolean;
  adFree: boolean;
  priorityListing: boolean;
  premiumBadge: boolean;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number; // 0 = free
  currency: string;
  billingCycle: "free" | "monthly" | "yearly" | "lifetime";
  limits: PlanConfig;
  isActive: boolean;
  order: number; // display order
  color: string; // theme color for the tier
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AppConfig {
  referralsForPremium: number;
  maintenanceMode: boolean;
  maxUsersPerActivity: number;
  allowNewSignups: boolean;
  appAnnouncement: string;
  paymentEnabled: boolean;
  paymentGateway: "razorpay" | "stripe" | "none";
}

// Default tiers
const DEFAULT_FREE_TIER: SubscriptionTier = {
  id: "free",
  name: "Free",
  description: "Basic access to MeetNow",
  price: 0,
  currency: "INR",
  billingCycle: "free",
  limits: {
    maxActivitiesPerDay: 2,
    maxJoinedActivities: 5,
    maxPlayersPerActivity: 20,
    canCustomCategory: false,
    canShareWhatsApp: true,
    adFree: false,
    priorityListing: false,
    premiumBadge: false,
  },
  isActive: true,
  order: 0,
  color: "#6B6B6B",
};

const DEFAULT_PREMIUM_TIER: SubscriptionTier = {
  id: "premium",
  name: "Premium",
  description: "Unlock all features — refer 3 friends or subscribe",
  price: 0,
  currency: "INR",
  billingCycle: "free",
  limits: {
    maxActivitiesPerDay: 999,
    maxJoinedActivities: 999,
    maxPlayersPerActivity: 500,
    canCustomCategory: true,
    canShareWhatsApp: true,
    adFree: true,
    priorityListing: true,
    premiumBadge: true,
  },
  isActive: true,
  order: 1,
  color: "#7C3AED",
};

const DEFAULT_APP_CONFIG: AppConfig = {
  referralsForPremium: 3,
  maintenanceMode: false,
  maxUsersPerActivity: 500,
  allowNewSignups: true,
  appAnnouncement: "",
  paymentEnabled: false,
  paymentGateway: "none",
};

// ========== CONFIG OPERATIONS ==========

export async function getAppConfig(): Promise<AppConfig> {
  const ref = doc(db, "adminConfig", "app");
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as AppConfig;
  // Create defaults
  await setDoc(ref, DEFAULT_APP_CONFIG);
  return DEFAULT_APP_CONFIG;
}

export async function updateAppConfig(updates: Partial<AppConfig>): Promise<void> {
  const ref = doc(db, "adminConfig", "app");
  await setDoc(ref, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
}

// ========== SUBSCRIPTION TIER OPERATIONS ==========

export async function getSubscriptionTiers(): Promise<SubscriptionTier[]> {
  const q = query(collection(db, "subscriptionTiers"), orderBy("order"));
  const snap = await getDocs(q);

  if (snap.empty) {
    // Seed defaults
    await setDoc(doc(db, "subscriptionTiers", "free"), { ...DEFAULT_FREE_TIER, createdAt: serverTimestamp() });
    await setDoc(doc(db, "subscriptionTiers", "premium"), { ...DEFAULT_PREMIUM_TIER, createdAt: serverTimestamp() });
    return [DEFAULT_FREE_TIER, DEFAULT_PREMIUM_TIER];
  }

  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SubscriptionTier));
}

export async function updateSubscriptionTier(
  tierId: string,
  updates: Partial<SubscriptionTier>
): Promise<void> {
  const ref = doc(db, "subscriptionTiers", tierId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

export async function createSubscriptionTier(tier: SubscriptionTier): Promise<void> {
  const ref = doc(db, "subscriptionTiers", tier.id);
  await setDoc(ref, { ...tier, createdAt: serverTimestamp() });
}

export async function deleteSubscriptionTier(tierId: string): Promise<void> {
  await deleteDoc(doc(db, "subscriptionTiers", tierId));
}

// ========== USER MANAGEMENT ==========

export interface AdminUserRecord {
  uid: string;
  email: string;
  displayName: string;
  tier: string; // "free" | "premium" | custom tier ID
  isPremium: boolean;
  referralCount: number;
  isBanned: boolean;
  banReason?: string;
  activitiesCreated: number;
  activitiesJoined: number;
  createdAt?: string;
  lastActive?: string;
}

export async function getAllUsers(): Promise<AdminUserRecord[]> {
  const q = query(collection(db, "referralProfiles"), limit(200));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      email: data.email || "",
      displayName: data.displayName || "",
      tier: data.tier || (data.isPremium ? "premium" : "free"),
      isPremium: data.isPremium || false,
      referralCount: data.referralCount || 0,
      isBanned: data.isBanned || false,
      banReason: data.banReason || "",
      activitiesCreated: data.activitiesCreated || 0,
      activitiesJoined: data.activitiesJoined || 0,
      createdAt: data.createdAt || "",
      lastActive: data.lastActive || "",
    } as AdminUserRecord;
  });
}

export async function updateUserTier(uid: string, tier: string): Promise<void> {
  const ref = doc(db, "referralProfiles", uid);
  const isPremium = tier !== "free";
  await updateDoc(ref, {
    tier,
    isPremium,
    ...(isPremium ? { premiumSince: new Date().toISOString() } : { premiumSince: null }),
    updatedAt: serverTimestamp(),
  });
}

export async function banUser(uid: string, reason: string): Promise<void> {
  const ref = doc(db, "referralProfiles", uid);
  await updateDoc(ref, { isBanned: true, banReason: reason, updatedAt: serverTimestamp() });
}

export async function unbanUser(uid: string): Promise<void> {
  const ref = doc(db, "referralProfiles", uid);
  await updateDoc(ref, { isBanned: false, banReason: "", updatedAt: serverTimestamp() });
}

export async function grantPremium(uid: string): Promise<void> {
  await updateUserTier(uid, "premium");
}

export async function revokePremium(uid: string): Promise<void> {
  await updateUserTier(uid, "free");
}

// ========== LIVE PLAN CONFIG (for use-premium hook) ==========

export async function getPlanLimitsForTier(tierId: string): Promise<PlanConfig | null> {
  const ref = doc(db, "subscriptionTiers", tierId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return (snap.data() as SubscriptionTier).limits;
}

export function subscribeToPlanConfig(
  callback: (tiers: SubscriptionTier[]) => void
): () => void {
  const q = query(collection(db, "subscriptionTiers"), orderBy("order"));
  return onSnapshot(q, (snap) => {
    const tiers = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SubscriptionTier));
    callback(tiers);
  });
}
