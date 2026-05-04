// ============================================================
// edge-functions/create-reservation/index.ts
//
// HTTP POST /functions/v1/create-reservation
// Body: { stand_id, nombre, cedula, celular, correo }
//
// Alternativa HTTP a supabase.rpc('create_reservation').
// Útil si necesitas webhooks, validaciones extra o rate limiting.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Pre-flight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Método no permitido' }, 405);
  }

  // ── Parsear body ──────────────────────────────────────────
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Body inválido: se esperaba JSON' }, 400);
  }

  const { stand_id, nombre, cedula, celular, correo } = body;

  // ── Validar campos requeridos ─────────────────────────────
  const faltantes = (['stand_id', 'nombre', 'cedula', 'celular', 'correo'] as const)
    .filter((k) => !body[k]?.trim());

  if (faltantes.length > 0) {
    return json(
      { error: `Campos requeridos faltantes: ${faltantes.join(', ')}` },
      400
    );
  }

  // ── Validaciones básicas de formato ──────────────────────
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    return json({ error: 'El formato del correo electrónico no es válido' }, 400);
  }

  // ── Cliente Supabase con service role (bypasa RLS) ───────
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // ── Llamar la función SQL que maneja el lock de concurrencia
  const { data, error } = await supabase.rpc('create_reservation', {
    p_stand_id: stand_id,
    p_nombre:   nombre.trim(),
    p_cedula:   cedula.trim(),
    p_celular:  celular.trim(),
    p_correo:   correo.trim().toLowerCase(),
  });

  if (error) {
    console.error('[create-reservation] rpc error:', error.message);
    return json({ error: 'Error interno del servidor' }, 500);
  }

  if (data?.error) {
    // Errores de negocio (stand no disponible, cédula duplicada, etc.)
    const isConflict = data.error.includes('disponible') || data.error.includes('cédula');
    return json({ error: data.error }, isConflict ? 409 : 400);
  }

  return json(data, 200);
});
