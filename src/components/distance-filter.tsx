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
      <div className="flex items-center gap-1.5 text-xs font-medium text-[#6B6B6B] shrink-0">
        <MapPin className="h-3.5 w-3.5" />
        <span>Within</span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
        {radiusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setRadiusKm(opt.value)}
            className={cn(
              "uber-chip text-xs shrink-0",
              radiusKm === opt.value && "uber-chip-active"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {!userLocation && (
        <span className="text-[10px] text-[#F9A825] bg-[#FFF8E1] dark:bg-[#1A1500] px-2 py-1 rounded-full shrink-0">
          📍 Enable location
        </span>
      )}
    </div>
  );
}
