import Link from "next/link";
import UserSelectForm from "@/components/common/UserSelectForm/UserSelectForm";
import styles from "./page.module.css";

export default function AdminLoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <Link href="/login" className={styles.backLink}>
          ← Back
        </Link>
        <span className={styles.badge}>Admin</span>
        <h1 className={styles.heading}>Select your name</h1>
        <p className={styles.subheading}>
          Pick yourself to manage rosters, routes, and billing.
        </p>
        <UserSelectForm role="admin" roleLabel="Admin" />
      </div>
    </div>
  );
}
