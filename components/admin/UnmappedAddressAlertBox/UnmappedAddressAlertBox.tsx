"use client";

import { useState } from "react";
import type { UnmappedEmployee } from "@/lib/roster/getDashboardData";
import styles from "./UnmappedAddressAlertBox.module.css";

interface UnmappedAddressAlertBoxProps {
  employees: UnmappedEmployee[];
}

export default function UnmappedAddressAlertBox({ employees }: UnmappedAddressAlertBoxProps) {
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  if (employees.length === 0) {
    return null;
  }

  function handlePin(id: string) {
    // Static mock only — no real geocoding or map integration for the prototype.
    setPinnedIds((prev) => new Set(prev).add(id));
  }

  return (
    <div className={styles.box} role="alert">
      <div className={styles.header}>
        <span className={styles.icon} aria-hidden="true">
          ⚠
        </span>
        <span className={styles.title}>
          {employees.length} employee{employees.length > 1 ? "s" : ""} couldn&apos;t be
          mapped to a location
        </span>
      </div>
      <ul className={styles.list}>
        {employees.map((employee) => {
          const pinned = pinnedIds.has(employee.id);
          return (
            <li key={employee.id} className={styles.item}>
              <div>
                <p className={styles.name}>{employee.name}</p>
                <p className={styles.address}>{employee.address}</p>
              </div>
              <button
                type="button"
                className={styles.pinButton}
                data-pinned={pinned}
                disabled={pinned}
                onClick={() => handlePin(employee.id)}
              >
                {pinned ? "Pinned ✓" : "Manually pin on map"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
