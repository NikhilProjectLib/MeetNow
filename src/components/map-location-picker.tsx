"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { MapPin, Crosshair, Loader2, X, Search, Navigation } from "lucide-react";
import { getCurrentPosition } from "@/lib/geo-utils";
import { useActivityStore } from "@/stores/activity-store";
import dynamic from "next/dynamic";

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY || "";
const LocationMapInner = dynamic(() => import("./location-map-inner"), { ssr: false });

interface MapLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { location: string; lat: number; lng: number }) => void;
  initialLat?: number;
  initialLng?: number;
}

interface SearchResult {
  formatted: string;
  address_line1: string;
  address_line2: string;
  lat: number;
  lon: number;
}

export function MapLocationPicker({
  isOpen,
  onClose,
  onConfirm,
  initialLat,
  initialLng,
}: MapLocationPickerProps) {
  const { userLocation } = useActivityStore();
  const [center, setCenter] = useState<[number, number]>([
    initialLat || userLocation?.lat || 22.7196,
    initialLng || userLocation?.lng || 75.8577,
  ]);
  const [address, setAddress] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Reverse geocode with Geoapify
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const url = GEOAPIFY_KEY
        ? `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_KEY}`
        : `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

      const res = await fetch(url);
      const data = await res.json();

      if (GEOAPIFY_KEY && data.features?.length > 0) {
        const props = data.features[0].properties;
        setAddress(props.address_line1 || props.formatted?.split(",")[0] || "Unknown location");
      } else if (data.display_name) {
        const addr = data.address || {};
        const parts: string[] = [];
        if (addr.road || addr.pedestrian) parts.push(addr.road || addr.pedestrian);
        if (addr.suburb || addr.neighbourhood) parts.push(addr.suburb || addr.neighbourhood);
        if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
        setAddress(parts.length > 0 ? parts.join(", ") : data.display_name.split(",").slice(0, 2).join(",").trim());
      }
    } catch {
      setAddress("Selected location");
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  const reverseGeocodeTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMapMove = (lat: number, lng: number) => {
    setCenter([lat, lng]);
    setIsGeocoding(true);

    // Debounce — only geocode after user stops dragging for 800ms
    if (reverseGeocodeTimer.current) clearTimeout(reverseGeocodeTimer.current);
    reverseGeocodeTimer.current = setTimeout(() => {
      reverseGeocode(lat, lng);
    }, 800);
  };

  const handleMyLocation = async () => {
    setIsLocating(true);
    try {
      const pos = await getCurrentPosition();
      setCenter([pos.lat, pos.lng]);
      reverseGeocode(pos.lat, pos.lng);
    } catch { /* */ }
    finally { setIsLocating(false); }
  };

  // Live autocomplete search with Geoapify
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const userLat = userLocation?.lat || center[0];
        const userLng = userLocation?.lng || center[1];

        const url = GEOAPIFY_KEY
          ? `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(searchQuery)}&bias=proximity:${userLng},${userLat}&limit=5&apiKey=${GEOAPIFY_KEY}`
          : `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&addressdetails=1`;

        const res = await fetch(url);
        const data = await res.json();

        if (GEOAPIFY_KEY && data.features) {
          setSearchResults(data.features.map((f: any) => ({
            formatted: f.properties.formatted,
            address_line1: f.properties.address_line1 || f.properties.name || "",
            address_line2: f.properties.address_line2 || "",
            lat: f.properties.lat,
            lon: f.properties.lon,
          })));
        } else if (Array.isArray(data)) {
          setSearchResults(data.map((r: any) => ({
            formatted: r.display_name,
            address_line1: r.display_name.split(",")[0],
            address_line2: r.display_name.split(",").slice(1, 3).join(",").trim(),
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
          })));
        }
      } catch { /* */ }
      finally { setIsSearching(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (result: SearchResult) => {
    setCenter([result.lat, result.lon]);
    setAddress(result.address_line1 || result.formatted.split(",")[0]);
    setSearchResults([]);
    setSearchQuery("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#000000]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-[550px] bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header — search + close */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E2E2E2] dark:border-[#333333] shrink-0">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B]" />
            <input
              type="text"
              placeholder="Search location..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#F6F6F6] dark:bg-[#000000] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] placeholder:text-[#6B6B6B] outline-none focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Autocomplete dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#FFFFFF] dark:bg-[#1A1A1A] border border-[#E2E2E2] dark:border-[#333333] rounded-xl shadow-xl overflow-hidden z-30 max-h-48 overflow-y-auto">
                {searchResults.map((result, i) => (
                  <button
                    key={i}
                    className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-[#F6F6F6] dark:hover:bg-[#262626] transition-colors text-left border-b border-[#F6F6F6] dark:border-[#262626] last:border-0"
                    onClick={() => handleSelectSearchResult(result)}
                  >
                    <MapPin className="h-3.5 w-3.5 text-[#000000] dark:text-[#FFFFFF] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[13px] text-[#000000] dark:text-[#FFFFFF] font-medium line-clamp-1">{result.address_line1}</p>
                      <p className="text-[11px] text-[#6B6B6B] line-clamp-1">{result.address_line2}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-full bg-[#F6F6F6] dark:bg-[#333333] flex items-center justify-center shrink-0 hover:bg-[#E2E2E2] dark:hover:bg-[#444444] transition-colors">
            <X className="h-4 w-4 text-[#000000] dark:text-[#FFFFFF]" />
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <LocationMapInner center={center} onMove={handleMapMove} />

          {/* Center Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-[1000]">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-[#000000] dark:bg-[#FFFFFF] rounded-full flex items-center justify-center shadow-lg">
                <MapPin className="h-4 w-4 text-[#FFFFFF] dark:text-[#000000]" />
              </div>
              <div className="w-0.5 h-2.5 bg-[#000000] dark:bg-[#FFFFFF]" />
              <div className="w-2.5 h-1 bg-[#000000]/20 rounded-full" />
            </div>
          </div>

          {/* My Location */}
          <button
            onClick={handleMyLocation}
            disabled={isLocating}
            className="absolute bottom-4 right-4 z-[1000] h-10 w-10 bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-full flex items-center justify-center shadow-lg border border-[#E2E2E2]/50 dark:border-[#333333]/50 hover:bg-[#F6F6F6] dark:hover:bg-[#333333] transition-colors"
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#4285F4]" />
            ) : (
              <Navigation className="h-4 w-4 text-[#000000] dark:text-[#FFFFFF]" />
            )}
          </button>
        </div>

        {/* Footer — address + confirm */}
        <div className="px-5 py-4 border-t border-[#E2E2E2] dark:border-[#333333] shrink-0 bg-[#FFFFFF] dark:bg-[#1A1A1A]">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-[#F6F6F6] dark:bg-[#333333] flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4 text-[#000000] dark:text-[#FFFFFF]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF] truncate">
                {address || "Selected location"}
              </p>
              <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                {center[0].toFixed(5)}, {center[1].toFixed(5)}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="uber-btn w-full py-3"
            onClick={() => onConfirm({ location: address || `${center[0].toFixed(4)}, ${center[1].toFixed(4)}`, lat: center[0], lng: center[1] })}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
