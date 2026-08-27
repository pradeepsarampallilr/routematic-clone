import dbConnect from "@/lib/db/connect";
import Invoice from "@/lib/models/Invoice";
import Ride from "@/lib/models/Ride";
import Roster from "@/lib/models/Roster";
import Driver from "@/lib/models/Driver";

export interface InvoiceView {
  id: string;
  routeLabel: string;
  driverName: string;
  baseFare: number;
  deviationPercent: number;
  flagged: boolean;
  penaltyAmount: number;
  totalAmount: number;
  hrPayoutAmount: number;
  vendorPayoutAmount: number;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export async function getInvoicesForToday(): Promise<InvoiceView[]> {
  await dbConnect();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const invoices = await Invoice.find({
    generatedAt: { $gte: startOfToday, $lt: startOfTomorrow },
  }).lean();
  if (invoices.length === 0) return [];

  const rideIds = [...new Set(invoices.map((invoice) => String(invoice.rideId)))];
  const driverIds = [...new Set(invoices.map((invoice) => String(invoice.driverId)))];

  const [rides, drivers] = await Promise.all([
    Ride.find({ _id: { $in: rideIds } }).select("rosterId routeIndex").lean(),
    Driver.find({ _id: { $in: driverIds } }).select("name").lean(),
  ]);
  const rideById = new Map(rides.map((ride) => [String(ride._id), ride]));
  const driverById = new Map(drivers.map((driver) => [String(driver._id), driver]));

  const rosterIds = [...new Set(rides.map((ride) => String(ride.rosterId)))];
  const rosters = await Roster.find({ _id: { $in: rosterIds } }).select("shift").lean();
  const rosterById = new Map(rosters.map((roster) => [String(roster._id), roster]));

  return invoices
    .map((invoice) => {
      const ride = rideById.get(String(invoice.rideId));
      const roster = ride ? rosterById.get(String(ride.rosterId)) : undefined;
      const driver = driverById.get(String(invoice.driverId));
      const routeLabel = ride
        ? `Route ${ride.routeIndex + 1} · ${capitalize(roster?.shift ?? "unknown")}`
        : "Unknown route";

      return {
        id: String(invoice._id),
        routeLabel,
        driverName: driver?.name ?? "Unknown driver",
        baseFare: invoice.baseFare,
        deviationPercent: invoice.deviationPercent,
        flagged: invoice.flagged,
        penaltyAmount: invoice.penaltyAmount,
        totalAmount: invoice.totalAmount,
        hrPayoutAmount: invoice.hrPayoutAmount,
        vendorPayoutAmount: invoice.vendorPayoutAmount,
      };
    })
    .sort((a, b) => a.routeLabel.localeCompare(b.routeLabel));
}
