-- seed.sql — Coordenadas exactas del SVG (canvas 900×660)
INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,is_super_admin,confirmation_token,recovery_token,email_change_token_new,email_change,phone,phone_change,phone_change_token,email_change_token_current,reauthentication_token)
VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','chiriquistorageadmin@gmail.com',crypt('chiriquistorage2026.',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),false,'','','','','','','','','')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.events (nombre, fecha, activo)
VALUES ('Expo Emprende Local', CURRENT_DATE + INTERVAL '30 days', true);

DO $$
DECLARE
  v_event_id uuid;
  v_tier_a uuid;
  v_tier_b uuid;
BEGIN
  SELECT id INTO v_event_id FROM public.events WHERE activo = true LIMIT 1;
  SELECT id INTO v_tier_a FROM public.tiers WHERE nombre = 'Categoría A' LIMIT 1;
  SELECT id INTO v_tier_b FROM public.tiers WHERE nombre = 'Categoría B' LIMIT 1;
  
  -- LEFT COLUMN (8 arriba → 1 abajo)
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 8', 'stand-8',  8, 30, 80,72,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 7', 'stand-7',  8,108, 80,72,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 6', 'stand-6',  8,186, 80,72,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 5', 'stand-5',  8,264, 80,72,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 4', 'stand-4',  8,342, 80,72,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 3', 'stand-3',  8,420, 80,72,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 2', 'stand-2',  8,498, 80,72,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 1', 'stand-1',  8,576, 80,72,'available',now());

  -- FLOATING TOP (58-61) — centrados entre columna 20 (x=345) y columna 50 (x+w=614)
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 61','stand-61',364, 6,44,24,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 60','stand-60',424, 6,44,24,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 59','stand-59',484, 6,44,24,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 58','stand-58',544, 6,44,24,'available',now());

  -- SHELVES 9-13 (centrados sobre la fila 14-19, que va de x=100 a x=334, center=217)
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 9', 'stand-9', 120,44,34,44,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 10','stand-10',160,44,34,44,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 11','stand-11',200,44,34,44,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 12','stand-12',240,44,34,44,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 13','stand-13',280,44,34,44,'available',now());

  -- SHELVES 14-19
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 19','stand-19',100,128,34,44,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 18','stand-18',140,128,34,44,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 17','stand-17',180,128,34,44,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 16','stand-16',220,128,34,44,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 15','stand-15',260,128,34,44,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 14','stand-14',300,128,34,44,'available',now());

  -- COLUMNAS SUPERIORES (20-52) - Row 1 (y=44), Row 2 (y=82), Row 3 (y=120). h=34
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 20','stand-20',345, 44,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 21','stand-21',345, 82,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 22','stand-22',345,120,34,34,'available',now());

  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 27','stand-27',392, 44,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 28','stand-28',392, 82,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 29','stand-29',392,120,34,34,'available',now());

  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 33','stand-33',439, 44,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 34','stand-34',439, 82,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 35','stand-35',439,120,34,34,'available',now());

  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 39','stand-39',486, 44,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 40','stand-40',486, 82,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 41','stand-41',486,120,34,34,'available',now());

  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 45','stand-45',533, 44,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 46','stand-46',533, 82,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 47','stand-47',533,120,34,34,'available',now());

  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 50','stand-50',580, 44,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 51','stand-51',580, 82,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 52','stand-52',580,120,34,34,'available',now());

  -- Stand 57 y 56 (zona bodega)
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 57','stand-57',627, 82,34,72,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 56','stand-56',627,184,34,72,'available',now());

  -- BODEGAS: no son stands reservables, se renderizan estáticamente en el mapa
  -- Solo queda Stand 56, 57 y 62 como stands reales en esa zona
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 62', 'stand-62', 668,252, 70,52,'available',now());

  -- COLUMNAS INFERIORES (23-55) - Row 4 (y=184), Row 5 (y=222), Row 6 (y=260). h=34
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 23','stand-23',345,184,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 24','stand-24',345,222,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 25','stand-25',345,260,34,34,'available',now());

  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 30','stand-30',392,184,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 31','stand-31',392,222,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 32','stand-32',392,260,34,34,'available',now());

  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 36','stand-36',439,184,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 37','stand-37',439,222,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 38','stand-38',439,260,34,34,'available',now());

  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 41b','stand-41b',486,184,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 42', 'stand-42', 486,222,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 43', 'stand-43', 486,260,34,34,'available',now());

  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 47b','stand-47b',533,184,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 48', 'stand-48', 533,222,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 49', 'stand-49', 533,260,34,34,'available',now());

  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 53','stand-53',580,184,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 54','stand-54',580,222,34,34,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 55','stand-55',580,260,34,34,'available',now());

  -- RIGHT COLUMN (63-70)
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 63','stand-63',776,312,116,40,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 64','stand-64',776,356,116,40,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 65','stand-65',776,400,116,40,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 66','stand-66',776,444,116,40,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 67','stand-67',776,488,116,40,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 68','stand-68',776,532,116,38,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 69','stand-69',776,574,116,38,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 70','stand-70',776,616,116,36,'available',now());

  -- ISLANDS 78-89 (alineados con stand 4 en y=342)
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 78','stand-78',225,342,34,40,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 79','stand-79',225,388,34,40,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 80','stand-80',225,434,34,40,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 81','stand-81',285,342,34,40,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 82','stand-82',285,388,34,40,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 83','stand-83',285,434,34,40,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 84','stand-84',345,342,34,40,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 85','stand-85',345,388,34,40,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 86','stand-86',345,434,34,40,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 87','stand-87',405,342,34,40,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 88','stand-88',405,388,34,40,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_b,'B 89','stand-89',405,434,34,40,'available',now());

  -- BOTTOM ROW (77→71) desplazados a la derecha
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 77','stand-77',210,558,65,72,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 76','stand-76',279,558,65,72,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 75','stand-75',348,558,65,72,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 74','stand-74',417,558,65,72,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 73','stand-73',486,558,65,72,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 72','stand-72',555,558,65,72,'available',now());
  INSERT INTO public.stands VALUES (gen_random_uuid(),v_event_id,v_tier_a,'A 71','stand-71',624,558,65,72,'available',now());

END $$;
