"use client";

import { useEffect, useState } from "react";
import StopsList from "@/components/driver/StopsList/StopsList";
import type { DriverAssignment, DriverStop } from "@/lib/rides/getDriverAssignment";
import styles from "./page.module.css";

interface DriverDashboardClientProps {
  assignment: DriverAssignment;
}

export default function DriverDashboardClient({ assignment }: DriverDashboardClientProps) {
  const [stops, setStops] = useState<DriverStop[]>(assignment.stops);
  const [completed, setCompleted] = useState(assignment.routeStatus === "completed");
  const [error, setError] = useState<string | null>(null);

  const allPickedUp = stops.every((stop) => stop.status === "picked_up");

  useEffect(() => {
    if (!allPickedUp || completed) return;

    let cancelled = false;

    fetch(`/api/rides/${assignment.rideKey}`, { method: "POST" })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Couldn't complete the ride. Please try again.");
          return;
        }
        setCompleted(true);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Couldn't complete the ride. Please try again.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [allPickedUp, completed, assignment.rideKey]);

  function handleStopConfirmed(employeeId: string) {
    setStops((prev) =>
      prev.map((stop) =>
        stop.employeeId === employeeId ? { ...stop, status: "picked_up" } : stop
      )
    );
  }

  if (completed) {
    return (
      <div className={styles.successBanner}>
        <h2 className={styles.successTitle}>Ride Successful</h2>
        <p className={styles.successBody}>
          All passengers have been picked up and the route is complete.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.content}>
      <StopsList
        stops={stops}
        geoJsonRoute={assignment.geoJsonRoute}
        rideKey={assignment.rideKey}
        onStopConfirmed={handleStopConfirmed}
      />
      {allPickedUp && (
        <p className={styles.completingMessage}>
          {error ?? "Completing route…"}
        </p>
      )}
    </div>
  );
}
