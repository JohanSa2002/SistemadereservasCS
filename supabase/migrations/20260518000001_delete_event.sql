-- Elimina un evento y toda su data asociada (stands, reservas, pdf_exports) via CASCADE.
CREATE OR REPLACE FUNCTION public.delete_event(p_event_id uuid)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.events WHERE id = p_event_id) THEN
    RETURN json_build_object('error', 'El evento no existe');
  END IF;

  DELETE FROM public.events WHERE id = p_event_id;

  RETURN json_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_event(uuid) TO authenticated;
