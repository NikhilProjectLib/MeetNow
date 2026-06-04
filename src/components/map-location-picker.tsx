"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Crosshair, Loader2, X, Search } from "lucide-react";
import { getCurrentPosition } from "@/lib/geo-utils";

interface MapLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { location: string; lat: number; lng: number }) => void;
  initialLat?: number;
  initialLng?: number;
}

const mapContainerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 19.076, lng: 72.8777 };
const libraries: ("places")[] = ["places"];

export function MapLocationPicker({
  isOpen,
  onClose,
  onConfirm,
  initialLat,
  initialLng,
}: MapLocationPickerProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [center, setCenter] = useState({
    lat: initialLat || defaultCenter.lat,
    lng: initialLng || defaultCenter.lng,
  });
  const [address, setAddress] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { placeId: string; description: string; mainText: string; secondaryText: string }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize autocomplete service once Maps JS is loaded
  useEffect(() => {
    if (isLoaded && !autocompleteRef.current) {
      autocompleteRef.current = new google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  // Reverse geocode
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (!isLoaded) return;
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });
      if (result.results[0]) {
        const components = result.results[0].address_components;
        const sublocality = components.find((c) =>
          c.types.includes("sublocality_level_1") || c.types.includes("sublocality")
        );
        const locality = components.find((c) => c.types.includes("locality"));
        const neighborhood = components.find((c) => c.types.includes("neighborhood"));

        const parts = [
          neighborhood?.long_name || sublocality?.long_name || "",
          locality?.long_name || "",
        ].filter(Boolean);

        setAddress(parts.join(", ") || result.results[0].formatted_address);
      }
    } catch {
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  }, [isLoaded]);

  // Handle map drag
  const handleDragEnd = useCallback(() => {
    if (!mapRef.current) return;
    const c = mapRef.current.getCenter();
    if (c) {
      const lat = c.lat();
      const lng = c.lng();
      setCenter({ lat, lng });
      reverseGeocode(lat, lng);
    }
  }, [reverseGeocode]);

  // My location
  const handleMyLocation = async () => {
    setIsLocating(true);
    try {
      const pos = await getCurrentPosition();
      setCenter(pos);
      mapRef.current?.panTo(pos);
      reverseGeocode(pos.lat, pos.lng);
    } catch { /* keep current */ }
    finally { setIsLocating(false); }
  };

  // Search with debounce
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    searchTimeout.current = setTimeout(() => {
      if (!autocompleteRef.current) {
        // Fallback: try initializing again
        if (isLoaded) {
          autocompleteRef.current = new google.maps.places.AutocompleteService();
        }
      }

      if (!autocompleteRef.current) {
        setIsSearching(false);
        return;
      }

      autocompleteRef.current.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: "in" },
          types: ["establishment", "geocode"],
        },
        (predictions, status) => {
          setIsSearching(false);
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setSearchResults(
              predictions.map((p) => ({
                placeId: p.place_id,
                description: p.description,
                mainText: p.structured_formatting.main_text,
                secondaryText: p.structured_formatting.secondary_text || "",
              }))
            );
          } else {
            setSearchResults([]);
          }
        }
      );
    }, 300); // 300ms debounce
  };

  // Select a place from search results
  const handleSelectPlace = (placeId: string, description: string) => {
    if (!mapRef.current) return;

    const placesService = new google.maps.places.PlacesService(mapRef.current);
    placesService.getDetails(
      { placeId, fields: ["geometry", "formatted_address", "name"] },
      (place) => {
        if (place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setCenter({ lat, lng });
          mapRef.current?.panTo({ lat, lng });
          mapRef.current?.setZoom(16);
          setAddress(place.name ? `${place.name}, ${description}` : description);
          setSearchQuery("");
          setSearchResults([]);
        }
      }
    );
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    reverseGeocode(center.lat, center.lng);
  }, [center.lat, center.lng, reverseGeocode]);

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

        {/* Search Bar */}
        <div className="px-4 py-3 border-b shrink-0 relative z-20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for area, street, or place..."
              className="pl-9 pr-9"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              autoFocus
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Dropdown results */}
          {searchResults.length > 0 && (
            <div className="absolute left-4 right-4 top-full bg-card border rounded-lg shadow-xl max-h-60 overflow-y-auto mt-1">
              {searchResults.map((result) => (
                <button
                  key={result.placeId}
                  className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors flex items-start gap-3 border-b last:border-0"
                  onClick={() => handleSelectPlace(result.placeId, result.description)}
                >
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{result.mainText}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.secondaryText}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results hint */}
          {searchQuery.length > 2 && !isSearching && searchResults.length === 0 && (
            <div className="absolute left-4 right-4 top-full bg-card border rounded-lg shadow-xl mt-1 p-3">
              <p className="text-sm text-muted-foreground text-center">No places found. Try a different search.</p>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={15}
              onLoad={onMapLoad}
              onDragEnd={handleDragEnd}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
                zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
                gestureHandling: "greedy",
                styles: [
                  { featureType: "poi", stylers: [{ visibility: "off" }] },
                  { featureType: "transit", stylers: [{ visibility: "off" }] },
                ],
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading map...
            </div>
          )}

          {/* Center Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10">
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
            className="absolute bottom-4 right-4 z-10 bg-card border rounded-full p-3 shadow-lg hover:bg-secondary transition-colors"
            title="Go to my location"
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
                {center.lat.toFixed(5)}, {center.lng.toFixed(5)}
              </p>
            </div>
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={() => onConfirm({ location: address, lat: center.lat, lng: center.lng })}
            disabled={!address}
          >
            Confirm this location
          </Button>
        </div>
      </div>
    </div>
  );
}
