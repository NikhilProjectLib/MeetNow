"use client";

import { useState, useCallback } from "react";
import { useUserProfileStore } from "@/stores/user-profile-store";
import { useActivityStore } from "@/stores/activity-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { canJoinActivity, canCreateActivity, canSendChat } from "@/lib/tier-service";

export function useTierCheck() {
  const { profile } = useUserProfileStore();
  const { activities } = useActivityStore();
  const currentUser = useCurrentUser();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");

  const checkCanJoin = useCallback(() => {
    if (!currentUser) return false;
    const activeJoins = activities.filter(
      (a) =>
        a.players.some((p) => p.id === currentUser.id) &&
        new Date(`${a.date} ${a.time}`) > new Date()
    ).length;

    const result = canJoinActivity(profile, activeJoins);
    if (!result.allowed) {
      setUpgradeReason(result.reason || "");
      setShowUpgrade(true);
      return false;
    }
    return true;
  }, [profile, activities, currentUser]);

  const checkCanCreate = useCallback(() => {
    if (!currentUser) return false;
    const activeCreates = activities.filter(
      (a) =>
        a.createdBy === currentUser.id &&
        new Date(`${a.date} ${a.time}`) > new Date()
    ).length;

    const result = canCreateActivity(profile, activeCreates);
    if (!result.allowed) {
      setUpgradeReason(result.reason || "");
      setShowUpgrade(true);
      return false;
    }
    return true;
  }, [profile, activities, currentUser]);

  const checkCanChat = useCallback(() => {
    const result = canSendChat(profile);
    if (!result.allowed) {
      setUpgradeReason(result.reason || "");
      setShowUpgrade(true);
      return false;
    }
    return true;
  }, [profile]);

  const closeUpgrade = useCallback(() => {
    setShowUpgrade(false);
    setUpgradeReason("");
  }, []);

  return {
    checkCanJoin,
    checkCanCreate,
    checkCanChat,
    showUpgrade,
    upgradeReason,
    closeUpgrade,
  };
}
