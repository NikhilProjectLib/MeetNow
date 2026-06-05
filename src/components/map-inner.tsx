"use client";

import { useEffect } from "react";
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

// Uber-style pin marker — black circle with white emoji
function createActivityIcon(emoji: string, isSelected: boolean) {
  const size = isSelected ? 48 : 40;
  return L.divIcon({
    className: "",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${isSelected ? "#000000" : "#FFFFFF"};
      border: 2.5px solid ${isSelected ? "#000000" : "#E2E2E2"};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${isSelected ? "22px" : "18px"};
      box-shadow: 0 4px 12px rgba(0,0,0,${isSelected ? "0.3" : "0.12"}), 0 1px 3px rgba(0,0,0,0.08);
      transform: ${isSelected ? "scale(1.1)" : "scale(1)"};
      transition: all 0.2s ease;
      cursor: pointer;
    ">${emoji}</div>
    ${isSelected ? `<div style="
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid #000000;
    "></div>` : ""}`,
    iconSize: [size, size + (isSelected ? 6 : 0)],
    iconAnchor: [size / 2, size / 2 + (isSelected ? 3 : 0)],
    popupAnchor: [0, -(size / 2)],
  });
}

// User location — blue pulsing dot (Google Maps style)
const userIcon = L.divIcon({
  className: "user-location-pin",
  html: `<div style="position: relative; width: 20px; height: 20px;">
    <div style="
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #4285F4;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 0 2px rgba(66,133,244,0.3), 0 2px 8px rgba(0,0,0,0.2);
    "></div>
    <div style="
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      background: rgba(66,133,244,0.15);
      animation: userPulse 2s ease-out infinite;
    "></div>
  </div>
  <style>
    @keyframes userPulse {
      0% { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }
  </style>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Smooth recenter
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1.2, easeLinearity: 0.5 });
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
      zoom={13}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
      attributionControl={false}
    >
      {/* CartoDB Voyager — clean, modern, Google Maps-like tiles */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        maxZoom={19}
        subdomains="abcd"
      />

      <RecenterMap center={center} />

      {/* User location with accuracy circle */}
      {userLocation && (
        <>
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup className="uber-popup">
              <div className="text-center py-1">
                <p className="text-sm font-semibold text-[#000000]">Your location</p>
              </div>
            </Popup>
          </Marker>
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={150}
            pathOptions={{
              color: "#4285F4",
              fillColor: "#4285F4",
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: "4 4",
            }}
          />
        </>
      )}

      {/* Activity markers */}
      {activities.map((activity) => {
        if (!activity.lat || !activity.lng) return null;
        const isSelected = activity.id === selectedId;
        const emoji = activity.emoji || categoryEmojis[activity.category] || "📍";

        return (
          <Marker
            key={activity.id}
            position={[activity.lat, activity.lng]}
            icon={createActivityIcon(emoji, isSelected)}
            zIndexOffset={isSelected ? 1000 : 0}
            eventHandlers={{
              click: () => onSelectActivity(activity.id),
              mouseover: (e) => {
                e.target.openPopup();
              },
              mouseout: (e) => {
                if (!isSelected) e.target.closePopup();
              },
            }}
          >
            <Popup className="uber-popup">
              <div className="min-w-[200px] p-1">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-[#F6F6F6] flex items-center justify-center text-xl shrink-0">
                    {activity.emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[0.8125rem] text-[#000000] leading-tight truncate">{activity.name}</p>
                    <p className="text-[11px] text-[#6B6B6B] mt-0.5">{activity.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#6B6B6B] mb-2.5">
                  <span>{activity.date}</span>
                  <span>·</span>
                  <span>{activity.time}</span>
                  <span>·</span>
                  <span>{activity.playersJoined}/{activity.playersNeeded} joined</span>
                </div>
                <Link
                  href={`/activity/${activity.id}`}
                  className="block text-center text-[0.8125rem] font-medium text-[#FFFFFF] bg-[#000000] rounded-full py-2 px-4 hover:bg-[#333333] transition-colors"
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
