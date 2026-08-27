import type { Types } from "mongoose";
import dbConnect from "@/lib/db/connect";
import Roster from "@/lib/models/Roster";
import Cab from "@/lib/models/Cab";
import Employee from "@/lib/models/Employee";

export interface DriverStop {
  employeeId: string;
  employeeName: string;
  address: string;
  order: number;
  status: "pending" | "confirmed" | "picked_up";
  otp: string;
  location: { lat: number; lng: number } | null;
}

export interface DriverAssignment {
  rideKey: string;
  cabPlateNumber: string;
  geoJsonRoute: {
    type: "LineString";
    coordinates: [number, number][];
  };
  routeStatus: "scheduled" | "in_progress" | "completed";
  stops: DriverStop[];
}

interface LeanStop {
  employeeId: Types.ObjectId;
  order: number;
  otp: string;
  status: "pending" | "confirmed" | "picked_up";
}

interface LeanRoute {
  cabId: Types.ObjectId;
  driverId: Types.ObjectId;
  stops: LeanStop[];
  geoJsonRoute: { type: "LineString"; coordinates: [number, number][] };
  status: "scheduled" | "in_progress" | "completed";
}

interface LeanRoster {
  _id: Types.ObjectId;
  routes: LeanRoute[];
}

export async function getDriverAssignment(driverId: string): Promise<DriverAssignment | null> {
  await dbConnect();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const rosters = (await Roster.find({
    date: { $gte: startOfToday, $lt: startOfTomorrow },
  }).lean()) as unknown as LeanRoster[];

  for (const roster of rosters) {
    for (let routeIndex = 0; routeIndex < roster.routes.length; routeIndex++) {
      const route = roster.routes[routeIndex];
      if (String(route.driverId) !== driverId) continue;

      const [cab, employees] = await Promise.all([
        Cab.findById(route.cabId).select("plateNumber").lean(),
        Employee.find({ _id: { $in: route.stops.map((s) => s.employeeId) } })
          .select("name address location")
          .lean(),
      ]);
      const employeeById = new Map(employees.map((e) => [String(e._id), e]));

      const stops: DriverStop[] = route.stops
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((stop) => {
          const employee = employeeById.get(String(stop.employeeId));
          return {
            employeeId: String(stop.employeeId),
            employeeName: employee?.name ?? "Unknown",
            address: employee?.address ?? "Unknown address",
            order: stop.order,
            status: stop.status,
            otp: stop.otp,
            location: employee?.location ?? null,
          };
        });

      return {
        rideKey: `${roster._id}_${routeIndex}`,
        cabPlateNumber: cab?.plateNumber ?? "Unassigned",
        geoJsonRoute: route.geoJsonRoute,
        routeStatus: route.status,
        stops,
      };
    }
  }

  return null;
}
