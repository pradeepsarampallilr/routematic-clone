import type { RosterAssignment } from "@/lib/roster/getDashboardData";
import styles from "./RosterTable.module.css";

interface RosterTableProps {
  assignments: RosterAssignment[];
}

const STATUS_LABEL: Record<RosterAssignment["status"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  picked_up: "Picked up",
};

export default function RosterTable({ assignments }: RosterTableProps) {
  if (assignments.length === 0) {
    return <p className={styles.empty}>No assignments for this shift yet.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Cab</th>
            <th>Driver</th>
            <th>Route</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment.id}>
              <td>{assignment.employeeName}</td>
              <td>{assignment.cabPlateNumber}</td>
              <td>{assignment.driverName}</td>
              <td>{assignment.routeLabel}</td>
              <td>
                <span
                  className={styles.statusPill}
                  data-status={assignment.status}
                >
                  {STATUS_LABEL[assignment.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
