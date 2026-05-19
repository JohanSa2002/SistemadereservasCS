-- Desactiva automáticamente eventos cuya fecha+hora_expiracion ya pasó.
-- Se llama desde getActiveEvent() en cada carga, sin necesidad de cron.
CREATE OR REPLACE FUNCTION public.deactivate_expired_events()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.events
  SET activo = false
  WHERE activo = true
    AND (fecha + hora_expiracion) < (NOW() AT TIME ZONE 'America/Panama');
END;
$$;

-- Accesible tanto para usuarios anónimos (mapa público) como admins
GRANT EXECUTE ON FUNCTION public.deactivate_expired_events() TO anon, authenticated;
