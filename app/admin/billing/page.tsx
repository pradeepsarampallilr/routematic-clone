import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getInvoicesForToday } from "@/lib/billing/getInvoicesForToday";
import Navbar from "@/components/common/Navbar/Navbar";
import BillingTabs from "./BillingTabs";
import styles from "./page.module.css";

const ADMIN_NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/billing", label: "Billing" },
];

export default async function AdminBillingPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const invoices = await getInvoicesForToday();

  return (
    <div className={styles.page}>
      <Navbar links={ADMIN_NAV_LINKS} />

      <header className={styles.header}>
        <span className={styles.badge}>Admin</span>
        <h1 className={styles.heading}>Today&apos;s Billing</h1>
      </header>

      {invoices.length > 0 ? (
        <BillingTabs invoices={invoices} />
      ) : (
        <p className={styles.empty}>No completed rides to bill yet today.</p>
      )}
    </div>
  );
}
