"use client";

import dynamic from "next/dynamic";
import type { DriverStop } from "@/lib/rides/getDriverAssignment";
import styles from "./StopsList.module.css";

// PickupButton renders MapView, which configures Leaflet at module scope —
// that only works in the browser, so it must skip SSR (mirrors how the
// employee dashboard dynamically imports RouteMap).
const PickupButton = dynamic(() => import("@/components/driver/PickupButton/PickupButton"), {
  ssr: false,
  loading: () => <button className={styles.pickupPlaceholder} disabled>Pickup</button>,
});

interface StopsListProps {
  stops: DriverStop[];
  geoJsonRoute: { type: "LineString"; coordinates: [number, number][] };
  rideKey: string;
  onStopConfirmed: (employeeId: string) => void;
}

const STATUS_LABEL: Record<DriverStop["status"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  picked_up: "Picked up",
};

export default function StopsList({
  stops,
  geoJsonRoute,
  rideKey,
  onStopConfirmed,
}: StopsListProps) {
  return (
    <ol className={styles.list}>
      {stops.map((stop) => (
        <li key={stop.employeeId} className={styles.item}>
          <div className={styles.info}>
            <span className={styles.order}>{stop.order}</span>
            <div>
              <p className={styles.name}>{stop.employeeName}</p>
              <p className={styles.address}>{stop.address}</p>
            </div>
          </div>
          <div className={styles.actions}>
            <span className={styles.statusPill} data-status={stop.status}>
              {STATUS_LABEL[stop.status]}
            </span>
            {stop.status !== "picked_up" && (
              <PickupButton
                stop={stop}
                geoJsonRoute={geoJsonRoute}
                rideKey={rideKey}
                onConfirmed={() => onStopConfirmed(stop.employeeId)}
              />
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
