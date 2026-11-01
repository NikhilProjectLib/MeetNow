"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationMapViewProps {
  lat: number;
  lng: number;
  name: string;
  emoji: string;
}

function createPinIcon(emoji: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="width:40px;height:40px;border-radius:50%;background:#000000;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px rgba(0,0,0,0.25);">
          ${emoji}
        </div>
        <div style="width:2px;height:8px;background:#000000;"></div>
        <div style="width:6px;height:3px;background:rgba(0,0,0,0.2);border-radius:50%;"></div>
      </div>
    `,
    iconSize: [40, 54],
    iconAnchor: [20, 54],
    popupAnchor: [0, -54],
  });
}

export default function LocationMapView({ lat, lng, name, emoji }: LocationMapViewProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
      attributionControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
    >
      {/* OpenStreetMap tiles — free, no API key required */}
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />
      <Marker position={[lat, lng]} icon={createPinIcon(emoji)}>
        <Popup>
          <p className="text-sm font-semibold text-[#000000]">{name}</p>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
