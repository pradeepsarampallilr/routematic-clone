import Link from "next/link";
import UserSelectForm from "@/components/common/UserSelectForm/UserSelectForm";
import styles from "./page.module.css";

export default function DriverLoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <Link href="/login" className={styles.backLink}>
          ← Back
        </Link>
        <span className={styles.badge}>Driver</span>
        <h1 className={styles.heading}>Select your name</h1>
        <p className={styles.subheading}>
          Pick yourself from today&apos;s roster to see your assigned stops.
        </p>
        <UserSelectForm role="driver" roleLabel="Driver" />
      </div>
    </div>
  );
}
