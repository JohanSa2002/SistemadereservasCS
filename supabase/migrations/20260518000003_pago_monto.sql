-- Agrega monto de abono a reservations
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS pago_monto numeric DEFAULT NULL;

-- Elimina todas las sobrecargas anteriores de create_reservation para evitar ambigüedad
DROP FUNCTION IF EXISTS public.create_reservation(uuid, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.create_reservation(uuid, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.create_reservation(uuid, text, text, text, text, text, text, numeric);

-- Versión definitiva con pago_tipo + pago_monto
CREATE FUNCTION public.create_reservation(
  p_stand_id    uuid,
  p_nombre      text,
  p_cedula      text,
  p_celular     text,
  p_correo      text,
  p_metodo_pago text DEFAULT 'efectivo',
  p_pago_tipo   text DEFAULT 'completo',
  p_pago_monto  numeric DEFAULT NULL
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

  INSERT INTO public.reservations
    (stand_id, nombre, cedula, celular, correo, metodo_pago, pago_tipo, pago_monto, status)
  VALUES
    (p_stand_id, p_nombre, p_cedula, p_celular, p_correo, p_metodo_pago, p_pago_tipo, p_pago_monto, 'pending')
  RETURNING * INTO v_reservation;

  UPDATE public.stands SET status = 'pending' WHERE id = p_stand_id;
  RETURN json_build_object('ok', true, 'reservation_id', v_reservation.id);
EXCEPTION WHEN OTHERS THEN RETURN json_build_object('error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_reservation(uuid, text, text, text, text, text, text, numeric) TO anon, authenticated;
