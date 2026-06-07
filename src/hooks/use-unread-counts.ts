"use client";

import { useState, useEffect, useRef } from "react";
import { useCurrentUser } from "./use-current-user";
import { useActivityStore } from "@/stores/activity-store";
import { subscribeToUnreadCounts } from "@/lib/chat-unread-service";

/**
 * Hook that returns unread message counts per activity.
 * Only counts messages from others after your last chat open.
 */
export function useUnreadCounts(): Record<string, number> {
  const currentUser = useCurrentUser();
  const { activities } = useActivityStore();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!currentUser?.id) return;

    // Get activity IDs where user is a participant OR creator
    const relevantActivityIds = activities
      .filter((a) =>
        a.players.some((p) => p.id === currentUser.id) || a.createdBy === currentUser.id
      )
      .map((a) => a.id);

    if (relevantActivityIds.length === 0) {
      setCounts({});
      return;
    }

    // Clean up previous subscription
    if (unsubRef.current) {
      unsubRef.current();
    }

    const unsubscribe = subscribeToUnreadCounts(currentUser.id, relevantActivityIds, (newCounts) => {
      setCounts(newCounts);
    });

    unsubRef.current = unsubscribe;

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [currentUser?.id, activities.length]);

  return counts;
}
