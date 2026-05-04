-- ============================================================
-- 02_rls.sql
-- Row Level Security — Sistema de Reserva de Stands
-- Ejecutar DESPUÉS de 01_schema.sql
-- ============================================================

-- ── ACTIVAR RLS EN TODAS LAS TABLAS ─────────────────────────
ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stands       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- ── FUNCIÓN AUXILIAR: is_admin() ─────────────────────────────
-- Retorna true si el usuario autenticado actual tiene rol 'admin'.
-- SECURITY DEFINER: corre con privilegios del owner, evita recursión RLS.
-- STABLE: Supabase puede cachear el resultado dentro de la misma transacción.
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

-- ============================================================
-- USERS
-- Cada usuario solo ve su propio registro.
-- Los admins pueden ver todos.
-- La inserción la gestiona el trigger on_auth_user_created.
-- ============================================================
CREATE POLICY "users_select_self_or_admin" ON public.users
  FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "users_update_self" ON public.users
  FOR UPDATE
  USING (id = auth.uid());

-- ============================================================
-- EVENTS
-- Lectura pública. Escritura solo admin.
-- ============================================================
CREATE POLICY "events_select_public" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "events_insert_admin" ON public.events
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "events_update_admin" ON public.events
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "events_delete_admin" ON public.events
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- TIERS
-- Lectura pública. Escritura solo admin.
-- ============================================================
CREATE POLICY "tiers_select_public" ON public.tiers
  FOR SELECT USING (true);

CREATE POLICY "tiers_insert_admin" ON public.tiers
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "tiers_update_admin" ON public.tiers
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "tiers_delete_admin" ON public.tiers
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- STANDS
-- Lectura pública (cualquiera puede ver el mapa).
-- Escritura solo admin.
-- NOTA: las actualizaciones de status vía RPC usan SECURITY DEFINER,
--       por lo que no requieren política de UPDATE para anon.
-- ============================================================
CREATE POLICY "stands_select_public" ON public.stands
  FOR SELECT USING (true);

CREATE POLICY "stands_insert_admin" ON public.stands
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "stands_update_admin" ON public.stands
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "stands_delete_admin" ON public.stands
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- RESERVATIONS
-- Inserción pública: cualquiera puede crear una solicitud.
-- Lectura y modificación: solo admin.
-- NOTA: la inserción preferida es vía RPC create_reservation()
--       (que adquiere lock FOR UPDATE en el stand). Esta política
--       existe como respaldo pero el control de concurrencia real
--       vive en la función SQL.
-- ============================================================
CREATE POLICY "reservations_insert_public" ON public.reservations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "reservations_select_admin" ON public.reservations
  FOR SELECT USING (public.is_admin());

CREATE POLICY "reservations_update_admin" ON public.reservations
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "reservations_delete_admin" ON public.reservations
  FOR DELETE USING (public.is_admin());
