"use client";

import { useEffect, useRef, useState } from "react";
import { Activity } from "@/types";
import { categoryEmojis } from "@/lib/mock-data";
import { useActivityStore } from "@/stores/activity-store";
import { getCurrentPosition } from "@/lib/geo-utils";
import { Crosshair, Loader2 } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

interface ActivityMapProps {
  activities: Activity[];
  selectedId?: string | null;
  onSelectActivity: (id: string) => void;
}

// Leaflet must be loaded client-side only
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
    <div className="relative h-full rounded-xl overflow-hidden border">
      <MapInner
        activities={activities}
        selectedId={selectedId}
        onSelectActivity={onSelectActivity}
        center={mapCenter}
        userLocation={userLocation}
      />

      {/* My Location FAB */}
      <button
        onClick={handleMyLocation}
        disabled={isLocating}
        className="absolute bottom-4 right-4 z-[1000] bg-white border rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors"
        title="Go to my location"
      >
        {isLocating ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : (
          <Crosshair className="h-5 w-5 text-primary" />
        )}
      </button>
    </div>
  );
}
