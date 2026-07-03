"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useUserProfileStore } from "@/stores/user-profile-store";
import { getOrCreateUserProfile, getUserProfile } from "@/lib/referral-service";

/**
 * Hook that syncs user profile from Firestore when auth state changes.
 * Should be called once in a top-level component (e.g., AppShell).
 */
export function useUserProfileSync() {
  const { user } = useAuthStore();
  const { setProfile, setLoading } = useUserProfileStore();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      try {
        // Try to get existing profile first
        let profile = await getUserProfile(user!.uid);

        if (!profile) {
          // New user — create profile (referral code handled during signup)
          profile = await getOrCreateUserProfile(
            user!.uid,
            user!.displayName || "User",
            user!.email || "",
            user!.photoURL
          );
        }

        if (!cancelled) {
          setProfile(profile);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
        if (!cancelled) {
          setProfile(null);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user, setProfile, setLoading]);
}
