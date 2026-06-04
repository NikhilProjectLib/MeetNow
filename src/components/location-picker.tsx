"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
        onLocationChange(`${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`);
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
      <label className="text-sm font-medium flex items-center gap-1.5">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        Location
      </label>

      {/* Text input */}
      <Input
        placeholder="e.g., Central Park, Sports Complex..."
        value={location}
        onChange={(e) => onLocationChange(e.target.value)}
      />

      {/* Action buttons row */}
      <div className="flex gap-2 flex-wrap">
        {/* Select on Map — Uber/Rapido style */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowMap(true)}
          className="gap-1.5"
        >
          <Map className="h-4 w-4" />
          Select on Map
        </Button>

        {/* Use current location */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="gap-1.5"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Crosshair className="h-4 w-4" />
          )}
          Use my location
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
      {geoStatus && <p className="text-xs text-muted-foreground">{geoStatus}</p>}

      {lat !== 0 && lng !== 0 && (
        <p className="text-xs text-muted-foreground">
          📌 Coordinates: {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
      )}

      {/* Popular locations */}
      {popularLocations.length > 0 && !location && (
        <div className="mt-1">
          <p className="text-xs text-muted-foreground mb-1.5">Popular nearby:</p>
          <div className="flex flex-wrap gap-1.5">
            {popularLocations.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => onLocationChange(loc)}
                className="text-xs px-2.5 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
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
