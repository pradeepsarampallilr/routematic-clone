import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDriverAssignment } from "@/lib/rides/getDriverAssignment";
import DriverDashboardClient from "./DriverDashboardClient";
import styles from "./page.module.css";

export default async function DriverDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "driver") {
    redirect("/login");
  }

  const assignment = await getDriverAssignment(session.id);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.badge}>Driver</span>
        <h1 className={styles.heading}>Today&apos;s Route</h1>
      </header>

      {assignment ? (
        <DriverDashboardClient assignment={assignment} />
      ) : (
        <p className={styles.empty}>No route assigned to you today.</p>
      )}
    </div>
  );
}
