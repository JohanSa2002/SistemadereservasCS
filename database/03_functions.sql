-- ============================================================
-- 03_functions.sql
-- Triggers + Funciones de negocio (RPC)
-- Ejecutar DESPUÉS de 02_rls.sql
-- ============================================================

-- ============================================================
-- TRIGGERS DE INTEGRIDAD
-- ============================================================

-- ── Trigger 1: crear registro en public.users al registrarse ─
-- Se dispara automáticamente cuando Supabase Auth crea un usuario.
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
-- Cuando se activa un evento, desactiva todos los demás.
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
-- Un expositor (cedula) no puede tener dos reservas activas
-- (pending o confirmed) en el mismo evento.
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


-- ============================================================
-- FUNCIONES DE NEGOCIO (llamadas vía supabase.rpc())
-- ============================================================

-- ── 1. create_reservation ────────────────────────────────────
-- Acceso: público (anon)
-- Adquiere un lock FOR UPDATE en el stand para evitar que dos
-- usuarios reserven el mismo stand de forma simultánea.
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
  -- Lock exclusivo sobre la fila del stand para serializar reservas concurrentes
  SELECT * INTO v_stand
  FROM public.stands
  WHERE id = p_stand_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Stand no encontrado');
  END IF;

  IF v_stand.status != 'available' THEN
    RETURN json_build_object('error', 'El stand ya no está disponible');
  END IF;

  -- La inserción dispara trg_cedula_per_event antes de completarse
  INSERT INTO public.reservations (stand_id, nombre, cedula, celular, correo, status)
  VALUES (p_stand_id, p_nombre, p_cedula, p_celular, p_correo, 'pending')
  RETURNING * INTO v_reservation;

  UPDATE public.stands
  SET status = 'pending'
  WHERE id = p_stand_id;

  RETURN json_build_object(
    'ok',             true,
    'reservation_id', v_reservation.id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_reservation TO anon, authenticated;


-- ── 2. confirm_reservation ───────────────────────────────────
-- Acceso: solo admin autenticado
CREATE OR REPLACE FUNCTION public.confirm_reservation(
  p_reservation_id uuid
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_res public.reservations;
BEGIN
  IF NOT public.is_admin() THEN
    RETURN json_build_object('error', 'Acceso denegado');
  END IF;

  SELECT * INTO v_res
  FROM public.reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Reserva no encontrada');
  END IF;

  IF v_res.status != 'pending' THEN
    RETURN json_build_object('error', 'Solo se pueden confirmar reservas en estado pendiente');
  END IF;

  UPDATE public.reservations SET status = 'confirmed' WHERE id = p_reservation_id;
  UPDATE public.stands        SET status = 'reserved'  WHERE id = v_res.stand_id;

  RETURN json_build_object('ok', true);

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_reservation TO authenticated;


-- ── 3. reject_reservation ────────────────────────────────────
-- Acceso: solo admin autenticado
CREATE OR REPLACE FUNCTION public.reject_reservation(
  p_reservation_id uuid
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_res public.reservations;
BEGIN
  IF NOT public.is_admin() THEN
    RETURN json_build_object('error', 'Acceso denegado');
  END IF;

  SELECT * INTO v_res
  FROM public.reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Reserva no encontrada');
  END IF;

  IF v_res.status != 'pending' THEN
    RETURN json_build_object('error', 'Solo se pueden rechazar reservas en estado pendiente');
  END IF;

  UPDATE public.reservations SET status = 'rejected'  WHERE id = p_reservation_id;
  UPDATE public.stands        SET status = 'available' WHERE id = v_res.stand_id;

  RETURN json_build_object('ok', true);

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.reject_reservation TO authenticated;


-- ── 4. manual_reservation ────────────────────────────────────
-- Acceso: solo admin autenticado
-- Crea una reserva confirmada directamente sin pasar por 'pending'.
-- Si el stand tiene una reserva pendiente, la rechaza primero.
CREATE OR REPLACE FUNCTION public.manual_reservation(
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
  IF NOT public.is_admin() THEN
    RETURN json_build_object('error', 'Acceso denegado');
  END IF;

  SELECT * INTO v_stand
  FROM public.stands
  WHERE id = p_stand_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Stand no encontrado');
  END IF;

  IF v_stand.status = 'reserved' THEN
    RETURN json_build_object('error', 'El stand ya está reservado');
  END IF;

  -- Rechazar cualquier solicitud pendiente sobre este stand
  UPDATE public.reservations
  SET status = 'rejected'
  WHERE stand_id = p_stand_id AND status = 'pending';

  INSERT INTO public.reservations (stand_id, nombre, cedula, celular, correo, status)
  VALUES (p_stand_id, p_nombre, p_cedula, p_celular, p_correo, 'confirmed')
  RETURNING * INTO v_reservation;

  UPDATE public.stands SET status = 'reserved' WHERE id = p_stand_id;

  RETURN json_build_object(
    'ok',             true,
    'reservation_id', v_reservation.id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.manual_reservation TO authenticated;


-- ── 5. release_stand ─────────────────────────────────────────
-- Acceso: solo admin autenticado
-- Libera un stand: cancela reservas pendientes y lo pone 'available'.
CREATE OR REPLACE FUNCTION public.release_stand(
  p_stand_id uuid
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RETURN json_build_object('error', 'Acceso denegado');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.stands WHERE id = p_stand_id) THEN
    RETURN json_build_object('error', 'Stand no encontrado');
  END IF;

  UPDATE public.reservations
  SET status = 'rejected'
  WHERE stand_id = p_stand_id AND status = 'pending';

  UPDATE public.stands
  SET status = 'available'
  WHERE id = p_stand_id;

  RETURN json_build_object('ok', true);

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.release_stand TO authenticated;


-- ── 6. start_new_cycle ───────────────────────────────────────
-- Acceso: solo admin autenticado
-- Crea un nuevo evento mensual, desactiva el anterior y clona
-- todos sus stands con status 'available'.
CREATE OR REPLACE FUNCTION public.start_new_cycle(
  p_nombre text,
  p_fecha  date
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_event_id uuid;
  v_new_event    public.events;
BEGIN
  IF NOT public.is_admin() THEN
    RETURN json_build_object('error', 'Acceso denegado');
  END IF;

  SELECT id INTO v_old_event_id
  FROM public.events
  WHERE activo = true
  LIMIT 1;

  -- El trigger enforce_single_active_event desactiva el evento anterior
  INSERT INTO public.events (nombre, fecha, activo)
  VALUES (p_nombre, p_fecha, true)
  RETURNING * INTO v_new_event;

  -- Clonar stands del evento anterior con status 'available'
  IF v_old_event_id IS NOT NULL THEN
    INSERT INTO public.stands (event_id, tier_id, nombre, svg_id, status)
    SELECT v_new_event.id, tier_id, nombre, svg_id, 'available'
    FROM public.stands
    WHERE event_id = v_old_event_id;
  END IF;

  RETURN json_build_object(
    'ok',       true,
    'event_id', v_new_event.id,
    'nombre',   v_new_event.nombre,
    'fecha',    v_new_event.fecha
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.start_new_cycle TO authenticated;


-- ── 7. update_tier_price ─────────────────────────────────────
-- Acceso: solo admin autenticado
CREATE OR REPLACE FUNCTION public.update_tier_price(
  p_tier_id uuid,
  p_precio  numeric
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RETURN json_build_object('error', 'Acceso denegado');
  END IF;

  IF p_precio <= 0 THEN
    RETURN json_build_object('error', 'El precio debe ser mayor que cero');
  END IF;

  UPDATE public.tiers
  SET precio = p_precio
  WHERE id = p_tier_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Tier no encontrado');
  END IF;

  RETURN json_build_object('ok', true);

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_tier_price TO authenticated;


-- ============================================================
-- DATOS INICIALES (Tiers por defecto del prototipo)
-- Descomenta y ajusta según necesites.
-- ============================================================
/*
INSERT INTO public.tiers (nombre, color, precio) VALUES
  ('Tier A', '#7C3AED', 250),
  ('Tier B', '#0891B2', 175),
  ('Tier C', '#65A30D', 110)
ON CONFLICT DO NOTHING;
*/
