@AGENTS.md
# Employee Transport Initiative (ETI) — Project Context

Claude Code: read this file first, every session. It replaces re-explaining the
project. Only open `docs/PHASES.md` or `docs/DATA_MODELS.md` when a task needs them.

## What this is
A corporate cab/shuttle platform (like RouteMatic/Shuttl) with three portals —
Employee, Vendor/Driver, Admin — built around a central "Roster" that assigns
employees to cabs/routes, OTP-verified pickups, GPS-vs-route reconciliation,
and automatic billing.

**This build is a PROTOTYPE for a mentor demo.** It runs on mock/seeded data.
There is no real routing engine, no real SMS, no real payments. Every place a
real engine would plug in should be mocked and flagged with:
`// TODO(real-engine): replace with OSRM / OR-Tools call`

## Tech stack (fixed — don't suggest alternatives)
- Next.js (App Router, TypeScript) — already scaffolded
- MongoDB + Mongoose
- **Plain CSS Modules only.** No Tailwind, no component libraries (no MUI/shadcn/etc).
  UI should look hand-built and clean, not templated.
- react-leaflet + OpenStreetMap tiles for map views (free, no API key) — routes
  drawn from mock GeoJSON stored in MongoDB, not fetched from a live OSRM server.

## Non-negotiable conventions
- One component = one folder = matching names:
  `components/<domain>/<ComponentName>/<ComponentName>.tsx` +
  `components/<domain>/<ComponentName>/<ComponentName>.module.css`
- Route-level styles: `app/<route>/page.module.css` next to `page.tsx`.
- No inline `style={}`, no global CSS except `app/globals.css` (reset, fonts,
  CSS custom properties for color/spacing tokens).
- API routes (`app/api/**/route.ts`) stay thin — just parse request, call a
  function from `lib/`, return response. All real logic lives in `lib/`.
- One Mongo connection singleton: `lib/db/connect.ts`. Every model/route imports it.
- Mongoose schemas live in `lib/models/*.ts`, one file per collection.
- Fake/seed data lives in `lib/mock/seed.ts` — running `npm run seed` should
  wipe and repopulate the DB with realistic demo data (see docs/DATA_MODELS.md).
- Auth is **mocked**: no NextAuth, no passwords. Logging in as Employee/Driver/
  Admin just picks a seeded document by ID and stores the role + id in a cookie.
  Don't build real auth — it's out of scope and burns time you don't have.

## The three roles / routes
| Route                  | Role     | Landing page after login          |
|-------------------------|----------|------------------------------------|
| `/login`                | —        | role picker                        |
| `/company/employee`     | Employee | `/company/employee/dashboard`      |
| `/vendor/driver`        | Driver   | `/vendor/driver/dashboard`         |
| `/admin`                | Admin    | `/admin/dashboard`                 |

## Folder structure (target — create as you go, don't scaffold all at once)
```
app/
  layout.tsx / globals.css / page.tsx        (redirects to /login)
  login/page.tsx + Login.module.css
  company/employee/
    page.tsx                (login screen)
    dashboard/page.tsx       (cab allotment, confirm pickup, map)
  vendor/driver/
    page.tsx
    dashboard/page.tsx       (stop list, clicks pickup, OTP, map)
  admin/
    page.tsx
    dashboard/page.tsx       (roster table, CSV upload, ROI metrics)
    billing/page.tsx
  api/
    auth/route.ts
    roster/route.ts
    rides/route.ts
    rides/[id]/otp/route.ts
    billing/route.ts
components/
  common/ (Navbar, Sidebar, Card, Modal, Badge, MapView)
  employee/ (CabAllotmentCard, ConfirmPickupModal, RouteMap)
  driver/ (StopsList, PickupButton, OtpPad)
  admin/ (CsvUploadBox, ShiftPicker, RoiMetrics, UnmappedAlertBox, RosterTable)
  billing/ (InvoiceCard, ReconciliationBadge)
lib/
  db/connect.ts
  models/ (Employee.ts, Driver.ts, Cab.ts, Roster.ts, Ride.ts, Invoice.ts)
  mock/ (seed.ts, fakeData.ts)
  utils/ (haversine.ts, otp.ts)
docs/
  PHASES.md
  DATA_MODELS.md
```

## Explicitly out of scope for the prototype (mock these, don't build them)
- Real OSRM distance-matrix / route-geometry server calls
- Real Python OR-Tools solver (simulate its *output shape* only)
- Real SMS OTP delivery (show the OTP on-screen with a note "sent via SMS")
- Real payment/payout rails to HR/vendor — just render an invoice record

## Where to look next
- `docs/PHASES.md` — the build order and the exact prompt to give Claude Code
  for each phase (only reference the phase you're currently on).
- `docs/DATA_MODELS.md` — Mongoose schema shapes + example seed documents.