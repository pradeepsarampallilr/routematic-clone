import mongoose from "mongoose";
import dbConnect from "@/lib/db/connect";
import Roster, { type IRosterStop } from "@/lib/models/Roster";
import Ride from "@/lib/models/Ride";
import Invoice from "@/lib/models/Invoice";
import { generateInvoice } from "@/lib/billing/generateInvoice";

type CompleteResult =
  | { ok: true; rideId: string; invoiceId: string }
  | { ok: false; error: string };

export async function completeRide(rideKey: string): Promise<CompleteResult> {
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

  const allPickedUp =
    route.stops.length > 0 &&
    route.stops.every((stop: IRosterStop) => stop.status === "picked_up");
  if (!allPickedUp) {
    return { ok: false, error: "Not all stops have been picked up yet" };
  }

  if (route.status !== "completed") {
    route.status = "completed";
    await roster.save();
  }

  const ride = await Ride.findOne({ rosterId: roster._id, routeIndex });
  if (!ride) {
    return { ok: false, error: "No ride found for this route yet" };
  }

  if (ride.status === "completed") {
    // Idempotent: a repeat call (e.g. page reload) shouldn't re-invoice.
    const existingInvoice = await Invoice.findOne({ rideId: ride._id }).lean();
    return {
      ok: true,
      rideId: String(ride._id),
      invoiceId: existingInvoice ? String(existingInvoice._id) : "",
    };
  }

  ride.status = "completed";
  ride.completedAt = new Date();
  await ride.save();

  const invoice = await generateInvoice(
    String(ride._id),
    String(route.driverId),
    route.plannedDistanceKm
  );

  return { ok: true, rideId: String(ride._id), invoiceId: String(invoice._id) };
}
