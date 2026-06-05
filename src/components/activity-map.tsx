"use client";

import { useEffect, useState } from "react";
import { Activity } from "@/types";
import { useActivityStore } from "@/stores/activity-store";
import { getCurrentPosition } from "@/lib/geo-utils";
import { Navigation, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

interface ActivityMapProps {
  activities: Activity[];
  selectedId?: string | null;
  onSelectActivity: (id: string) => void;
}

const MapInner = dynamic(() => import("./map-inner"), { ssr: false });

export function ActivityMap({ activities, selectedId, onSelectActivity }: ActivityMapProps) {
  const { userLocation } = useActivityStore();
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    userLocation ? [userLocation.lat, userLocation.lng] : [19.076, 72.8777]
  );

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  const handleMyLocation = async () => {
    setIsLocating(true);
    try {
      const pos = await getCurrentPosition();
      setMapCenter([pos.lat, pos.lng]);
    } catch { /* */ }
    finally { setIsLocating(false); }
  };

  return (
    <div className="relative h-full overflow-hidden">
      <MapInner
        activities={activities}
        selectedId={selectedId}
        onSelectActivity={onSelectActivity}
        center={mapCenter}
        userLocation={userLocation}
      />

      {/* My Location button */}
      <button
        onClick={handleMyLocation}
        disabled={isLocating}
        className="absolute bottom-6 right-4 z-[1000] h-10 w-10 bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.16)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] transition-shadow border border-[#E2E2E2]/50 dark:border-[#333333]/50"
        title="My Location"
      >
        {isLocating ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#4285F4]" />
        ) : (
          <Navigation className="h-4 w-4 text-[#000000] dark:text-[#FFFFFF]" />
        )}
      </button>
    </div>
  );
}
