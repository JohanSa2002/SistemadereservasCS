-- ============================================================
-- 02_rls.sql
-- Row Level Security — Sistema de Reserva de Stands
-- ============================================================

-- ── ACTIVAR RLS EN TODAS LAS TABLAS ─────────────────────────
ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stands       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- ── FUNCIÓN AUXILIAR: is_admin() ─────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND rol = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- USERS
CREATE POLICY "users_select_self_or_admin" ON public.users
  FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "users_update_self" ON public.users
  FOR UPDATE
  USING (id = auth.uid());

-- EVENTS
CREATE POLICY "events_select_public" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "events_insert_admin" ON public.events
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "events_update_admin" ON public.events
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "events_delete_admin" ON public.events
  FOR DELETE USING (public.is_admin());

-- TIERS
CREATE POLICY "tiers_select_public" ON public.tiers
  FOR SELECT USING (true);

CREATE POLICY "tiers_insert_admin" ON public.tiers
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "tiers_update_admin" ON public.tiers
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "tiers_delete_admin" ON public.tiers
  FOR DELETE USING (public.is_admin());

-- STANDS
CREATE POLICY "stands_select_public" ON public.stands
  FOR SELECT USING (true);

CREATE POLICY "stands_insert_admin" ON public.stands
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "stands_update_admin" ON public.stands
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "stands_delete_admin" ON public.stands
  FOR DELETE USING (public.is_admin());

-- RESERVATIONS
CREATE POLICY "reservations_insert_public" ON public.reservations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "reservations_select_admin" ON public.reservations
  FOR SELECT USING (public.is_admin());

CREATE POLICY "reservations_update_admin" ON public.reservations
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "reservations_delete_admin" ON public.reservations
  FOR DELETE USING (public.is_admin());
