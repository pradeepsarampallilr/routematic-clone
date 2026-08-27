"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import CabAllotmentCard, {
  type StopStatus,
} from "@/components/employee/CabAllotmentCard/CabAllotmentCard";
import ConfirmPickupModal from "@/components/employee/ConfirmPickupModal/ConfirmPickupModal";
import type { EmployeeAssignment } from "@/lib/rides/getEmployeeAssignment";
import styles from "./page.module.css";

const RouteMap = dynamic(() => import("@/components/employee/RouteMap/RouteMap"), {
  ssr: false,
  loading: () => <div className={styles.mapPlaceholder}>Loading map…</div>,
});

interface EmployeeDashboardClientProps {
  employeeId: string;
  assignment: EmployeeAssignment;
}

export default function EmployeeDashboardClient({
  employeeId,
  assignment,
}: EmployeeDashboardClientProps) {
  const [status, setStatus] = useState<StopStatus>(assignment.stopStatus);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className={styles.content}>
      <CabAllotmentCard
        cabPlateNumber={assignment.cabPlateNumber}
        driverName={assignment.driverName}
        etaMinutes={assignment.etaMinutes}
        coPassengerCount={assignment.coPassengerCount}
        requiresEscort={assignment.requiresEscort}
        status={status}
        onConfirmClick={() => setModalOpen(true)}
      />

      <RouteMap
        geoJsonRoute={assignment.geoJsonRoute}
        pickupLocation={assignment.pickupLocation}
      />

      {modalOpen && (
        <ConfirmPickupModal
          demoOtp={assignment.otp}
          rideKey={assignment.rideKey}
          employeeId={employeeId}
          onClose={() => setModalOpen(false)}
          onConfirmed={() => setStatus("confirmed")}
        />
      )}
    </div>
  );
}
