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

// Modern pin marker with label
function createActivityIcon(emoji: string, name: string, isSelected: boolean) {
  const size = isSelected ? 44 : 38;
  // Show short label (max 12 chars) below the pin when selected
  const shortName = name.length > 12 ? name.substring(0, 11) + "…" : name;

  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;position:relative;">
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: ${isSelected ? "16px" : "50%"};
          background: ${isSelected ? "#000000" : "#FFFFFF"};
          border: 2px solid ${isSelected ? "#000000" : "rgba(0,0,0,0.08)"};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isSelected ? "20px" : "17px"};
          box-shadow: ${isSelected
            ? "0 8px 24px rgba(0,0,0,0.25)"
            : "0 2px 8px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)"};
          transition: all 0.2s ease;
          cursor: pointer;
        ">${emoji}</div>
        ${isSelected ? `
          <div style="
            margin-top: 4px;
            padding: 2px 8px;
            background: #000000;
            color: #FFFFFF;
            font-size: 10px;
            font-weight: 600;
            border-radius: 6px;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          ">${shortName}</div>
        ` : ""}
      </div>
    `,
    iconSize: [isSelected ? 100 : size, isSelected ? size + 24 : size],
    iconAnchor: [isSelected ? 50 : size / 2, isSelected ? size / 2 : size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

// User location — blue dot with pulse ring
const userIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:24px;height:24px;">
      <div style="
        position:absolute;
        inset: -12px;
        border-radius: 50%;
        background: rgba(66,133,244,0.1);
        animation: uPulse 2.5s ease-out infinite;
      "></div>
      <div style="
        position:absolute;
        inset: 0;
        border-radius: 50%;
        background: #4285F4;
        border: 3.5px solid #FFFFFF;
        box-shadow: 0 0 0 2px rgba(66,133,244,0.25), 0 2px 8px rgba(0,0,0,0.15);
      "></div>
    </div>
    <style>
      @keyframes uPulse {
        0% { transform: scale(0.5); opacity: 0.8; }
        100% { transform: scale(3); opacity: 0; }
      }
    </style>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Smooth recenter with zoom
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1, easeLinearity: 0.4 });
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
      {/* Google Maps-style tiles — same as Uber/Rapido use */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        maxZoom={19}
        subdomains="abcd"
      />

      <RecenterMap center={center} />

      {/* User location */}
      {userLocation && (
        <>
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center py-1 px-2">
                <p className="text-xs font-semibold text-[#000000]">📍 You are here</p>
              </div>
            </Popup>
          </Marker>
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={200}
            pathOptions={{
              color: "#4285F4",
              fillColor: "#4285F4",
              fillOpacity: 0.06,
              weight: 1,
              dashArray: "6 4",
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
            icon={createActivityIcon(emoji, activity.name, isSelected)}
            zIndexOffset={isSelected ? 1000 : 0}
            eventHandlers={{
              click: () => onSelectActivity(activity.id),
              mouseover: (e) => { e.target.openPopup(); },
              mouseout: (e) => { if (!isSelected) e.target.closePopup(); },
            }}
          >
            <Popup>
              <div className="min-w-[220px] p-2">
                {/* Header */}
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="h-11 w-11 rounded-2xl bg-[#F6F6F6] flex items-center justify-center text-xl shrink-0 shadow-sm">
                    {activity.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[13px] text-[#000000] leading-tight line-clamp-1">{activity.name}</p>
                    <p className="text-[11px] text-[#6B6B6B] mt-0.5 line-clamp-1">{activity.location}</p>
                  </div>
                </div>

                {/* Info pills */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F6F6F6] rounded-full text-[10px] font-medium text-[#000000]">
                    🕐 {activity.time}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F6F6F6] rounded-full text-[10px] font-medium text-[#000000]">
                    👥 {activity.playersJoined}/{activity.playersNeeded}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F6F6F6] rounded-full text-[10px] font-medium text-[#000000]">
                    📅 {activity.date}
                  </span>
                </div>

                {/* CTA */}
                <Link
                  href={`/activity/${activity.id}`}
                  className="block text-center text-[12px] font-semibold text-[#FFFFFF] bg-[#000000] rounded-full py-2.5 px-4 hover:bg-[#333333] transition-colors"
                >
                  View Details →
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
