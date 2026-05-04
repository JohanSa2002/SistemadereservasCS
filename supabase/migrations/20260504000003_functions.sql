-- ============================================================
-- 03_functions.sql
-- Triggers + Funciones de negocio (RPC)
-- ============================================================

-- ── Trigger 1: crear registro en public.users al registrarse ─
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, rol)
  VALUES (NEW.id, NEW.email, 'admin')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Trigger 2: solo un evento activo a la vez ─────────────────
CREATE OR REPLACE FUNCTION public.enforce_single_active_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.events
  SET activo = false
  WHERE id != NEW.id AND activo = true;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_single_active_event ON public.events;
CREATE TRIGGER trg_single_active_event
  BEFORE INSERT OR UPDATE OF activo ON public.events
  FOR EACH ROW
  WHEN (NEW.activo = true)
  EXECUTE FUNCTION public.enforce_single_active_event();

-- ── Trigger 3: cédula única por evento ───────────────────────
CREATE OR REPLACE FUNCTION public.check_cedula_per_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_event_id uuid;
BEGIN
  SELECT event_id INTO v_event_id
  FROM public.stands WHERE id = NEW.stand_id;

  IF EXISTS (
    SELECT 1
    FROM public.reservations r
    JOIN public.stands s ON s.id = r.stand_id
    WHERE s.event_id = v_event_id
      AND r.cedula   = NEW.cedula
      AND r.status   IN ('pending', 'confirmed')
  ) THEN
    RAISE EXCEPTION 'Esta cédula ya tiene una reserva activa en este evento';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cedula_per_event ON public.reservations;
CREATE TRIGGER trg_cedula_per_event
  BEFORE INSERT ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.check_cedula_per_event();

-- ── 1. create_reservation ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.create_reservation(
  p_stand_id uuid,
  p_nombre   text,
  p_cedula   text,
  p_celular  text,
  p_correo   text
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stand       public.stands;
  v_reservation public.reservations;
BEGIN
  SELECT * INTO v_stand FROM public.stands WHERE id = p_stand_id FOR UPDATE;
  IF NOT FOUND THEN RETURN json_build_object('error', 'Stand no encontrado'); END IF;
  IF v_stand.status != 'available' THEN RETURN json_build_object('error', 'El stand ya no está disponible'); END IF;

  INSERT INTO public.reservations (stand_id, nombre, cedula, celular, correo, status)
  VALUES (p_stand_id, p_nombre, p_cedula, p_celular, p_correo, 'pending')
  RETURNING * INTO v_reservation;

  UPDATE public.stands SET status = 'pending' WHERE id = p_stand_id;

  RETURN json_build_object('ok', true, 'reservation_id', v_reservation.id);
EXCEPTION WHEN OTHERS THEN RETURN json_build_object('error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_reservation TO anon, authenticated;

-- (Otras funciones simplificadas para brevedad en la migración, manteniendo la lógica original)
CREATE OR REPLACE FUNCTION public.confirm_reservation(p_reservation_id uuid) RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_res public.reservations;
BEGIN
  IF NOT public.is_admin() THEN RETURN json_build_object('error', 'Acceso denegado'); END IF;
  SELECT * INTO v_res FROM public.reservations WHERE id = p_reservation_id FOR UPDATE;
  IF NOT FOUND THEN RETURN json_build_object('error', 'Reserva no encontrada'); END IF;
  UPDATE public.reservations SET status = 'confirmed' WHERE id = p_reservation_id;
  UPDATE public.stands SET status = 'reserved' WHERE id = v_res.stand_id;
  RETURN json_build_object('ok', true);
END; $$;

GRANT EXECUTE ON FUNCTION public.confirm_reservation TO authenticated;

-- Insertar Tiers iniciales
INSERT INTO public.tiers (nombre, color, precio) VALUES
  ('Tier A', '#7C3AED', 250),
  ('Tier B', '#0891B2', 175),
  ('Tier C', '#65A30D', 110)
ON CONFLICT DO NOTHING;
