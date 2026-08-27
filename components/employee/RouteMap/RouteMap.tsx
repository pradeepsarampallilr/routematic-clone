"use client";

import MapView from "@/components/common/MapView/MapView";

interface RouteMapProps {
  geoJsonRoute: {
    type: "LineString";
    coordinates: [number, number][]; // [lng, lat]
  };
  pickupLocation: { lat: number; lng: number } | null;
}

export default function RouteMap({ geoJsonRoute, pickupLocation }: RouteMapProps) {
  const markers = pickupLocation
    ? [{ ...pickupLocation, label: "Your pickup point" }]
    : [];

  return <MapView geoJsonRoute={geoJsonRoute} markers={markers} />;
}
