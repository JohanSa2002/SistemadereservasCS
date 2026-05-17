-- Agrega hora de expiración al evento
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS hora_expiracion time NOT NULL DEFAULT '23:59:00';

-- Actualiza start_new_cycle para aceptar hora_expiracion
CREATE OR REPLACE FUNCTION public.start_new_cycle(
  p_nombre text,
  p_fecha  date,
  p_hora_expiracion time DEFAULT '23:59:00'
)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_old_event_id uuid;
  v_new_event    public.events;
BEGIN
  IF NOT public.is_admin() THEN RETURN json_build_object('error', 'Acceso denegado'); END IF;

  SELECT id INTO v_old_event_id FROM public.events WHERE activo = true LIMIT 1;

  INSERT INTO public.events (nombre, fecha, hora_expiracion, activo)
  VALUES (p_nombre, p_fecha, p_hora_expiracion, true)
  RETURNING * INTO v_new_event;

  IF v_old_event_id IS NOT NULL THEN
    INSERT INTO public.stands (event_id, tier_id, nombre, svg_id, x, y, w, h, status)
    SELECT v_new_event.id, tier_id, nombre, svg_id, x, y, w, h, 'available'
    FROM public.stands WHERE event_id = v_old_event_id;
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
