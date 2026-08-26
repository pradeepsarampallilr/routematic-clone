# Build Phases & Claude Code Prompts

Work through these **in order, one phase per session/commit**. Don't paste all
phases at once — that's what burns tokens and produces messy, half-finished
code. Start a fresh Claude Code session per phase where reasonable; it will
still have `CLAUDE.md` for context automatically.

For each phase: only attach the files listed under "Give Claude Code" —
nothing else. Everything else it needs is already in `CLAUDE.md`.

---

## Phase 0 — Project skeleton & DB connection
**Give Claude Code:** `CLAUDE.md`, your existing `package.json`

**Prompt:**
> Read CLAUDE.md for full project context. Set up the base plumbing only —
> no UI yet. Do these:
> 1. Install and configure `mongoose`, `dotenv`.
> 2. Create `lib/db/connect.ts` — a cached Mongoose connection singleton
>    reading `process.env.MONGODB_URI`, safe for Next.js hot reload.
> 3. Create `.env.local.example` with `MONGODB_URI=` placeholder.
> 4. Create `app/globals.css` with a small CSS custom-property token set
>    (primary color, neutral grays, spacing scale, border-radius, font stack)
>    that all later components will reuse — keep it minimal and modern.
> 5. Create the folder structure from CLAUDE.md as empty `.gitkeep`'d folders
>    where files don't exist yet.
> Don't build any pages or components yet. Just plumbing.

---

## Phase 1 — Mongoose models
**Give Claude Code:** `CLAUDE.md`, `docs/DATA_MODELS.md`

**Prompt:**
> Read CLAUDE.md and docs/DATA_MODELS.md. Create every Mongoose schema/model
> listed there under `lib/models/`, one file per collection, matching the
> field names and types exactly. Export each as a cached model
> (`mongoose.models.X || mongoose.model('X', schema)`) to survive hot reload.
> No seed data yet, no UI — just schemas.

---

## Phase 2 — Mock data seeding
**Give Claude Code:** `CLAUDE.md`, `docs/DATA_MODELS.md`, the models from Phase 1

**Prompt:**
> Read CLAUDE.md and docs/DATA_MODELS.md. Build `lib/mock/seed.ts`: a script
> (add `"seed": "tsx lib/mock/seed.ts"` to package.json) that connects via
> lib/db/connect.ts, wipes all collections, and inserts realistic fake data:
> ~8 employees (mixed gender, a couple with night shifts to exercise the
> female-safety rule), ~4 drivers with cabs (4/6/12-seater mix), 1 roster
> covering today with 2 shifts, and pre-computed "optimized route" documents
> with fake GeoJSON polylines (simple straight-line coordinate arrays are
> fine — they don't need to be real roads) so the map has something to draw.
> Use realistic Indian names/addresses/lat-lng since this is Hyderabad-based.
> Print a summary of what was inserted when the script finishes.

---

## Phase 3 — Login / role picker + mock auth
**Give Claude Code:** `CLAUDE.md`

**Prompt:**
> Read CLAUDE.md. Build `/login`: a clean role-picker screen (Employee /
> Driver / Admin cards) that routes to `/company/employee`, `/vendor/driver`,
> `/admin` respectively. Each of those three pages should show a simple
> "select your name" dropdown (populated from the seeded DB via an API route)
> instead of a password field — this is a prototype, not real auth. On
> selection, set a cookie with `{ role, id }` and redirect to that role's
> `/dashboard`. Build `app/api/auth/route.ts` to handle this. Style with CSS
> Modules — make it look like a real, polished product landing/login, not a
> default Next.js starter page.

---

## Phase 4 — Admin dashboard
**Give Claude Code:** `CLAUDE.md`, `docs/DATA_MODELS.md` (Roster/Employee/Cab sections)

**Prompt:**
> Read CLAUDE.md. Build `/admin/dashboard` with these components under
> `components/admin/`: RosterTable (today's assignments: employee, cab,
> driver, route, status), CsvUploadBox (accepts a CSV, parses it client-side,
> shows a preview table — doesn't need to actually persist for the demo,
> just show it working), ShiftPicker (toggle between morning/evening shift
> rosters), RoiMetrics (a few stat cards: cabs utilized, avg occupancy, cost
> saved vs single-rider baseline — compute from seeded data), and
> UnmappedAddressAlertBox (shows any seeded employee whose address didn't
> resolve to lat/lng, with a "manually pin on map" affordance — a static
> mock state is fine). Fetch data via a new `app/api/roster/route.ts`.

---

## Phase 5 — Employee dashboard
**Give Claude Code:** `CLAUDE.md`, `docs/DATA_MODELS.md` (Ride/Route sections)

**Prompt:**
> Read CLAUDE.md. Build `/company/employee/dashboard` with
> components/employee/: CabAllotmentCard (cab number, driver name, plate,
> ETA, ≥2 co-passengers count), RouteMap (react-leaflet map drawing the
> mock GeoJSON polyline + pickup marker), and ConfirmPickupModal — a
> yes/no prompt ("Is this your pickup?"), where "Yes" opens a 4-digit OTP
// entry screen. Show the correct OTP on-screen for demo purposes with a
> label like "Demo OTP (sent via SMS): 1234". On successful entry, mark the
> ride as `in_progress` via `app/api/rides/[id]/otp/route.ts` and show a
> "Ride confirmed" state. If a female employee is flagged for night-shift
> escort, show a small "Security escort assigned" badge on the card.

---

## Phase 6 — Driver dashboard
**Give Claude Code:** `CLAUDE.md`

**Prompt:**
> Read CLAUDE.md. Build `/vendor/driver/dashboard` with components/driver/:
> StopsList (ordered list of pickups for this driver's route, each with
> employee name, address, status), PickupButton (per stop — "Clicks Pickup"
> opens the same map + OTP flow as the employee side, reusing
> components/common/MapView), and once every stop is confirmed, show
> "Ride Successful" and call `app/api/rides/[id]` to mark the whole route
> complete, which should also trigger the mock billing flow described in
> Phase 7 (a simple internal function call is fine, no need for a queue).

---

## Phase 7 — Billing & reconciliation
**Give Claude Code:** `CLAUDE.md`, `docs/DATA_MODELS.md` (Invoice section)

**Prompt:**
> Read CLAUDE.md. When a ride is marked complete, auto-generate an Invoice
> document via a `lib/billing/generateInvoice.ts` function: compute a mock
> "reconciliation" by comparing the seeded GeoJSON distance against a
> slightly-randomized "actual GPS distance," flag a penalty if deviation
> > 15%, and store the result. Build `/admin/billing` with
> components/billing/: InvoiceCard (route, driver, base fare, penalty if
> any, total) and ReconciliationBadge (green "Validated" / red "Flagged:
> X% deviation"). List all invoices for the day, split into "HR payouts"
> (employee-side cost) and "Vendor payouts" (driver-side earnings) tabs.

---

## Phase 8 — Polish pass
**Give Claude Code:** `CLAUDE.md` only

**Prompt:**
> Read CLAUDE.md. Do a polish pass across all pages: consistent loading
> skeletons, empty states, responsive layout down to ~768px, hover/focus
> states on interactive elements, and make sure every page uses the CSS
> custom properties from globals.css consistently (no hardcoded hex colors
> in component CSS modules). Don't change any logic — styling only.

---

## Phase 9 — Demo prep (no Claude Code needed)
Re-run `npm run seed` right before the demo so timestamps look "today."
Walk your mentor through: Admin uploads roster → Roster auto-assigns cabs
(mention this is where OR-Tools/OSRM would run in production) → Employee
confirms pickup with OTP → Driver completes route → invoice auto-generates
with reconciliation check. That mirrors your flow diagram end-to-end.