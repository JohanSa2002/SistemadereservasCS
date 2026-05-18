-- Fija los precios correctos: Categoría A = $15, Categoría B = $11
UPDATE public.tiers SET precio = 15 WHERE nombre = 'Categoría A';
UPDATE public.tiers SET precio = 11 WHERE nombre = 'Categoría B';
