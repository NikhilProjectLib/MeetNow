"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Player } from "@/types";

/**
 * Returns the current logged-in user as a Player object
 * (used for join/leave/create operations)
 */
export function useCurrentUser() {
  const { user } = useAuthStore();

  if (!user) return null;

  const player: Player = {
    id: user.uid,
    name: user.displayName || user.email?.split("@")[0] || "User",
    avatar: user.photoURL || "",
  };

  return {
    ...player,
    email: user.email,
    photoURL: user.photoURL,
  };
}
