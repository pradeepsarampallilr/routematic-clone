import ReconciliationBadge from "@/components/billing/ReconciliationBadge/ReconciliationBadge";
import styles from "./InvoiceCard.module.css";

interface InvoiceCardProps {
  routeLabel: string;
  driverName: string;
  baseFare: number;
  penaltyAmount: number;
  flagged: boolean;
  deviationPercent: number;
  totalLabel: string;
  totalAmount: number;
}

function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function InvoiceCard({
  routeLabel,
  driverName,
  baseFare,
  penaltyAmount,
  flagged,
  deviationPercent,
  totalLabel,
  totalAmount,
}: InvoiceCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className={styles.route}>{routeLabel}</p>
          <p className={styles.driver}>{driverName}</p>
        </div>
        <ReconciliationBadge flagged={flagged} deviationPercent={deviationPercent} />
      </div>

      <dl className={styles.details}>
        <div className={styles.detailRow}>
          <dt>Base fare</dt>
          <dd>{formatInr(baseFare)}</dd>
        </div>
        {penaltyAmount > 0 && (
          <div className={styles.detailRow}>
            <dt>Penalty</dt>
            <dd className={styles.penalty}>+{formatInr(penaltyAmount)}</dd>
          </div>
        )}
        <div className={styles.detailRowTotal}>
          <dt>{totalLabel}</dt>
          <dd>{formatInr(totalAmount)}</dd>
        </div>
      </dl>
    </div>
  );
}
