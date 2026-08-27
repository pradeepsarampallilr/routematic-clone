import type { DashboardMetrics } from "@/lib/roster/getDashboardData";
import styles from "./RoiMetrics.module.css";

interface RoiMetricsProps {
  metrics: DashboardMetrics;
}

export default function RoiMetrics({ metrics }: RoiMetricsProps) {
  const cards = [
    {
      label: "Cabs utilized",
      value: String(metrics.cabsUtilized),
    },
    {
      label: "Avg. occupancy",
      value: `${metrics.avgOccupancyPercent}%`,
    },
    {
      label: "Cost saved vs. single-rider",
      value: `₹${metrics.costSavedInr.toLocaleString("en-IN")}`,
    },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <div key={card.label} className={styles.card}>
          <span className={styles.value}>{card.value}</span>
          <span className={styles.label}>{card.label}</span>
        </div>
      ))}
    </div>
  );
}
