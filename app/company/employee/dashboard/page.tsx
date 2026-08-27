import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getEmployeeAssignment } from "@/lib/rides/getEmployeeAssignment";
import EmployeeDashboardClient from "./EmployeeDashboardClient";
import styles from "./page.module.css";

export default async function EmployeeDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "employee") {
    redirect("/login");
  }

  const assignment = await getEmployeeAssignment(session.id);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.badge}>Employee</span>
        <h1 className={styles.heading}>
          {assignment ? `Hi, ${assignment.employeeName}` : "Today's Ride"}
        </h1>
      </header>

      {assignment ? (
        <EmployeeDashboardClient employeeId={session.id} assignment={assignment} />
      ) : (
        <p className={styles.empty}>No ride scheduled for you today.</p>
      )}
    </div>
  );
}
