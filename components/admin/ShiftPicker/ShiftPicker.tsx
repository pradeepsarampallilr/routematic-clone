"use client";

import styles from "./ShiftPicker.module.css";

export type PickableShift = "morning" | "evening";

interface ShiftPickerProps {
  value: PickableShift;
  onChange: (shift: PickableShift) => void;
}

const SHIFTS: { value: PickableShift; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "evening", label: "Evening" },
];

export default function ShiftPicker({ value, onChange }: ShiftPickerProps) {
  return (
    <div className={styles.picker} role="tablist" aria-label="Shift">
      {SHIFTS.map((shift) => (
        <button
          key={shift.value}
          type="button"
          role="tab"
          aria-selected={value === shift.value}
          className={styles.option}
          data-active={value === shift.value}
          onClick={() => onChange(shift.value)}
        >
          {shift.label}
        </button>
      ))}
    </div>
  );
}
