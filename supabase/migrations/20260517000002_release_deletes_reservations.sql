-- Al liberar un stand, elimina sus reservas en lugar de marcarlas como rechazadas.
-- Así desaparecen del historial de exportaciones.
CREATE OR REPLACE FUNCTION public.release_stand(p_stand_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN RETURN json_build_object('error', 'Acceso denegado'); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.stands WHERE id = p_stand_id) THEN
    RETURN json_build_object('error', 'Stand no encontrado');
  END IF;
  DELETE FROM public.reservations WHERE stand_id = p_stand_id;
  UPDATE public.stands SET status = 'available' WHERE id = p_stand_id;
  RETURN json_build_object('ok', true);
EXCEPTION WHEN OTHERS THEN RETURN json_build_object('error', SQLERRM);
END;
$$;
