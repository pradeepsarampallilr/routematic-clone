import type { Types } from "mongoose";
import dbConnect from "@/lib/db/connect";
import Roster from "@/lib/models/Roster";
import Employee from "@/lib/models/Employee";
// Registers the "Cab" and "Driver" models for populate() below — Roster only
// references them by ref string, so they're never otherwise imported here.
import "@/lib/models/Cab";
import "@/lib/models/Driver";

// Flat mock rate used only to illustrate ROI — not a real fare table.
const COST_PER_KM_INR = 12;

export interface RosterAssignment {
  id: string;
  employeeName: string;
  cabPlateNumber: string;
  driverName: string;
  routeLabel: string;
  shift: "morning" | "evening" | "night";
  status: "pending" | "confirmed" | "picked_up";
}

export interface DashboardMetrics {
  cabsUtilized: number;
  avgOccupancyPercent: number;
  costSavedInr: number;
}

export interface UnmappedEmployee {
  id: string;
  name: string;
  address: string;
}

export interface DashboardData {
  assignments: RosterAssignment[];
  metrics: DashboardMetrics;
  unmappedEmployees: UnmappedEmployee[];
}

interface PopulatedStop {
  employeeId: { _id: Types.ObjectId; name: string } | null;
  status: "pending" | "confirmed" | "picked_up";
}

interface PopulatedRoute {
  cabId: { _id: Types.ObjectId; plateNumber: string; seatCapacity: number } | null;
  driverId: { _id: Types.ObjectId; name: string } | null;
  stops: PopulatedStop[];
  plannedDistanceKm: number;
}

interface PopulatedRoster {
  _id: Types.ObjectId;
  shift: "morning" | "evening" | "night";
  routes: PopulatedRoute[];
}

export async function getDashboardData(): Promise<DashboardData> {
  await dbConnect();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const rosters = (await Roster.find({
    date: { $gte: startOfToday, $lt: startOfTomorrow },
  })
    .populate({ path: "routes.cabId", select: "plateNumber seatCapacity" })
    .populate({ path: "routes.driverId", select: "name" })
    .populate({ path: "routes.stops.employeeId", select: "name" })
    .lean()) as unknown as PopulatedRoster[];

  const assignments: RosterAssignment[] = [];
  const cabsUtilized = new Set<string>();
  let occupancySum = 0;
  let occupancyCount = 0;
  let costSavedInr = 0;

  for (const roster of rosters) {
    roster.routes.forEach((route, routeIndex) => {
      const routeLabel = `Route ${routeIndex + 1}`;

      if (route.cabId) {
        cabsUtilized.add(String(route.cabId._id));
        occupancySum += route.stops.length / route.cabId.seatCapacity;
        occupancyCount += 1;
      }

      if (route.stops.length > 1) {
        costSavedInr += (route.stops.length - 1) * route.plannedDistanceKm * COST_PER_KM_INR;
      }

      route.stops.forEach((stop) => {
        if (!stop.employeeId) return;
        assignments.push({
          id: `${roster._id}:${routeIndex}:${stop.employeeId._id}`,
          employeeName: stop.employeeId.name,
          cabPlateNumber: route.cabId?.plateNumber ?? "Unassigned",
          driverName: route.driverId?.name ?? "Unassigned",
          routeLabel,
          shift: roster.shift,
          status: stop.status,
        });
      });
    });
  }

  assignments.sort((a, b) => a.employeeName.localeCompare(b.employeeName));

  const unmappedDocs = await Employee.find({ location: { $exists: false } })
    .select("name address")
    .lean();

  return {
    assignments,
    metrics: {
      cabsUtilized: cabsUtilized.size,
      avgOccupancyPercent:
        occupancyCount > 0 ? Math.round((occupancySum / occupancyCount) * 100) : 0,
      costSavedInr: Math.round(costSavedInr),
    },
    unmappedEmployees: unmappedDocs.map((doc) => ({
      id: String(doc._id),
      name: doc.name,
      address: doc.address,
    })),
  };
}
