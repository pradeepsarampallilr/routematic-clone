import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import Roster, { type IRosterStop } from "@/lib/models/Roster";
import Ride from "@/lib/models/Ride";

type ConfirmResult =
  | { ok: true; rideId: string; status: "in_progress" | "completed" }
  | { ok: false; error: string };

export async function confirmPickupOtp(
  rideKey: string,
  employeeId: string,
  otp: string
): Promise<ConfirmResult> {
  await dbConnect();

  const separatorIndex = rideKey.lastIndexOf("_");
  const rosterId = rideKey.slice(0, separatorIndex);
  const routeIndex = Number(rideKey.slice(separatorIndex + 1));

  if (!mongoose.isValidObjectId(rosterId) || Number.isNaN(routeIndex)) {
    return { ok: false, error: "Invalid ride" };
  }

  const roster = await Roster.findById(rosterId);
  if (!roster) return { ok: false, error: "Roster not found" };

  const route = roster.routes[routeIndex];
  if (!route) return { ok: false, error: "Route not found" };

  const stop = route.stops.find(
    (s: IRosterStop) => String(s.employeeId) === employeeId
  );
  if (!stop) return { ok: false, error: "Stop not found for this employee" };

  if (stop.otp !== otp) {
    return { ok: false, error: "Incorrect OTP" };
  }

  stop.status = "confirmed";
  await roster.save();

  let ride = await Ride.findOne({ rosterId: roster._id, routeIndex });
  if (!ride) {
    ride = await Ride.create({
      rosterId: roster._id,
      routeIndex,
      startedAt: new Date(),
      // Actual GPS distance isn't known until Phase 7's reconciliation step —
      // seeded with the planned distance as a placeholder until then.
      actualDistanceKm: route.plannedDistanceKm,
      status: "in_progress",
    });
  }

  return { ok: true, rideId: String(ride._id), status: ride.status };
}
