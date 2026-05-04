// ============================================================
// edge-functions/start-new-cycle/index.ts
//
// HTTP POST /functions/v1/start-new-cycle
// Headers: Authorization: Bearer <admin_jwt>
// Body: { nombre, fecha }   — fecha en formato 'YYYY-MM-DD'
//
// Crea un nuevo ciclo mensual, desactiva el evento anterior
// y clona los stands con status 'available'.
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Método no permitido' }, 405);
  }

  // ── Verificar JWT del usuario ─────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'Se requiere autenticación' }, 401);
  }

  // Cliente con el JWT del usuario para verificar su identidad
  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

  if (userError || !user) {
    return json({ error: 'Token inválido o expirado' }, 401);
  }

  // ── Verificar que el usuario tiene rol admin ──────────────
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: userData, error: roleError } = await supabaseAdmin
    .from('users')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (roleError || userData?.rol !== 'admin') {
    return json({ error: 'Solo los administradores pueden iniciar nuevos ciclos' }, 403);
  }

  // ── Parsear y validar body ────────────────────────────────
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Body inválido: se esperaba JSON' }, 400);
  }

  const { nombre, fecha } = body;

  if (!nombre?.trim()) {
    return json({ error: 'El campo "nombre" es requerido' }, 400);
  }

  const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!fecha || !fechaRegex.test(fecha)) {
    return json({ error: 'El campo "fecha" debe estar en formato YYYY-MM-DD' }, 400);
  }

  const fechaDate = new Date(fecha);
  if (isNaN(fechaDate.getTime())) {
    return json({ error: 'La fecha proporcionada no es válida' }, 400);
  }

  // ── Ejecutar la lógica en la base de datos ────────────────
  const { data, error } = await supabaseAdmin.rpc('start_new_cycle', {
    p_nombre: nombre.trim(),
    p_fecha:  fecha,
  });

  if (error) {
    console.error('[start-new-cycle] rpc error:', error.message);
    return json({ error: 'Error interno del servidor' }, 500);
  }

  if (data?.error) {
    return json({ error: data.error }, 400);
  }

  return json(data, 200);
});
