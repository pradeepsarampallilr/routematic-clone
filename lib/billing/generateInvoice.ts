import dbConnect from "@/lib/db/connect";
import Ride from "@/lib/models/Ride";
import Invoice from "@/lib/models/Invoice";

// Mock rates for the prototype's ROI/billing illustration — not a real fare
// table. COST_PER_KM_INR matches the constant used for admin ROI metrics.
const COST_PER_KM_INR = 12;
const PENALTY_RATE = 0.1;
const DEVIATION_FLAG_THRESHOLD_PERCENT = 15;

/**
 * Called when a route completes. Compares the seeded planned distance against
 * a randomized mock "actual GPS distance" to simulate reconciliation, then
 * stores the resulting Invoice.
 * TODO(real-engine): replace actualDistanceKm with real GPS telemetry.
 */
export async function generateInvoice(
  rideId: string,
  driverId: string,
  plannedDistanceKm: number
) {
  await dbConnect();

  const actualDistanceKm =
    Math.round(plannedDistanceKm * (0.95 + Math.random() * 0.3) * 10) / 10;
  const deviationPercent =
    Math.round(((actualDistanceKm - plannedDistanceKm) / plannedDistanceKm) * 1000) / 10;
  const flagged = Math.abs(deviationPercent) > DEVIATION_FLAG_THRESHOLD_PERCENT;

  const baseFare = Math.round(plannedDistanceKm * COST_PER_KM_INR);
  const penaltyAmount = flagged ? Math.round(baseFare * PENALTY_RATE) : 0;
  const totalAmount = baseFare + penaltyAmount;

  await Ride.findByIdAndUpdate(rideId, { actualDistanceKm });

  return Invoice.create({
    rideId,
    driverId,
    baseFare,
    deviationPercent,
    flagged,
    penaltyAmount,
    totalAmount,
    // Company is billed the full amount; the vendor's payout absorbs the
    // penalty as an accountability mechanism for the GPS deviation.
    hrPayoutAmount: totalAmount,
    vendorPayoutAmount: baseFare - penaltyAmount,
    generatedAt: new Date(),
  });
}
