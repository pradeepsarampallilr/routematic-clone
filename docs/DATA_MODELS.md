# Data Models & Mock Data Shapes

Field lists are the source of truth for Mongoose schemas — keep types simple
(String/Number/Boolean/Date/Array/nested object). Don't add fields beyond
what a phase's UI actually reads; this is a prototype, not a production schema.

## Employee
```
{
  name: String,
  gender: "male" | "female",  email: String,
  phone: String,          // masked in UI, shown as +91 XXXXX-1234
  address: String,
  location: { lat: Number, lng: Number },
  department: String,
  shift: "morning" | "evening" | "night",
  assignedCabId: ObjectId (ref Cab, nullable),
  requiresEscort: Boolean  // true if female + night shift, set at seed time
}
```

## Driver
```
{
  name: String,
  phone: String,
  licenseNumber: String,
  cabId: ObjectId (ref Cab)
}
```

## Cab
```
{
  plateNumber: String,
  seatCapacity: 4 | 6 | 12,
  type: "sedan" | "suv" | "van",
  driverId: ObjectId (ref Driver)
}
```

## Roster (one per day/shift)
```
{
  date: Date,
  shift: "morning" | "evening" | "night",
  routes: [
    {
      cabId: ObjectId,
      driverId: ObjectId,
      stops: [
        {
          employeeId: ObjectId,
          order: Number,
          etaMinutes: Number,
          otp: String,          // 4-digit, generated at roster creation
          status: "pending" | "confirmed" | "picked_up"
        }
      ],
      geoJsonRoute: {           // mock polyline, doesn't need real roads
        type: "LineString",
        coordinates: [[lng, lat], [lng, lat], ...]
      },
      plannedDistanceKm: Number,
      status: "scheduled" | "in_progress" | "completed"
    }
  ]
}
```

## Ride (one per route execution — created when a route starts)
```
{
  rosterId: ObjectId,
  routeIndex: Number,       // which route within roster.routes
  startedAt: Date,
  completedAt: Date,
  actualDistanceKm: Number, // seeded as plannedDistanceKm * random(0.95–1.25)
  status: "in_progress" | "completed"
}
```

## Invoice
```
{
  rideId: ObjectId,
  driverId: ObjectId,
  baseFare: Number,
  deviationPercent: Number,   // (actualDistanceKm - plannedDistanceKm) / plannedDistanceKm * 100
  flagged: Boolean,           // true if deviationPercent > 15
  penaltyAmount: Number,      // 0 if not flagged
  totalAmount: Number,
  hrPayoutAmount: Number,     // what's billed to the company/HR
  vendorPayoutAmount: Number, // what's paid to the vendor/driver
  generatedAt: Date
}
```

## Example seed values (for realism in the demo)
- Use Hyderabad-area coordinates: office hub around `{ lat: 17.4239, lng: 78.4738 }`
  (Hitech City), employee addresses scattered within ~15km (Gachibowli,
  Kondapur, Madhapur, Miyapur, Kukatpally).
- Give 2 female employees a `night` shift so `requiresEscort` demonstrates
  the safety rule in the UI.
- Give at least one employee an address that seeds as "unmapped" (no
  lat/lng) so Phase 4's UnmappedAddressAlertBox has something to show.
- Make one route's `actualDistanceKm` deliberately >15% over planned so
  Phase 7's reconciliation badge has a "Flagged" example to display, and
  make the rest clean "Validated" ones.