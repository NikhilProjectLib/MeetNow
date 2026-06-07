"use client";

import { useState, useCallback, useEffect } from "react";
import { MapPin, Crosshair, Loader2, X, Search } from "lucide-react";
import { getCurrentPosition } from "@/lib/geo-utils";
import dynamic from "next/dynamic";

const LocationMapInner = dynamic(() => import("./location-map-inner"), { ssr: false });

interface MapLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { location: string; lat: number; lng: number }) => void;
  initialLat?: number;
  initialLng?: number;
}

export function MapLocationPicker({
  isOpen,
  onClose,
  onConfirm,
  initialLat,
  initialLng,
}: MapLocationPickerProps) {
  const [center, setCenter] = useState<[number, number]>([
    initialLat || 19.076,
    initialLng || 72.8777,
  ]);
  const [address, setAddress] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Reverse geocode — always returns a readable address name
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      const data = await res.json();
      if (data.display_name) {
        const addr = data.address || {};
        const parts: string[] = [];
        if (addr.road || addr.pedestrian) parts.push(addr.road || addr.pedestrian);
        if (addr.suburb || addr.neighbourhood) parts.push(addr.suburb || addr.neighbourhood);
        if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
        
        const label = parts.length > 0
          ? parts.slice(0, 3).join(", ")
          : data.display_name.split(",").slice(0, 3).join(",").trim();
        setAddress(label);
      } else {
        setAddress(`Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      }
    } catch {
      setAddress(`Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  const handleMapMove = (lat: number, lng: number) => {
    setCenter([lat, lng]);
    reverseGeocode(lat, lng);
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

  const handleSearch = async (query?: string) => {
    const q = query || searchQuery;
    if (!q.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1&countrycodes=in`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch { /* */ }
    finally { setIsSearching(false); }
  };

  // Live search as user types (debounced)
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => handleSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (result: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setCenter([lat, lng]);
    // Use a clean short name from the result
    const parts = result.display_name.split(",");
    setAddress(parts.slice(0, 3).join(",").trim());
    setSearchResults([]);
    setSearchQuery("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#000000]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-[600px] bg-[#FFFFFF] dark:bg-[#000000] rounded-2xl border border-[#E2E2E2] dark:border-[#333333] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E2E2] dark:border-[#333333] shrink-0">
          <h2 className="font-bold text-[#000000] dark:text-[#FFFFFF]">Select Location</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-[#F6F6F6] dark:bg-[#1A1A1A] flex items-center justify-center hover:bg-[#E2E2E2] dark:hover:bg-[#333333] transition-colors">
            <X className="h-4 w-4 text-[#000000] dark:text-[#FFFFFF]" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-[#E2E2E2] dark:border-[#333333] shrink-0 relative z-20">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B]" />
              <input
                type="text"
                placeholder="Search for area, street, or place..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] placeholder:text-[#6B6B6B] outline-none focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="uber-btn text-xs px-4 py-2"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </button>
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="absolute left-5 right-5 top-full bg-[#FFFFFF] dark:bg-[#1A1A1A] border border-[#E2E2E2] dark:border-[#333333] rounded-xl shadow-xl max-h-48 overflow-y-auto mt-1 z-30">
              {searchResults.map((result, i) => (
                <button
                  key={i}
                  className="w-full text-left px-4 py-3 hover:bg-[#F6F6F6] dark:hover:bg-[#262626] transition-colors flex items-start gap-3 border-b border-[#E2E2E2] dark:border-[#333333] last:border-0"
                  onClick={() => handleSelectSearchResult(result)}
                >
                  <MapPin className="h-4 w-4 text-[#000000] dark:text-[#FFFFFF] mt-0.5 shrink-0" />
                  <p className="text-sm text-[#000000] dark:text-[#FFFFFF] line-clamp-2">{result.display_name}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <LocationMapInner center={center} onMove={handleMapMove} />

          {/* Center Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-[1000]">
            <div className="flex flex-col items-center">
              <div className="bg-[#000000] dark:bg-[#FFFFFF] rounded-full p-2 shadow-lg">
                <MapPin className="h-5 w-5 text-[#FFFFFF] dark:text-[#000000]" />
              </div>
              <div className="w-2 h-2 bg-[#000000]/30 dark:bg-[#FFFFFF]/30 rounded-full mt-0.5" />
            </div>
          </div>

          {/* My Location */}
          <button
            onClick={handleMyLocation}
            disabled={isLocating}
            className="absolute bottom-4 right-4 z-[1000] h-10 w-10 bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-full flex items-center justify-center shadow-lg hover:bg-[#F6F6F6] dark:hover:bg-[#333333] transition-colors border border-[#E2E2E2]/50 dark:border-[#333333]/50"
          >
            {isLocating ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#4285F4]" />
            ) : (
              <Crosshair className="h-4 w-4 text-[#000000] dark:text-[#FFFFFF]" />
            )}
          </button>
        </div>

        {/* Footer — shows selected address */}
        <div className="px-5 py-4 border-t border-[#E2E2E2] dark:border-[#333333] shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-[#F6F6F6] dark:bg-[#1A1A1A] flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#000000] dark:text-[#FFFFFF] truncate">
                {isGeocoding ? "Finding address..." : address || "Drag the map to select location"}
              </p>
              <p className="text-xs text-[#6B6B6B]">
                {center[0].toFixed(5)}, {center[1].toFixed(5)}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="uber-btn w-full py-3.5"
            onClick={() => onConfirm({ location: address, lat: center[0], lng: center[1] })}
            disabled={!address || isGeocoding}
          >
            Confirm this location
          </button>
        </div>
      </div>
    </div>
  );
}
