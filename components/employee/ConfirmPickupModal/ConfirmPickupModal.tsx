"use client";

import { useState, type FormEvent } from "react";
import styles from "./ConfirmPickupModal.module.css";

type Step = "prompt" | "otp" | "success";

interface ConfirmPickupModalProps {
  demoOtp: string;
  rideKey: string;
  employeeId: string;
  onClose: () => void;
  onConfirmed: () => void;
}

// Rendered only while open (see EmployeeDashboardClient) — mounting fresh each
// time gives it a clean initial state instead of resetting via an effect.
export default function ConfirmPickupModal({
  demoOtp,
  rideKey,
  employeeId,
  onClose,
  onConfirmed,
}: ConfirmPickupModalProps) {
  const [step, setStep] = useState<Step>("prompt");
  const [otpInput, setOtpInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleOtpSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/rides/${rideKey}/otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, otp: otpInput, role: "employee" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setStep("success");
      onConfirmed();
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        {step === "prompt" && (
          <>
            <h2 className={styles.title}>Is this your pickup?</h2>
            <p className={styles.body}>
              Confirm you&apos;re the rider for this cab to receive your OTP.
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} onClick={onClose}>
                No
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setStep("otp")}
              >
                Yes
              </button>
            </div>
          </>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtpSubmit}>
            <h2 className={styles.title}>Enter your OTP</h2>
            <p className={styles.demoOtp}>Demo OTP (sent via SMS): {demoOtp}</p>
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
                {submitting ? "Confirming…" : "Confirm"}
              </button>
            </div>
          </form>
        )}

        {step === "success" && (
          <>
            <h2 className={styles.title}>Ride confirmed</h2>
            <p className={styles.body}>
              Your pickup is confirmed. Sit tight — your driver is on the way.
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.primaryButton} onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
