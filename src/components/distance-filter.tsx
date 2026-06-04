"use client";

import { useActivityStore } from "@/stores/activity-store";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

const radiusOptions = [
  { label: "2 km", value: 2 },
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
  { label: "25 km", value: 25 },
  { label: "50 km", value: 50 },
  { label: "All", value: 99999 },
];

export function DistanceFilter() {
  const { radiusKm, setRadiusKm, userLocation } = useActivityStore();

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>Within:</span>
      </div>
      <div className="flex gap-1.5">
        {radiusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setRadiusKm(opt.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              radiusKm === opt.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:border-primary/50 text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {!userLocation && (
        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
          📍 Enable location for distance filter
        </span>
      )}
    </div>
  );
}
