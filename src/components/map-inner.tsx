"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { Activity } from "@/types";
import { categoryEmojis } from "@/lib/mock-data";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

interface MapInnerProps {
  activities: Activity[];
  selectedId?: string | null;
  onSelectActivity: (id: string) => void;
  center: [number, number];
  userLocation: { lat: number; lng: number } | null;
}

// Custom emoji marker icon
function createEmojiIcon(emoji: string, isSelected: boolean) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: ${isSelected ? "44px" : "36px"};
      height: ${isSelected ? "44px" : "36px"};
      border-radius: 50%;
      background: ${isSelected ? "#6366f1" : "#ffffff"};
      border: 2px solid ${isSelected ? "#4f46e5" : "#d1d5db"};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${isSelected ? "20px" : "16px"};
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      transition: all 0.2s;
    ">${emoji}</div>`,
    iconSize: [isSelected ? 44 : 36, isSelected ? 44 : 36],
    iconAnchor: [isSelected ? 22 : 18, isSelected ? 22 : 18],
  });
}

// User location icon
const userIcon = L.divIcon({
  className: "user-marker",
  html: `<div style="
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #6366f1;
    border: 3px solid #ffffff;
    box-shadow: 0 0 0 2px #6366f1, 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Component to recenter map
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1 });
  }, [center, map]);
  return null;
}

export default function MapInner({
  activities,
  selectedId,
  onSelectActivity,
  center,
  userLocation,
}: MapInnerProps) {
  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ width: "100%", height: "100%" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterMap center={center} />

      {/* User location */}
      {userLocation && (
        <>
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={200}
            pathOptions={{ color: "#6366f1", fillColor: "#6366f1", fillOpacity: 0.1, weight: 1 }}
          />
        </>
      )}

      {/* Activity markers */}
      {activities.map((activity) => {
        if (!activity.lat || !activity.lng) return null;
        const isSelected = activity.id === selectedId;
        const emoji = categoryEmojis[activity.category] || "\u2728";

        return (
          <Marker
            key={activity.id}
            position={[activity.lat, activity.lng]}
            icon={createEmojiIcon(emoji, isSelected)}
            eventHandlers={{
              click: () => onSelectActivity(activity.id),
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{activity.emoji}</span>
                  <p className="font-semibold text-sm">{activity.name}</p>
                </div>
                <p className="text-xs text-gray-600">{activity.location}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activity.date} &bull; {activity.time} &bull; {activity.playersJoined}/{activity.playersNeeded} players
                </p>
                <Link href={`/activity/${activity.id}`} className="text-xs text-blue-600 font-medium hover:underline mt-2 inline-block">
                  View Details &rarr;
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
