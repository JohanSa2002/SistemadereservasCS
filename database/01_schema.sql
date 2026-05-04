-- ============================================================
-- 01_schema.sql
-- Sistema de Reserva de Stands — ProyectoChiriquistorage
-- Ejecutar en: Supabase > SQL Editor
-- ============================================================

-- Extensión para UUIDs (disponible por defecto en Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── USERS ────────────────────────────────────────────────────
-- Espejo de auth.users con el rol de la aplicación.
-- Se llena automáticamente vía trigger al crear un usuario en Auth.
CREATE TABLE IF NOT EXISTS public.users (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text        NOT NULL,
  rol        text        NOT NULL DEFAULT 'admin' CHECK (rol = 'admin'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── EVENTS ───────────────────────────────────────────────────
-- Cada ciclo mensual de la feria es un evento.
-- Solo un evento puede tener activo = true al mismo tiempo
-- (enforced por trigger en 03_functions.sql).
CREATE TABLE IF NOT EXISTS public.events (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     text        NOT NULL,
  fecha      date        NOT NULL,
  activo     boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── TIERS ────────────────────────────────────────────────────
-- Categorías de precio para los stands (A, B, C).
CREATE TABLE IF NOT EXISTS public.tiers (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     text        NOT NULL,
  color      text        NOT NULL,                          -- hex, ej: '#7C3AED'
  precio     numeric     NOT NULL CHECK (precio > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── STANDS ───────────────────────────────────────────────────
-- Un stand físico dentro de un evento.
-- svg_id identifica el elemento en el SVG del plano de sala.
CREATE TABLE IF NOT EXISTS public.stands (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   uuid        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  tier_id    uuid        NOT NULL REFERENCES public.tiers(id),
  nombre     text        NOT NULL,                          -- ej: 'Stand A1'
  svg_id     text        NOT NULL,                          -- ej: 'stand-a1'
  status     text        NOT NULL DEFAULT 'available'
               CHECK (status IN ('available', 'pending', 'reserved')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── RESERVATIONS ─────────────────────────────────────────────
-- Solicitud de reserva de un stand.
-- Una misma cédula no puede tener dos reservas activas en el mismo evento
-- (enforced por trigger en 03_functions.sql).
CREATE TABLE IF NOT EXISTS public.reservations (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  stand_id   uuid        NOT NULL REFERENCES public.stands(id) ON DELETE CASCADE,
  nombre     text        NOT NULL,
  cedula     text        NOT NULL,
  celular    text        NOT NULL,
  correo     text        NOT NULL,
  status     text        NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'confirmed', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── ÍNDICES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_stands_event_id       ON public.stands(event_id);
CREATE INDEX IF NOT EXISTS idx_stands_status         ON public.stands(status);
CREATE INDEX IF NOT EXISTS idx_stands_event_status   ON public.stands(event_id, status);
CREATE INDEX IF NOT EXISTS idx_reservations_stand_id ON public.reservations(stand_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status   ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_cedula   ON public.reservations(cedula);
CREATE INDEX IF NOT EXISTS idx_events_activo         ON public.events(activo) WHERE activo = true;

-- ── REALTIME ─────────────────────────────────────────────────
-- Habilita eventos de cambio en la tabla stands para que el
-- frontend reciba actualizaciones de status en tiempo real.
ALTER PUBLICATION supabase_realtime ADD TABLE public.stands;
