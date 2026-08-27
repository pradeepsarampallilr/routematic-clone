"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/common/Navbar/Navbar";
import RoiMetrics from "@/components/admin/RoiMetrics/RoiMetrics";
import UnmappedAddressAlertBox from "@/components/admin/UnmappedAddressAlertBox/UnmappedAddressAlertBox";
import ShiftPicker, { type PickableShift } from "@/components/admin/ShiftPicker/ShiftPicker";
import RosterTable from "@/components/admin/RosterTable/RosterTable";
import CsvUploadBox from "@/components/admin/CsvUploadBox/CsvUploadBox";
import type { DashboardData } from "@/lib/roster/getDashboardData";
import styles from "./page.module.css";

type LoadStatus = "loading" | "ready" | "error";

const ADMIN_NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/billing", label: "Billing" },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [shift, setShift] = useState<PickableShift>("morning");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/roster");
        if (!res.ok) throw new Error("Failed to load roster");
        const json: DashboardData = await res.json();
        if (!cancelled) {
          setData(json);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className={styles.page}>
        <Navbar links={ADMIN_NAV_LINKS} />
        <p className={styles.message}>Loading dashboard…</p>
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div className={styles.page}>
        <Navbar links={ADMIN_NAV_LINKS} />
        <p className={styles.messageError}>
          Couldn&apos;t load the dashboard. Please try again.
        </p>
      </div>
    );
  }

  const filteredAssignments = data.assignments.filter(
    (assignment) => assignment.shift === shift
  );

  return (
    <div className={styles.page}>
      <Navbar links={ADMIN_NAV_LINKS} />

      <header className={styles.header}>
        <span className={styles.badge}>Admin</span>
        <h1 className={styles.heading}>Today&apos;s Dashboard</h1>
      </header>

      <RoiMetrics metrics={data.metrics} />

      <UnmappedAddressAlertBox employees={data.unmappedEmployees} />

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Roster</h2>
          <ShiftPicker value={shift} onChange={setShift} />
        </div>
        <RosterTable assignments={filteredAssignments} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Upload Roster CSV</h2>
        <CsvUploadBox />
      </section>
    </div>
  );
}
