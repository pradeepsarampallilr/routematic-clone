"use client";

import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./RouteMap.module.css";

interface RouteMapProps {
  geoJsonRoute: {
    type: "LineString";
    coordinates: [number, number][]; // [lng, lat]
  };
  pickupLocation: { lat: number; lng: number } | null;
}

// Importing leaflet's marker images from node_modules doesn't survive Next's
// bundler pipeline (the .png import resolves without a usable .src), leaving
// Leaflet's default icon unconfigured. Point it at the CDN copy instead —
// runs once at module evaluation, on the client only (this module is loaded
// via next/dynamic with ssr:false), before <Marker> constructs an icon.
const DEFAULT_ICON = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DEFAULT_ICON;

export default function RouteMap({ geoJsonRoute, pickupLocation }: RouteMapProps) {
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
