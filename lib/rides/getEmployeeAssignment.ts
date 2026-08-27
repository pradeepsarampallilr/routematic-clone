import type { Types } from "mongoose";
import dbConnect from "@/lib/db/connect";
import Roster from "@/lib/models/Roster";
import Cab from "@/lib/models/Cab";
import Driver from "@/lib/models/Driver";
import Employee from "@/lib/models/Employee";

export interface EmployeeAssignment {
  employeeName: string;
  rideKey: string;
  cabPlateNumber: string;
  driverName: string;
  etaMinutes: number;
  coPassengerCount: number;
  requiresEscort: boolean;
  stopStatus: "pending" | "confirmed" | "picked_up";
  otp: string;
  geoJsonRoute: {
    type: "LineString";
    coordinates: [number, number][];
  };
  pickupLocation: { lat: number; lng: number } | null;
}

interface LeanStop {
  employeeId: Types.ObjectId;
  etaMinutes: number;
  otp: string;
  status: "pending" | "confirmed" | "picked_up";
}

interface LeanRoute {
  cabId: Types.ObjectId;
  driverId: Types.ObjectId;
  stops: LeanStop[];
  geoJsonRoute: { type: "LineString"; coordinates: [number, number][] };
}

interface LeanRoster {
  _id: Types.ObjectId;
  routes: LeanRoute[];
}

export async function getEmployeeAssignment(
  employeeId: string
): Promise<EmployeeAssignment | null> {
  await dbConnect();

  const employee = await Employee.findById(employeeId).lean();
  if (!employee) return null;

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
      const stop = route.stops.find((s) => String(s.employeeId) === employeeId);
      if (!stop) continue;

      const [cab, driver] = await Promise.all([
        Cab.findById(route.cabId).select("plateNumber").lean(),
        Driver.findById(route.driverId).select("name").lean(),
      ]);

      return {
        employeeName: employee.name,
        rideKey: `${roster._id}_${routeIndex}`,
        cabPlateNumber: cab?.plateNumber ?? "Unassigned",
        driverName: driver?.name ?? "Unassigned",
        etaMinutes: stop.etaMinutes,
        coPassengerCount: route.stops.length - 1,
        requiresEscort: employee.requiresEscort,
        stopStatus: stop.status,
        otp: stop.otp,
        geoJsonRoute: route.geoJsonRoute,
        pickupLocation: employee.location ?? null,
      };
    }
  }

  return null;
}
