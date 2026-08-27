"use client";

import { useState, type FormEvent } from "react";
import MapView from "@/components/common/MapView/MapView";
import type { DriverStop } from "@/lib/rides/getDriverAssignment";
import styles from "./PickupButton.module.css";

interface PickupButtonProps {
  stop: DriverStop;
  geoJsonRoute: { type: "LineString"; coordinates: [number, number][] };
  rideKey: string;
  onConfirmed: () => void;
}

export default function PickupButton({
  stop,
  geoJsonRoute,
  rideKey,
  onConfirmed,
}: PickupButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={styles.button} onClick={() => setOpen(true)}>
        Pickup
      </button>
      {open && (
        <PickupModal
          stop={stop}
          geoJsonRoute={geoJsonRoute}
          rideKey={rideKey}
          onClose={() => setOpen(false)}
          onConfirmed={() => {
            onConfirmed();
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

interface PickupModalProps {
  stop: DriverStop;
  geoJsonRoute: { type: "LineString"; coordinates: [number, number][] };
  rideKey: string;
  onClose: () => void;
  onConfirmed: () => void;
}

function PickupModal({ stop, geoJsonRoute, rideKey, onClose, onConfirmed }: PickupModalProps) {
  const [otpInput, setOtpInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const markers = stop.location ? [{ ...stop.location, label: stop.employeeName }] : [];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/rides/${rideKey}/otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: stop.employeeId, otp: otpInput, role: "driver" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      onConfirmed();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h2 className={styles.title}>Confirm pickup — {stop.employeeName}</h2>
        <MapView geoJsonRoute={geoJsonRoute} markers={markers} />
        <p className={styles.demoOtp}>Demo OTP (sent via SMS): {stop.otp}</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            className={styles.otpInput}
            value={otpInput}
            onChange={(event) => setOtpInput(event.target.value.replace(/\D/g, ""))}
            placeholder="4-digit code"
            autoFocus
          />
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button type="button" className={styles.secondaryButton} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={submitting || otpInput.length !== 4}
            >
              {submitting ? "Confirming…" : "Confirm Pickup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
