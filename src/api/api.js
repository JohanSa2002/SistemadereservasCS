// ============================================================
// api.js
// Capa de acceso a datos para el Sistema de Reserva de Stands.
// Todas las funciones retornan datos directamente o lanzan Error
// con mensaje en español.
//
// Uso en React:
//   import { getActiveEvent, createReservation } from './api';
// ============================================================

import { supabase } from './supabaseClient';

// ─────────────────────────────────────────────────────────────
// HELPERS INTERNOS
// ─────────────────────────────────────────────────────────────

function throwIfError(error, fallback) {
  if (error) throw new Error(error.message || fallback || 'Error inesperado');
}

function throwIfRpcError(data) {
  if (data?.error) throw new Error(data.error);
}

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────

/**
 * Inicia sesión de administrador con email y contraseña.
 * @returns {{ user, session }}
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  throwIfError(error, 'Error al iniciar sesión');
  return data;
}

/**
 * Cierra la sesión del administrador actual (global: invalida el token en el servidor).
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  throwIfError(error, 'Error al cerrar sesión');
}

/**
 * Limpia únicamente la sesión local (sin llamada al servidor).
 * Usar solo para limpiar sesiones caducadas al abrir una nueva pestaña.
 */
export async function clearLocalSession() {
  await supabase.auth.signOut({ scope: 'local' });
}

/**
 * Retorna la sesión activa o null si no hay ninguna.
 * @returns {{ session } | { session: null }}
 */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data;
}

/**
 * Suscripción a cambios de sesión (login / logout).
 * @param {function} callback - Recibe (event, session)
 * @returns Objeto con método unsubscribe()
 */
export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return data;
}

// ─────────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────────

/**
 * Obtiene el evento activo actual.
 * @returns {Object} Evento activo
 * @throws Si no hay ningún evento activo
 */
export async function getActiveEvent() {
  // Auto-deactivate any event whose fecha+hora_expiracion has passed
  await supabase.rpc('deactivate_expired_events');

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('activo', true)
    .single();

  throwIfError(error, 'No hay ningún evento activo');
  return data;
}

/**
 * Obtiene todos los eventos ordenados del más reciente al más antiguo.
 */
export async function getAllEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  throwIfError(error, 'Error al obtener eventos');
  return data;
}

// ─────────────────────────────────────────────────────────────
// TIERS
// ─────────────────────────────────────────────────────────────

/**
 * Lista todas las categorías de precio ordenadas de mayor a menor precio.
 * @returns {Array} Lista de tiers
 */
export async function getTiers() {
  const { data, error } = await supabase
    .from('tiers')
    .select('*')
    .order('precio', { ascending: false });

  throwIfError(error, 'Error al obtener categorías');
  return data;
}

/**
 * Actualiza el precio de un tier (solo admin).
 * @param {string} tierId - UUID del tier
 * @param {number} precio - Nuevo precio (debe ser > 0)
 */
export async function updateStandTier(standId, tierId) {
  const { error } = await supabase
    .from('stands')
    .update({ tier_id: tierId })
    .eq('id', standId);
  throwIfError(error, 'Error al actualizar tier del stand');
}

export async function updateStandNombre(standId, nombre) {
  const { error } = await supabase
    .from('stands')
    .update({ nombre })
    .eq('id', standId);
  throwIfError(error, 'Error al actualizar el nombre del stand');
}

export async function updateTierPrice(tierId, precio) {
  const { data, error } = await supabase.rpc('update_tier_price', {
    p_tier_id: tierId,
    p_precio:  precio,
  });

  throwIfError(error, 'Error al actualizar precio');
  throwIfRpcError(data);
  return data;
}

// ─────────────────────────────────────────────────────────────
// STANDS
// ─────────────────────────────────────────────────────────────

/**
 * Obtiene todos los stands de un evento con sus datos de tier.
 * Ideal para renderizar el mapa interactivo.
 *
 * @param {string} eventId - UUID del evento
 * @returns {Array} Stands con { ...stand, tiers: { nombre, color, precio } }
 */
export async function getStandsWithTiers(eventId) {
  const { data, error } = await supabase
    .from('stands')
    .select('*, tiers(id, nombre, color, precio)')
    .eq('event_id', eventId)
    .order('nombre');

  throwIfError(error, 'Error al obtener stands');
  return data;
}

/**
 * Libera un stand y cancela sus reservas pendientes (solo admin).
 * @param {string} standId - UUID del stand
 */
export async function releaseStand(standId) {
  const { data, error } = await supabase.rpc('release_stand', {
    p_stand_id: standId,
  });

  throwIfError(error, 'Error al liberar stand');
  throwIfRpcError(data);
  return data;
}

// ─────────────────────────────────────────────────────────────
// RESERVATIONS — Flujo público
// ─────────────────────────────────────────────────────────────

/**
 * Crea una solicitud de reserva.
 * Internamente adquiere un lock en el stand para evitar reservas
 * simultáneas del mismo espacio.
 *
 * @param {{ stand_id, nombre, cedula, celular, correo }} data
 * @returns {{ ok: true, reservation_id: string }}
 * @throws Si el stand ya no está disponible o la cédula ya tiene reserva
 */
export async function createReservation({ stand_id, nombre, cedula, celular, correo, metodo_pago = 'efectivo', pago_tipo = 'completo', pago_monto = null }) {
  const { data, error } = await supabase.rpc('create_reservation', {
    p_stand_id:    stand_id,
    p_nombre:      nombre,
    p_cedula:      cedula,
    p_celular:     celular,
    p_correo:      correo,
    p_metodo_pago: metodo_pago,
    p_pago_tipo:   pago_tipo,
    p_pago_monto:  pago_monto,
  });

  throwIfError(error, 'Error al crear la reserva');
  throwIfRpcError(data);
  return data;
}

// ─────────────────────────────────────────────────────────────
// RESERVATIONS — Flujo admin
// ─────────────────────────────────────────────────────────────

/**
 * Lista todas las solicitudes pendientes con datos del stand y tier.
 * Solo accesible para admin autenticado.
 * @returns {Array} Reservas pendientes ordenadas por fecha de creación
 */
export async function getPendingReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id, nombre, cedula, celular, correo, metodo_pago, pago_tipo, pago_monto, status, created_at,
      stands ( id, nombre, svg_id,
        tiers ( nombre, color, precio )
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  throwIfError(error, 'Error al obtener solicitudes pendientes');
  return data;
}

/**
 * Confirma una reserva pendiente y marca el stand como reservado.
 * @param {string} reservationId - UUID de la reserva
 */
export async function confirmReservation(reservationId) {
  const { data, error } = await supabase.rpc('confirm_reservation', {
    p_reservation_id: reservationId,
  });

  throwIfError(error, 'Error al confirmar reserva');
  throwIfRpcError(data);
  return data;
}

/**
 * Rechaza una reserva pendiente y libera el stand.
 * @param {string} reservationId - UUID de la reserva
 */
export async function rejectReservation(reservationId) {
  const { data, error } = await supabase.rpc('reject_reservation', {
    p_reservation_id: reservationId,
  });

  throwIfError(error, 'Error al rechazar reserva');
  throwIfRpcError(data);
  return data;
}

/**
 * Crea una reserva confirmada directamente (sin pasar por 'pending').
 * Si el stand tiene una solicitud pendiente, la rechaza automáticamente.
 *
 * @param {{ stand_id, nombre, cedula, celular, correo }} data
 * @returns {{ ok: true, reservation_id: string }}
 */
export async function manualReservation({ stand_id, nombre, cedula, celular, correo, metodo_pago = 'efectivo', pago_tipo = 'completo', pago_monto = null }) {
  const { data, error } = await supabase.rpc('manual_reservation', {
    p_stand_id:    stand_id,
    p_nombre:      nombre,
    p_cedula:      cedula,
    p_celular:     celular,
    p_correo:      correo,
    p_metodo_pago: metodo_pago,
    p_pago_tipo:   pago_tipo,
    p_pago_monto:  pago_monto,
  });

  throwIfError(error, 'Error al crear reserva manual');
  throwIfRpcError(data);
  return data;
}

// ─────────────────────────────────────────────────────────────
// CICLOS MENSUALES
// ─────────────────────────────────────────────────────────────

/**
 * Inicia un nuevo ciclo mensual (solo admin).
 * - Crea un nuevo evento con activo = true
 * - Desactiva el evento anterior
 * - Clona todos sus stands con status 'available'
 *
 * @param {string} nombre - Nombre del nuevo evento, ej: "Expo Emprende — Julio 2026"
 * @param {string} fecha  - Fecha en formato 'YYYY-MM-DD'
 * @returns {{ ok: true, event_id, nombre, fecha }}
 */
export async function startNewCycle(nombre, fecha, hora_expiracion = '23:59:00') {
  const { data, error } = await supabase.rpc('start_new_cycle', {
    p_nombre:          nombre,
    p_fecha:           fecha,
    p_hora_expiracion: hora_expiracion,
  });

  throwIfError(error, 'Error al iniciar nuevo ciclo');
  throwIfRpcError(data);
  return data;
}

/**
 * Elimina un evento y toda su data asociada (stands, reservas, pdf_exports).
 * @param {string} eventId - UUID del evento a eliminar
 */
export async function deleteEvent(eventId) {
  const { data, error } = await supabase.rpc('delete_event', { p_event_id: eventId });
  throwIfError(error, 'Error al eliminar el evento');
  throwIfRpcError(data);
  return data;
}

// ─────────────────────────────────────────────────────────────
// EXPORTACIÓN PDF
// ─────────────────────────────────────────────────────────────

/**
 * Obtiene todas las reservas de un evento para generar el reporte PDF.
 * Incluye datos del stand y tier.
 *
 * @param {string} eventId       - UUID del evento
 * @param {string|null} statusFilter - 'pending' | 'confirmed' | 'rejected' | null (todos)
 * @returns {Array} Reservas con datos completos del stand y tier
 */
export async function getReservationsForExport(eventId, statusFilter = null) {
  // Primero obtenemos los IDs de stands del evento (PostgREST no filtra
  // columnas de tablas relacionadas directamente en el WHERE)
  const { data: stands, error: standsError } = await supabase
    .from('stands')
    .select('id')
    .eq('event_id', eventId);

  throwIfError(standsError, 'Error al obtener stands del evento');

  const standIds = stands.map((s) => s.id);

  if (standIds.length === 0) return [];

  let query = supabase
    .from('reservations')
    .select(`
      id, nombre, cedula, celular, correo, status, pago_tipo, pago_monto, created_at,
      stands ( nombre, svg_id,
        tiers ( nombre, precio, color )
      )
    `)
    .in('stand_id', standIds)
    .order('created_at', { ascending: true });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  throwIfError(error, 'Error al obtener reservas para exportar');
  return data;
}

// ─────────────────────────────────────────────────────────────
// HISTORIAL DE EXPORTACIONES PDF
// ─────────────────────────────────────────────────────────────

/**
 * Guarda un registro de reporte PDF generado.
 *
 * @param {{ event_id, event_nombre, filter_status, reservation_count, confirmed_count, revenue }} record
 */
export async function saveExportRecord({ event_id, event_nombre, event_fecha = null, filter_status = null, reservation_count, confirmed_count, revenue }) {
  const { data: { session } } = await supabase.auth.getSession();

  const { error } = await supabase.from('pdf_exports').upsert(
    {
      event_id,
      event_nombre,
      event_fecha:       event_fecha ?? null,
      filter_status:     filter_status ?? null,
      reservation_count,
      confirmed_count,
      revenue,
      generated_at:  new Date().toISOString(),
      generated_by:  session?.user?.id ?? null,
    },
    { onConflict: 'event_id' }
  );

  throwIfError(error, 'Error al guardar registro de exportación');
}

/**
 * Obtiene el historial de exportaciones PDF, ordenado del más reciente al más antiguo.
 *
 * @param {number} limit - Máximo de registros a devolver (default 50)
 * @returns {Array} Registros de exportación
 */
export async function getExportHistory(limit = 50) {
  const { data, error } = await supabase
    .from('pdf_exports')
    .select('*')
    .order('generated_at', { ascending: false })
    .limit(limit);

  throwIfError(error, 'Error al obtener historial de exportaciones');
  return data;
}

/**
 * Elimina un registro del historial de exportaciones.
 *
 * @param {string} exportId - UUID del registro a eliminar
 */
export async function deleteExportRecord(exportId) {
  const { error } = await supabase
    .from('pdf_exports')
    .delete()
    .eq('id', exportId);

  throwIfError(error, 'Error al eliminar registro de exportación');
}

// ─────────────────────────────────────────────────────────────
// TIEMPO REAL
// ─────────────────────────────────────────────────────────────

/**
 * Suscripción en tiempo real a cambios de status en los stands
 * de un evento. Se dispara en cada UPDATE sin necesidad de recargar.
 *
 * @param {string}   eventId  - UUID del evento a observar
 * @param {function} onUpdate - Callback que recibe el stand actualizado
 * @returns Canal de Supabase — llama a supabase.removeChannel(channel) al desmontar
 */
export function subscribeToStands(eventId, onUpdate) {
  const channelName = `stands-event-${eventId}-${Math.random().toString(36).substr(2, 9)}`;
  return supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event:  'UPDATE',
        schema: 'public',
        table:  'stands',
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => onUpdate(payload.new)
    )
    .subscribe();
}
