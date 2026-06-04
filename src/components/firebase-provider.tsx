"use client";

import { useEffect } from "react";
import { useActivityStore } from "@/stores/activity-store";
import { subscribeToActivities } from "@/lib/activity-service";
import { getCurrentPosition } from "@/lib/geo-utils";

/**
 * Connects to Firestore for real-time activity sync.
 * Also requests user's geolocation on mount.
 */
export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const { setActivities, setUserLocation, setFirebaseConnected } = useActivityStore();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = subscribeToActivities((activities) => {
        // Once we receive data from Firestore, use it (replaces mock data)
        setActivities(activities);
        setFirebaseConnected(true);
      });
    } catch (err) {
      console.log("Firebase not available, using local mock data:", err);
      setFirebaseConnected(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [setActivities, setFirebaseConnected]);

  // Request geolocation
  useEffect(() => {
    getCurrentPosition()
      .then((pos) => {
        setUserLocation(pos);
      })
      .catch(() => {
        // Default to Mumbai
        setUserLocation({ lat: 19.076, lng: 72.8777 });
      });
  }, [setUserLocation]);

  return <>{children}</>;
}
