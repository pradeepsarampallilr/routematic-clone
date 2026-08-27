import Link from "next/link";
import UserSelectForm from "@/components/common/UserSelectForm/UserSelectForm";
import styles from "./page.module.css";

export default function EmployeeLoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <Link href="/login" className={styles.backLink}>
          ← Back
        </Link>
        <span className={styles.badge}>Employee</span>
        <h1 className={styles.heading}>Select your name</h1>
        <p className={styles.subheading}>
          Pick yourself from today&apos;s roster to see your cab allotment.
        </p>
        <UserSelectForm role="employee" roleLabel="Employee" />
      </div>
    </div>
  );
}
