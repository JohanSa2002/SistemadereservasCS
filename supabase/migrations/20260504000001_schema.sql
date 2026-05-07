-- ============================================================
-- 01_schema.sql
-- Sistema de Reserva de Stands — ProyectoChiriquistorage
-- ============================================================

-- Extensión para UUIDs (disponible por defecto en Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text        NOT NULL,
  rol        text        NOT NULL DEFAULT 'admin' CHECK (rol = 'admin'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── EVENTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     text        NOT NULL,
  fecha      date        NOT NULL,
  activo     boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── TIERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tiers (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     text        NOT NULL,
  color      text        NOT NULL,
  precio     numeric     NOT NULL CHECK (precio > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── STANDS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stands (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   uuid        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  tier_id    uuid        NOT NULL REFERENCES public.tiers(id),
  nombre     text        NOT NULL,
  svg_id     text        NOT NULL,
  x          int         NOT NULL DEFAULT 0,
  y          int         NOT NULL DEFAULT 0,
  w          int         NOT NULL DEFAULT 50,
  h          int         NOT NULL DEFAULT 54,
  status     text        NOT NULL DEFAULT 'available'
               CHECK (status IN ('available', 'pending', 'reserved')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── RESERVATIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reservations (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  stand_id   uuid        NOT NULL REFERENCES public.stands(id) ON DELETE CASCADE,
  nombre        text        NOT NULL,
  cedula        text        NOT NULL,
  celular       text        NOT NULL,
  correo        text        NOT NULL,
  metodo_pago   text        NOT NULL DEFAULT 'efectivo'
                  CHECK (metodo_pago IN ('efectivo', 'yappi')),
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
-- Nota: En local, a veces la publicación no existe todavía, por eso el check
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.stands;
EXCEPTION
  WHEN others THEN NULL;
END $$;
