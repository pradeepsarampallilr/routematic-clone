"use client";

import { useState } from "react";
import InvoiceCard from "@/components/billing/InvoiceCard/InvoiceCard";
import type { InvoiceView } from "@/lib/billing/getInvoicesForToday";
import styles from "./page.module.css";

type Tab = "hr" | "vendor";

interface BillingTabsProps {
  invoices: InvoiceView[];
}

export default function BillingTabs({ invoices }: BillingTabsProps) {
  const [tab, setTab] = useState<Tab>("hr");

  return (
    <div className={styles.tabsSection}>
      <div className={styles.tabPicker} role="tablist" aria-label="Payout view">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "hr"}
          className={styles.tabButton}
          data-active={tab === "hr"}
          onClick={() => setTab("hr")}
        >
          HR Payouts
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "vendor"}
          className={styles.tabButton}
          data-active={tab === "vendor"}
          onClick={() => setTab("vendor")}
        >
          Vendor Payouts
        </button>
      </div>

      <div className={styles.cardGrid}>
        {invoices.map((invoice) => (
          <InvoiceCard
            key={invoice.id}
            routeLabel={invoice.routeLabel}
            driverName={invoice.driverName}
            baseFare={invoice.baseFare}
            penaltyAmount={invoice.penaltyAmount}
            flagged={invoice.flagged}
            deviationPercent={invoice.deviationPercent}
            totalLabel={tab === "hr" ? "Billed to HR" : "Vendor earnings"}
            totalAmount={tab === "hr" ? invoice.hrPayoutAmount : invoice.vendorPayoutAmount}
          />
        ))}
      </div>
    </div>
  );
}
