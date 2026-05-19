-- Amplía el check constraint de pago_tipo para incluir los nuevos tipos de pago
ALTER TABLE public.reservations
  DROP CONSTRAINT IF EXISTS reservations_pago_tipo_check;

ALTER TABLE public.reservations
  ADD CONSTRAINT reservations_pago_tipo_check
    CHECK (pago_tipo IN ('completo', 'adelantado', 'dia_evento', 'abono'));
