"use client";

import dynamic from "next/dynamic";

const LocationMapView = dynamic(() => import("./location-map-view"), { ssr: false });

interface ActivityLocationMapProps {
  lat: number;
  lng: number;
  name: string;
  emoji: string;
}

export function ActivityLocationMap({ lat, lng, name, emoji }: ActivityLocationMapProps) {
  return (
    <div className="relative h-full w-full">
      <LocationMapView lat={lat} lng={lng} name={name} emoji={emoji} />
    </div>
  );
}
