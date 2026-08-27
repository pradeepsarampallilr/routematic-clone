import styles from "./ReconciliationBadge.module.css";

interface ReconciliationBadgeProps {
  flagged: boolean;
  deviationPercent: number;
}

export default function ReconciliationBadge({
  flagged,
  deviationPercent,
}: ReconciliationBadgeProps) {
  if (!flagged) {
    return <span className={styles.badge} data-flagged="false">Validated</span>;
  }

  const magnitude = Math.abs(deviationPercent);
  return (
    <span className={styles.badge} data-flagged="true">
      Flagged: {magnitude}% deviation
    </span>
  );
}
