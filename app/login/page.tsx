import Card from "@/components/common/Card/Card";
import styles from "./page.module.css";

function EmployeeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5 20c0-3.5 3.13-6 7-6s7 2.5 7 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DriverIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="2.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 4.5V8M12 16v3.5M4.5 12H8M16 12h3.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5l6.5 2.6v5c0 4.2-2.75 7.9-6.5 9-3.75-1.1-6.5-4.8-6.5-9v-5L12 3.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M9.25 12l1.9 1.9L14.75 10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.brand}>Employee Transport Initiative</span>
        <h1 className={styles.heading}>Who&apos;s riding today?</h1>
        <p className={styles.subheading}>
          
        </p>
      </div>
      <div className={styles.cards}>
        <Card
          href="/company/employee"
          icon={<EmployeeIcon />}
          title="Employee"
          description="View your cab allotment, confirm pickup, and track your ride."
        />
        <Card
          href="/vendor/driver"
          icon={<DriverIcon />}
          title="Driver"
          description="See your stops, confirm pickups, and complete your route."
        />
        <Card
          href="/admin"
          icon={<AdminIcon />}
          title="Admin"
          description="Manage rosters, monitor routes, and review billing."
        />
      </div>
    </div>
  );
}
