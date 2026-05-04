-- ============================================================
-- seed.sql
-- Datos iniciales para desarrollo local.
-- Genera un evento activo y 60 stands automáticamente.
-- ============================================================

-- 1. Crear evento activo
INSERT INTO public.events (nombre, fecha, activo)
VALUES ('Expo Emprende Local', CURRENT_DATE + INTERVAL '30 days', true);

-- 2. Obtener IDs (usando variables de sesión de psql o subqueries)
DO $$
DECLARE
  v_event_id uuid;
  v_tier_a uuid;
  v_tier_b uuid;
  v_tier_c uuid;
  v_x int;
  v_y int;
  v_row int;
  v_col int;
  v_stand_idx int := 1;
BEGIN
  SELECT id INTO v_event_id FROM public.events WHERE activo = true LIMIT 1;
  SELECT id INTO v_tier_a FROM public.tiers WHERE nombre = 'Tier A' LIMIT 1;
  SELECT id INTO v_tier_b FROM public.tiers WHERE nombre = 'Tier B' LIMIT 1;
  SELECT id INTO v_tier_c FROM public.tiers WHERE nombre = 'Tier C' LIMIT 1;

  -- Generar cuadrícula de stands (similar al prototype.html)
  FOR v_row IN 0..4 LOOP
    FOR v_col IN 0..11 LOOP
      v_x := 20 + (v_col * 56);
      v_y := 40 + (v_row * 64);
      
      INSERT INTO public.stands (event_id, tier_id, nombre, svg_id, status)
      VALUES (
        v_event_id,
        CASE 
          WHEN v_row = 0 OR v_col = 0 OR v_col = 11 THEN v_tier_a
          WHEN v_row = 2 THEN v_tier_b
          ELSE v_tier_c
        END,
        'Stand ' || v_stand_idx,
        'stand-' || v_stand_idx,
        'available'
      );
      
      v_stand_idx := v_stand_idx + 1;
    END LOOP;
  END LOOP;
END $$;
