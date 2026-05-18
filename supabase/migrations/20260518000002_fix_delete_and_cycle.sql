-- Cambia delete_event a desactivar (no borrar físicamente).
-- Así los stands quedan para que start_new_cycle los pueda clonar.
CREATE OR REPLACE FUNCTION public.delete_event(p_event_id uuid)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.events WHERE id = p_event_id) THEN
    RETURN json_build_object('error', 'El evento no existe');
  END IF;

  UPDATE public.events SET activo = false WHERE id = p_event_id;

  RETURN json_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_event(uuid) TO authenticated;

-- Actualiza start_new_cycle para clonar stands del evento más reciente
-- (activo o no), no solo del activo. Esto permite crear un nuevo ciclo
-- incluso después de desactivar el evento anterior.
CREATE OR REPLACE FUNCTION public.start_new_cycle(
  p_nombre text,
  p_fecha  date,
  p_hora_expiracion time DEFAULT '23:59:00'
)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_source_event_id uuid;
  v_new_event       public.events;
BEGIN
  IF NOT public.is_admin() THEN RETURN json_build_object('error', 'Acceso denegado'); END IF;

  -- Busca primero el evento activo; si no hay, usa el más reciente (cualquier estado)
  SELECT id INTO v_source_event_id
  FROM public.events
  ORDER BY activo DESC, created_at DESC
  LIMIT 1;

  INSERT INTO public.events (nombre, fecha, hora_expiracion, activo)
  VALUES (p_nombre, p_fecha, p_hora_expiracion, true)
  RETURNING * INTO v_new_event;

  IF v_source_event_id IS NOT NULL THEN
    INSERT INTO public.stands (event_id, tier_id, nombre, svg_id, x, y, w, h, status)
    SELECT v_new_event.id, tier_id, nombre, svg_id, x, y, w, h, 'available'
    FROM public.stands WHERE event_id = v_source_event_id;
  END IF;

  RETURN json_build_object(
    'ok', true,
    'event_id', v_new_event.id,
    'nombre', v_new_event.nombre,
    'fecha', v_new_event.fecha,
    'hora_expiracion', v_new_event.hora_expiracion
  );
EXCEPTION WHEN OTHERS THEN RETURN json_build_object('error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.start_new_cycle(text, date, time) TO authenticated;
