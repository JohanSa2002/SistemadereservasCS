// ============================================================
// supabaseClient.js
// Instancia única del cliente Supabase para toda la aplicación.
//
// Variables de entorno requeridas (en .env):
//   VITE_SUPABASE_URL      → Project URL de tu proyecto Supabase
//   VITE_SUPABASE_ANON_KEY → anon/public key del proyecto
//
// Si no usas Vite, reemplaza import.meta.env por process.env.
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Faltan variables de entorno: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son requeridas.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
