"use client";

import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MapView.module.css";

export interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
}

interface MapViewProps {
  geoJsonRoute: {
    type: "LineString";
    coordinates: [number, number][]; // [lng, lat]
  };
  markers?: MapMarker[];
}

// Importing leaflet's marker images from node_modules doesn't survive Next's
// bundler pipeline (the .png import resolves without a usable .src), leaving
// Leaflet's default icon unconfigured. Point it at the CDN copy instead —
// runs once at module evaluation, on the client only (this module is only
// ever loaded via next/dynamic with ssr:false), before <Marker> constructs
// an icon.
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

export default function MapView({ geoJsonRoute, markers = [] }: MapViewProps) {
  const positions: [number, number][] = geoJsonRoute.coordinates.map(([lng, lat]) => [
    lat,
    lng,
  ]);
  const center = markers[0]
    ? ([markers[0].lat, markers[0].lng] as [number, number])
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
        {markers.map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lng]}>
            {marker.label && <Popup>{marker.label}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
