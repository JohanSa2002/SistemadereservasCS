-- Agrega columna pago_tipo a reservations
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS pago_tipo text NOT NULL DEFAULT 'completo'
    CHECK (pago_tipo IN ('completo', 'abono'));

-- Actualiza create_reservation para aceptar p_pago_tipo
CREATE OR REPLACE FUNCTION public.create_reservation(
  p_stand_id uuid, p_nombre text, p_cedula text, p_celular text, p_correo text,
  p_metodo_pago text DEFAULT 'efectivo',
  p_pago_tipo   text DEFAULT 'completo'
)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_stand       public.stands;
  v_reservation public.reservations;
BEGIN
  SELECT * INTO v_stand FROM public.stands WHERE id = p_stand_id FOR UPDATE;
  IF NOT FOUND THEN RETURN json_build_object('error', 'Stand no encontrado'); END IF;
  IF v_stand.status != 'available' THEN RETURN json_build_object('error', 'El stand ya no está disponible'); END IF;

  INSERT INTO public.reservations (stand_id, nombre, cedula, celular, correo, metodo_pago, pago_tipo, status)
  VALUES (p_stand_id, p_nombre, p_cedula, p_celular, p_correo, p_metodo_pago, p_pago_tipo, 'pending')
  RETURNING * INTO v_reservation;

  UPDATE public.stands SET status = 'pending' WHERE id = p_stand_id;
  RETURN json_build_object('ok', true, 'reservation_id', v_reservation.id);
EXCEPTION WHEN OTHERS THEN RETURN json_build_object('error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_reservation(uuid, text, text, text, text, text, text) TO anon, authenticated;
