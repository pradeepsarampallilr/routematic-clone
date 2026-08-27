import styles from "./CabAllotmentCard.module.css";

export type StopStatus = "pending" | "confirmed" | "picked_up";

interface CabAllotmentCardProps {
  cabPlateNumber: string;
  driverName: string;
  etaMinutes: number;
  coPassengerCount: number;
  requiresEscort: boolean;
  status: StopStatus;
  onConfirmClick: () => void;
}

const STATUS_LABEL: Record<StopStatus, string> = {
  pending: "Awaiting confirmation",
  confirmed: "Pickup confirmed",
  picked_up: "Picked up",
};

export default function CabAllotmentCard({
  cabPlateNumber,
  driverName,
  etaMinutes,
  coPassengerCount,
  requiresEscort,
  status,
  onConfirmClick,
}: CabAllotmentCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className={styles.label}>Cab</p>
          <p className={styles.cabNumber}>{cabPlateNumber}</p>
        </div>
        {requiresEscort && (
          <span className={styles.escortBadge}>Security escort assigned</span>
        )}
      </div>

      <dl className={styles.details}>
        <div className={styles.detailRow}>
          <dt>Driver</dt>
          <dd>{driverName}</dd>
        </div>
        <div className={styles.detailRow}>
          <dt>ETA</dt>
          <dd>{etaMinutes} min</dd>
        </div>
        <div className={styles.detailRow}>
          <dt>Co-passengers</dt>
          <dd>
            {coPassengerCount > 0
              ? `You + ${coPassengerCount} other${coPassengerCount > 1 ? "s" : ""}`
              : "Just you on this trip"}
          </dd>
        </div>
      </dl>

      {status === "pending" ? (
        <button type="button" className={styles.confirmButton} onClick={onConfirmClick}>
          Confirm Pickup
        </button>
      ) : (
        <span className={styles.statusPill} data-status={status}>
          {STATUS_LABEL[status]}
        </span>
      )}
    </div>
  );
}
