import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import mongoose, { type HydratedDocument } from "mongoose";
import dbConnect from "../db/connect";
import Employee, { type IEmployee } from "../models/Employee";
import Driver, { type IDriver } from "../models/Driver";
import Cab, { type ICab } from "../models/Cab";
import Roster from "../models/Roster";

// [lng, lat] — GeoJSON coordinate order
const OFFICE_HUB: [number, number] = [78.4738, 17.4239]; // Hitech City

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

function routeDistanceKm(coords: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversineKm(coords[i - 1], coords[i]);
  }
  return Math.round(total * 10) / 10;
}

function generateOtp(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

const driverSeeds = [
  {
    name: "Mahesh Yadav",
    phone: "+91-90000-11111",
    licenseNumber: "TSDL0011223344",
    cab: { plateNumber: "TS09EA1234", seatCapacity: 4, type: "sedan" as const },
  },
  {
    name: "Suresh Kumar",
    phone: "+91-90000-22222",
    licenseNumber: "TSDL0022334455",
    cab: { plateNumber: "TS09EB5678", seatCapacity: 4, type: "sedan" as const },
  },
  {
    name: "Ramesh Gupta",
    phone: "+91-90000-33333",
    licenseNumber: "TSDL0033445566",
    cab: { plateNumber: "TS10FC9012", seatCapacity: 6, type: "suv" as const },
  },
  {
    name: "Naveen Chandra",
    phone: "+91-90000-44444",
    licenseNumber: "TSDL0044556677",
    cab: { plateNumber: "TS10FD3456", seatCapacity: 12, type: "van" as const },
  },
];

const employeeSeeds = [
  {
    name: "Rahul Verma",
    gender: "male" as const,
    email: "rahul.verma@example.com",
    phone: "+91-98480-10001",
    address: "Plot 12, Gachibowli, Hyderabad",
    location: { lat: 17.4401, lng: 78.3489 },
    department: "Engineering",
    shift: "morning" as const,
  },
  {
    name: "Sunita Reddy",
    gender: "female" as const,
    email: "sunita.reddy@example.com",
    phone: "+91-98480-10002",
    address: "Flat 302, Kondapur, Hyderabad",
    location: { lat: 17.4615, lng: 78.3677 },
    department: "Finance",
    shift: "night" as const,
  },
  {
    name: "Ananya Rao",
    gender: "female" as const,
    email: "ananya.rao@example.com",
    phone: "+91-98480-10003",
    address: "House 21, Madhapur, Hyderabad",
    location: { lat: 17.4483, lng: 78.3915 },
    department: "Operations",
    shift: "night" as const,
  },
  {
    name: "Arjun Nair",
    gender: "male" as const,
    email: "arjun.nair@example.com",
    phone: "+91-98480-10004",
    address: "Plot 8, Miyapur, Hyderabad",
    location: { lat: 17.4969, lng: 78.354 },
    department: "Engineering",
    shift: "evening" as const,
  },
  {
    name: "Priya Sharma",
    gender: "female" as const,
    email: "priya.sharma@example.com",
    phone: "+91-98480-10005",
    address: "Flat 105, Kukatpally, Hyderabad",
    location: { lat: 17.4849, lng: 78.4108 },
    department: "HR",
    shift: "morning" as const,
  },
  {
    name: "Vikram Singh",
    gender: "male" as const,
    email: "vikram.singh@example.com",
    phone: "+91-98480-10006",
    address: "Plot 34, Gachibowli, Hyderabad",
    location: { lat: 17.4425, lng: 78.3465 },
    department: "Sales",
    shift: "evening" as const,
  },
  {
    name: "Kavya Iyer",
    gender: "female" as const,
    email: "kavya.iyer@example.com",
    phone: "+91-98480-10007",
    address: "Old Colony, near Uppal X Roads, Hyderabad",
    location: undefined,
    department: "Marketing",
    shift: "morning" as const,
  },
  {
    name: "Rohit Desai",
    gender: "male" as const,
    email: "rohit.desai@example.com",
    phone: "+91-98480-10008",
    address: "Flat 88, Madhapur, Hyderabad",
    location: { lat: 17.4501, lng: 78.3944 },
    department: "Engineering",
    shift: "evening" as const,
  },
];

async function seed() {
  await dbConnect();

  console.log("Wiping collections...");
  await Promise.all([
    Employee.deleteMany({}),
    Driver.deleteMany({}),
    Cab.deleteMany({}),
    Roster.deleteMany({}),
  ]);

  console.log("Seeding drivers & cabs...");
  const drivers: HydratedDocument<IDriver>[] = [];
  const cabs: HydratedDocument<ICab>[] = [];
  for (const d of driverSeeds) {
    const driver = await Driver.create({
      name: d.name,
      phone: d.phone,
      licenseNumber: d.licenseNumber,
      cabId: new mongoose.Types.ObjectId(), // placeholder, backfilled below
    });
    const cab = await Cab.create({
      plateNumber: d.cab.plateNumber,
      seatCapacity: d.cab.seatCapacity,
      type: d.cab.type,
      driverId: driver._id,
    });
    driver.cabId = cab._id;
    await driver.save();
    drivers.push(driver);
    cabs.push(cab);
  }

  console.log("Seeding employees...");
  const employees: HydratedDocument<IEmployee>[] = [];
  for (const e of employeeSeeds) {
    const requiresEscort = e.gender === "female" && e.shift === "night";
    const employee = await Employee.create({
      name: e.name,
      gender: e.gender,
      email: e.email,
      phone: e.phone,
      address: e.address,
      location: e.location,
      department: e.department,
      shift: e.shift,
      assignedCabId: null,
      requiresEscort,
    });
    employees.push(employee);
  }
  const byName = (name: string) => employees.find((e) => e.name === name)!;

  console.log("Seeding today's roster (morning + evening)...");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rahul = byName("Rahul Verma");
  const priya = byName("Priya Sharma");
  const arjun = byName("Arjun Nair");
  const vikram = byName("Vikram Singh");
  const rohit = byName("Rohit Desai");

  const morningCab = cabs[0];
  const morningDriver = drivers[0];
  // TODO(real-engine): replace with OSRM / OR-Tools call — polyline + distance
  // are straight-line approximations, not real road geometry.
  const morningCoords: [number, number][] = [
    [rahul.location!.lng, rahul.location!.lat],
    [priya.location!.lng, priya.location!.lat],
    OFFICE_HUB,
  ];
  const morningRoute = {
    cabId: morningCab._id,
    driverId: morningDriver._id,
    stops: [
      { employeeId: rahul._id, order: 1, etaMinutes: 8, otp: generateOtp(), status: "pending" as const },
      { employeeId: priya._id, order: 2, etaMinutes: 18, otp: generateOtp(), status: "pending" as const },
    ],
    geoJsonRoute: { type: "LineString" as const, coordinates: morningCoords },
    plannedDistanceKm: routeDistanceKm(morningCoords),
    status: "scheduled" as const,
  };

  const eveningCab = cabs[2];
  const eveningDriver = drivers[2];
  // TODO(real-engine): replace with OSRM / OR-Tools call
  const eveningCoords: [number, number][] = [
    [arjun.location!.lng, arjun.location!.lat],
    [vikram.location!.lng, vikram.location!.lat],
    [rohit.location!.lng, rohit.location!.lat],
    OFFICE_HUB,
  ];
  const eveningRoute = {
    cabId: eveningCab._id,
    driverId: eveningDriver._id,
    stops: [
      { employeeId: arjun._id, order: 1, etaMinutes: 10, otp: generateOtp(), status: "pending" as const },
      { employeeId: vikram._id, order: 2, etaMinutes: 20, otp: generateOtp(), status: "pending" as const },
      { employeeId: rohit._id, order: 3, etaMinutes: 30, otp: generateOtp(), status: "pending" as const },
    ],
    geoJsonRoute: { type: "LineString" as const, coordinates: eveningCoords },
    plannedDistanceKm: routeDistanceKm(eveningCoords),
    status: "scheduled" as const,
  };

  await Roster.create({ date: today, shift: "morning", routes: [morningRoute] });
  await Roster.create({ date: today, shift: "evening", routes: [eveningRoute] });

  await Employee.updateMany(
    { _id: { $in: [rahul._id, priya._id] } },
    { assignedCabId: morningCab._id }
  );
  await Employee.updateMany(
    { _id: { $in: [arjun._id, vikram._id, rohit._id] } },
    { assignedCabId: eveningCab._id }
  );

  const unmapped = employees.filter((e) => !e.location);
  const escorted = employees.filter((e) => e.requiresEscort);

  console.log("\nSeed complete:");
  console.log(`  Employees:      ${employees.length}`);
  console.log(`  Drivers/Cabs:   ${drivers.length}`);
  console.log(`  Rosters:        2 (morning, evening) for ${today.toDateString()}`);
  console.log(`  Escort-flagged: ${escorted.map((e) => e.name).join(", ") || "none"}`);
  console.log(`  Unmapped:       ${unmapped.map((e) => e.name).join(", ") || "none"}`);
}

seed()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Seed failed:", err);
    await mongoose.disconnect();
    process.exit(1);
  });
