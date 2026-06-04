"use client";

import { useEffect } from "react";
import { useActivityStore } from "@/stores/activity-store";
import { subscribeToActivities } from "@/lib/activity-service";
import { getCurrentPosition } from "@/lib/geo-utils";
import { deleteActivityInFirestore } from "@/lib/activity-service";

/**
 * Connects to Firestore for real-time activity sync.
 * Also handles auto-deletion of expired activities.
 */
export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const { setActivities, setUserLocation, setFirebaseConnected } = useActivityStore();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = subscribeToActivities((activities) => {
        const now = new Date();

        // Auto-delete expired activities
        activities.forEach((a) => {
          if (a.expiresAt) {
            const expiryDate = new Date(a.expiresAt);
            if (expiryDate <= now) {
              // Delete from Firestore (silent)
              deleteActivityInFirestore(a.id).catch(() => {});
            }
          }
        });

        // Only show non-expired activities to users
        const validActivities = activities.filter((a) => {
          if (!a.expiresAt) return true;
          return new Date(a.expiresAt) > now;
        });

        setActivities(validActivities);
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
        setUserLocation({ lat: 19.076, lng: 72.8777 });
      });
  }, [setUserLocation]);

  return <>{children}</>;
}
