"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Reverse geocode using Nominatim (free)
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      if (data.display_name) {
        const short =
          data.address?.suburb ||
          data.address?.neighbourhood ||
          data.address?.road ||
          "";
        const city = data.address?.city || data.address?.town || data.address?.village || "";
        setAddress(short ? `${short}, ${city}` : city || data.display_name.split(",").slice(0, 2).join(","));
      }
    } catch {
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
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

  // Search using Nominatim
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&countrycodes=in`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch { /* */ }
    finally { setIsSearching(false); }
  };

  const handleSelectSearchResult = (result: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setCenter([lat, lng]);
    setAddress(result.display_name.split(",").slice(0, 3).join(","));
    setSearchResults([]);
    setSearchQuery("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-[600px] bg-card rounded-xl border shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Select Location</h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-secondary flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b shrink-0 relative z-20">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for area, street, or place..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button type="button" size="default" onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>

          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-4 right-4 top-full bg-card border rounded-lg shadow-xl max-h-48 overflow-y-auto mt-1 z-30">
              {searchResults.map((result, i) => (
                <button
                  key={i}
                  className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors flex items-start gap-3 border-b last:border-0"
                  onClick={() => handleSelectSearchResult(result)}
                >
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm truncate">{result.display_name}</p>
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
              <div className="bg-primary rounded-full p-2 shadow-lg">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="w-2 h-2 bg-primary/40 rounded-full mt-0.5" />
            </div>
          </div>

          {/* My Location FAB */}
          <button
            onClick={handleMyLocation}
            disabled={isLocating}
            className="absolute bottom-4 right-4 z-[1000] bg-white border rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors"
          >
            {isLocating ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <Crosshair className="h-5 w-5 text-primary" />
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t bg-card shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{address || "Drag the map to select location"}</p>
              <p className="text-xs text-muted-foreground">
                {center[0].toFixed(5)}, {center[1].toFixed(5)}
              </p>
            </div>
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={() => onConfirm({ location: address, lat: center[0], lng: center[1] })}
            disabled={!address}
          >
            Confirm this location
          </Button>
        </div>
      </div>
    </div>
  );
}
