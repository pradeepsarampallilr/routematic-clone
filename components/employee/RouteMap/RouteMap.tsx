"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import styles from "./RouteMap.module.css";

interface RouteMapProps {
  geoJsonRoute: {
    type: "LineString";
    coordinates: [number, number][]; // [lng, lat]
  };
  pickupLocation: { lat: number; lng: number } | null;
}

let defaultIconConfigured = false;

function ensureDefaultIcon() {
  if (defaultIconConfigured) return;
  // Bundlers break Leaflet's default marker icon URLs — reassign them explicitly.
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x.src,
    iconUrl: markerIcon.src,
    shadowUrl: markerShadow.src,
  });
  defaultIconConfigured = true;
}

export default function RouteMap({ geoJsonRoute, pickupLocation }: RouteMapProps) {
  useEffect(() => {
    ensureDefaultIcon();
  }, []);

  const positions: [number, number][] = geoJsonRoute.coordinates.map(([lng, lat]) => [
    lat,
    lng,
  ]);
  const center = pickupLocation
    ? ([pickupLocation.lat, pickupLocation.lng] as [number, number])
    : positions[0];

  return (
    <div className={styles.mapWrap}>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        className={styles.map}
      >
        {/* TODO(real-engine): replace with OSRM road geometry — this polyline is a mock straight-line path. */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={positions} pathOptions={{ color: "#2563eb", weight: 4 }} />
        {pickupLocation && (
          <Marker position={[pickupLocation.lat, pickupLocation.lng]}>
            <Popup>Your pickup point</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
