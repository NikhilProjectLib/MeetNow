"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Crosshair, Loader2, Map, Search } from "lucide-react";
import { getCurrentPosition } from "@/lib/geo-utils";
import { MapLocationPicker } from "@/components/map-location-picker";
import { useActivityStore } from "@/stores/activity-store";

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY || "";

interface LocationPickerProps {
  location: string;
  lat: number;
  lng: number;
  onLocationChange: (location: string) => void;
  onCoordsChange: (lat: number, lng: number) => void;
  error?: string;
  popularLocations?: string[];
}

interface GeoResult {
  formatted: string;
  address_line1: string;
  address_line2: string;
  lat: number;
  lon: number;
  distance?: number;
  category?: string;
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
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { userLocation } = useActivityStore();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Geoapify Autocomplete — real-time, proximity-biased, like Google
  useEffect(() => {
    if (!location || location.length < 2 || !GEOAPIFY_KEY) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const userLat = userLocation?.lat || 22.7196; // Indore fallback
        const userLng = userLocation?.lng || 75.8577;

        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(location)}&bias=proximity:${userLng},${userLat}&limit=6&apiKey=${GEOAPIFY_KEY}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.features && data.features.length > 0) {
          const results: GeoResult[] = data.features.map((f: any) => ({
            formatted: f.properties.formatted,
            address_line1: f.properties.address_line1 || f.properties.name || "",
            address_line2: f.properties.address_line2 || "",
            lat: f.properties.lat,
            lon: f.properties.lon,
            distance: f.properties.distance,
            category: f.properties.category,
          }));
          setSuggestions(results);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [location]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelectSuggestion = (result: GeoResult) => {
    onLocationChange(result.address_line1 || result.formatted.split(",")[0]);
    onCoordsChange(result.lat, result.lon);
    setSuggestions([]);
    setShowDropdown(false);
    setGeoStatus("📍 Location selected");
  };

  const handleInputChange = (value: string) => {
    onLocationChange(value);
    onCoordsChange(0, 0);
  };

  const handleUseMyLocation = async () => {
    setIsLocating(true);
    setGeoStatus("");
    try {
      const pos = await getCurrentPosition();
      onCoordsChange(pos.lat, pos.lng);

      // Reverse geocode with Geoapify
      const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${pos.lat}&lon=${pos.lng}&apiKey=${GEOAPIFY_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.features && data.features.length > 0) {
        const props = data.features[0].properties;
        const label = props.address_line1 || props.street || props.suburb || props.city || props.formatted.split(",")[0];
        onLocationChange(label);
      } else {
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

  const formatDistance = (dist?: number) => {
    if (!dist) return "";
    if (dist < 1000) return `${Math.round(dist)} m`;
    return `${(dist / 1000).toFixed(1)} km`;
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF] flex items-center gap-1.5">
        <MapPin className="h-4 w-4 text-[#6B6B6B]" />
        Location
      </label>

      {/* Search input with autocomplete */}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#6B6B6B]" />
          ) : (
            <Search className="h-4 w-4 text-[#6B6B6B]" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for area, street, or place..."
          value={location}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
          className="w-full pl-10 pr-4 py-3 bg-[#FFFFFF] dark:bg-[#000000] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] placeholder:text-[#6B6B6B] outline-none border border-[#E2E2E2] dark:border-[#333333] focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF] transition-all"
        />

        {/* Autocomplete dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-[#FFFFFF] dark:bg-[#1A1A1A] border border-[#E2E2E2] dark:border-[#333333] rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {suggestions.map((result, i) => (
              <button
                key={i}
                type="button"
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#F6F6F6] dark:hover:bg-[#262626] transition-colors text-left border-b border-[#F6F6F6] dark:border-[#262626] last:border-0"
                onClick={() => handleSelectSuggestion(result)}
              >
                <MapPin className="h-4 w-4 text-[#000000] dark:text-[#FFFFFF] mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#000000] dark:text-[#FFFFFF] font-medium line-clamp-1">
                    {result.address_line1}
                  </p>
                  <p className="text-xs text-[#6B6B6B] line-clamp-1 mt-0.5">
                    {result.address_line2}
                  </p>
                </div>
                {result.distance !== undefined && (
                  <span className="text-[11px] text-[#6B6B6B] shrink-0 mt-1">
                    {formatDistance(result.distance)}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setShowMap(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-full text-[0.8125rem] font-medium text-[#000000] dark:text-[#FFFFFF] hover:bg-[#E2E2E2] dark:hover:bg-[#333333] transition-colors"
        >
          <Map className="h-3.5 w-3.5" />
          Select on Map
        </button>

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-full text-[0.8125rem] font-medium text-[#000000] dark:text-[#FFFFFF] hover:bg-[#E2E2E2] dark:hover:bg-[#333333] transition-colors disabled:opacity-50"
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

      {/* Selected confirmation */}
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
                className="text-xs px-2.5 py-1 rounded-full bg-[#F6F6F6] dark:bg-[#1A1A1A] text-[#000000] dark:text-[#FFFFFF] hover:bg-[#E2E2E2] dark:hover:bg-[#333333] transition-colors"
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
