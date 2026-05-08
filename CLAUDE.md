# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Vite dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build

# Supabase local DB
npm run db:start     # Start local Supabase (Docker required)
npm run db:stop      # Stop local Supabase
npm run db:reset     # Apply all migrations from scratch + seed
npx supabase status  # Check running services and local URLs
```

No test suite is configured.

### Environment variables

Create a `.env` file at the root:
```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon key from npx supabase status>
```

## Architecture

### Two separate user experiences

**Public flow** (`/`) — no login required, bilingual (ES/EN):
- `Welcome` → `PublicMap` → `ReservationFlow`
- State is managed in `App.jsx` via `publicStep` + `selectedStand`; navigation is prop-driven, not router-driven
- After submitting a reservation, the app opens WhatsApp with a pre-filled message to the organizer

**Admin flow** (`/admin/*`) — protected by Supabase Auth session:
- Sidebar layout via `AdminLayout`; routes: Dashboard, AdminMap, Tiers, Cycles, Export
- Session is checked on app load; all `/admin` routes redirect to `/admin/login` if no session

### Data layer (`src/api/api.js`)

All functions throw on error with a Spanish message. Two error patterns to check:
1. `throwIfError(error, msg)` — PostgREST/network error
2. `throwIfRpcError(data)` — RPCs return `{ error: string }` on business rule failures; must be checked explicitly

**All DB mutations go through Postgres RPCs** (not direct table writes). The RPCs in `supabase/migrations/20260504000003_functions.sql` enforce:
- `create_reservation`: acquires `FOR UPDATE` lock on the stand to prevent double-booking
- `confirm_reservation` / `reject_reservation`: status transitions with stand sync
- `manual_reservation`: admin bypass that auto-rejects any pending request on that stand
- `release_stand`: resets stand to `available`, rejects pending reservations
- `start_new_cycle`: deactivates current event, creates a new one, clones all stands with `status = 'available'`

The trigger `trg_cedula_per_event` enforces one reservation per cédula per event at the DB level.

### Database schema

```
events      (id, nombre, fecha, activo)
tiers       (id, nombre, color, precio)   — seeded: Tier A/B/C
stands      (id, event_id, tier_id, nombre, svg_id, x, y, w, h, status)
reservations(id, stand_id, nombre, cedula, celular, correo, metodo_pago, status)
pdf_exports (id, event_id, event_nombre, filter_status, reservation_count, confirmed_count, revenue, generated_at, generated_by)
users       (id, email, rol)              — mirror of auth.users, rol always 'admin'
```

Stand statuses: `available` → `pending` → `reserved` (or back to `available` via reject/release).  
Reservation statuses: `pending` → `confirmed` | `rejected`.  
Only one event can have `activo = true` at a time (enforced by trigger).

### RLS pattern

`is_admin()` checks `public.users.rol = 'admin'`. Every `auth.users` insert automatically creates a `public.users` record with `rol = 'admin'` (trigger `on_auth_user_created`), so any user who can sign up is an admin.

Public users can only INSERT into `reservations`. All other write operations require `is_admin()`.

### Design system

- **Tokens**: `src/theme/tokens.js` exports `T` (colors, typography, radii, shadows), `TIERS` (A/B/C metadata), `STATUS` (available/pending/reserved metadata).
- **Components**: `src/components/UI.jsx` — `CSButton`, `CSCard`, `CSBadge`, `CSField`, `CSInput`, `CSLogo`. All styling is inline using `T.*` tokens; no CSS modules or Tailwind.
- **Icons**: `lucide-react` throughout.
- **Stand map**: `StandMap.jsx` renders SVG from `stands.x, y, w, h` coordinates stored in DB. Tier letter is parsed from `tiers.nombre` (e.g. `"Tier A"` → `"A"`).

### Realtime

`subscribeToStands(eventId, callback)` uses Supabase Postgres Changes (`UPDATE` on `public.stands`). Call `channel.unsubscribe()` on component unmount.

### PDF export

Uses `window.print()` — no PDF library. `buildPrintHTML()` generates a standalone HTML document with embedded CSS (`@page`, `print-color-adjust: exact`), opened in a new window that auto-calls `print()`. Records are saved to `pdf_exports` via `saveExportRecord()` after each generation.

### Important: `frontend/` is design-only

The `frontend/*.jsx` files are static Figma-to-code prototypes used for design reference. **The working application lives entirely in `src/`.** Never edit files under `frontend/`.

### Adding a new migration

Create `supabase/migrations/YYYYMMDDHHMMSS_name.sql`, then run `npm run db:reset` to apply it locally.
