"use client";

import { useState } from "react";
import { MapPin, Crosshair, Loader2, Map } from "lucide-react";
import { getCurrentPosition } from "@/lib/geo-utils";
import { MapLocationPicker } from "@/components/map-location-picker";

interface LocationPickerProps {
  location: string;
  lat: number;
  lng: number;
  onLocationChange: (location: string) => void;
  onCoordsChange: (lat: number, lng: number) => void;
  error?: string;
  popularLocations?: string[];
}

export function LocationPicker({
  location,
  lat,
  lng,
  onLocationChange,
  onCoordsChange,
  error,
  popularLocations = [],
}: LocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string>("");
  const [showMap, setShowMap] = useState(false);

  const handleUseMyLocation = async () => {
    setIsLocating(true);
    setGeoStatus("");
    try {
      const pos = await getCurrentPosition();
      onCoordsChange(pos.lat, pos.lng);

      // Reverse geocode using Nominatim (free)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${pos.lat}&lon=${pos.lng}&format=json`
        );
        const data = await res.json();
        if (data.display_name) {
          const short =
            data.address?.suburb ||
            data.address?.neighbourhood ||
            data.address?.road ||
            "";
          const city = data.address?.city || data.address?.town || data.address?.village || "";
          const label = short ? `${short}, ${city}` : city || data.display_name.split(",")[0];
          onLocationChange(label);
        }
      } catch {
        onLocationChange(`Near ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`);
      }

      setGeoStatus("📍 Location detected");
    } catch {
      setGeoStatus("❌ Could not detect location");
    } finally {
      setIsLocating(false);
    }
  };

  const handleMapConfirm = (data: { location: string; lat: number; lng: number }) => {
    onLocationChange(data.location);
    onCoordsChange(data.lat, data.lng);
    setShowMap(false);
    setGeoStatus("📍 Location selected from map");
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF] flex items-center gap-1.5">
        <MapPin className="h-4 w-4 text-[#6B6B6B]" />
        Location
      </label>

      {/* Text input — clearly visible with proper placeholder */}
      <input
        type="text"
        placeholder="e.g., Central Park, Sports Complex, Marine Drive..."
        value={location}
        onChange={(e) => onLocationChange(e.target.value)}
        className="w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#000000] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] placeholder:text-[#6B6B6B] outline-none border border-[#E2E2E2] dark:border-[#333333] focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF] transition-all"
      />

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setShowMap(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#FFFFFF] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] rounded-full text-[0.8125rem] font-medium text-[#000000] dark:text-[#FFFFFF] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] transition-colors"
        >
          <Map className="h-3.5 w-3.5" />
          Select on Map
        </button>

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#FFFFFF] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] rounded-full text-[0.8125rem] font-medium text-[#000000] dark:text-[#FFFFFF] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] transition-colors disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Crosshair className="h-3.5 w-3.5" />
          )}
          Use my location
        </button>
      </div>

      {error && <p className="text-xs text-[#E11900]">{error}</p>}
      {geoStatus && <p className="text-xs text-[#6B6B6B]">{geoStatus}</p>}

      {/* Show selected location summary */}
      {location && lat !== 0 && lng !== 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#E6F9EF] dark:bg-[#001A0D] rounded-lg">
          <MapPin className="h-3.5 w-3.5 text-[#06C167] shrink-0" />
          <span className="text-xs text-[#06C167] font-medium truncate">{location}</span>
        </div>
      )}

      {/* Popular locations */}
      {popularLocations.length > 0 && !location && (
        <div className="mt-1">
          <p className="text-xs text-[#6B6B6B] mb-1.5">Popular nearby:</p>
          <div className="flex flex-wrap gap-1.5">
            {popularLocations.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => onLocationChange(loc)}
                className="text-xs px-2.5 py-1 rounded-full bg-[#FFFFFF] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] text-[#000000] dark:text-[#FFFFFF] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map Picker Modal */}
      <MapLocationPicker
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        onConfirm={handleMapConfirm}
        initialLat={lat || undefined}
        initialLng={lng || undefined}
      />
    </div>
  );
}
