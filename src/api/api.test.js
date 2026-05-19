import { vi, describe, it, expect, beforeEach } from 'vitest';

// El mock debe declararse antes de los imports que lo usan (Vitest lo hoist automáticamente)
vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    rpc: vi.fn(),
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

import { supabase } from './supabaseClient';
import {
  signIn,
  signOut,
  clearLocalSession,
  getSession,
  onAuthStateChange,
  getActiveEvent,
  getAllEvents,
  getTiers,
  updateTierPrice,
  updateStandTier,
  updateStandNombre,
  getStandsWithTiers,
  releaseStand,
  createReservation,
  confirmReservation,
  rejectReservation,
  manualReservation,
  startNewCycle,
  deleteEvent,
  getReservationsForExport,
  saveExportRecord,
  getExportHistory,
  deleteExportRecord,
} from './api.js';

// ─── Helper: crea un mock de cadena de Supabase ───────────────
// Los métodos intermedios devuelven el mismo chain (thenable).
// single() y upsert() resuelven directamente a result.
function q(result) {
  const chain = {
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  ['select', 'eq', 'neq', 'order', 'in', 'limit', 'delete', 'update'].forEach(m => {
    chain[m] = vi.fn(() => chain);
  });
  chain.single  = vi.fn().mockResolvedValue(result);
  chain.upsert  = vi.fn().mockResolvedValue(result);
  chain.insert  = vi.fn().mockResolvedValue(result);
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── AUTH ─────────────────────────────────────────────────────

describe('signIn', () => {
  it('retorna data cuando las credenciales son correctas', async () => {
    const mockData = { user: { id: 'u1' }, session: { token: 'abc' } };
    supabase.auth.signInWithPassword.mockResolvedValue({ data: mockData, error: null });

    const result = await signIn('admin@test.com', 'pass123');

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'admin@test.com', password: 'pass123' });
    expect(result).toEqual(mockData);
  });

  it('lanza el mensaje de error de Supabase cuando falla', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ data: null, error: { message: 'Invalid login credentials' } });
    await expect(signIn('wrong@test.com', 'bad')).rejects.toThrow('Invalid login credentials');
  });
});

describe('signOut', () => {
  it('llama a supabase.auth.signOut sin parámetros', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: null });
    await signOut();
    expect(supabase.auth.signOut).toHaveBeenCalledWith();
  });

  it('lanza error si falla el cierre de sesión', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: { message: 'Network error' } });
    await expect(signOut()).rejects.toThrow('Network error');
  });
});

describe('clearLocalSession', () => {
  it('llama a supabase.auth.signOut con scope: local', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: null });
    await clearLocalSession();
    expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });
});

describe('getSession', () => {
  it('retorna los datos de sesión', async () => {
    const mockData = { session: { user: { id: 'u1' } } };
    supabase.auth.getSession.mockResolvedValue({ data: mockData });
    const result = await getSession();
    expect(result).toEqual(mockData);
  });
});

describe('onAuthStateChange', () => {
  it('registra el callback y retorna el objeto subscription', () => {
    const cb = vi.fn();
    const mockSub = { unsubscribe: vi.fn() };
    supabase.auth.onAuthStateChange.mockReturnValue({ data: mockSub });
    const result = onAuthStateChange(cb);
    expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(cb);
    expect(result).toEqual(mockSub);
  });
});

// ─── EVENTS ───────────────────────────────────────────────────

describe('getActiveEvent', () => {
  it('llama a deactivate_expired_events antes de consultar eventos', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: null });
    const mockEvent = { id: 'e1', nombre: 'Expo', activo: true };
    supabase.from.mockReturnValue(q({ data: mockEvent, error: null }));

    await getActiveEvent();

    expect(supabase.rpc).toHaveBeenCalledWith('deactivate_expired_events');
  });

  it('retorna el evento activo', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: null });
    const mockEvent = { id: 'e1', nombre: 'Expo', activo: true };
    supabase.from.mockReturnValue(q({ data: mockEvent, error: null }));

    const result = await getActiveEvent();

    expect(result).toEqual(mockEvent);
    expect(supabase.from).toHaveBeenCalledWith('events');
  });

  it('lanza error si no hay evento activo', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: null });
    supabase.from.mockReturnValue(q({ data: null, error: { message: 'No rows returned' } }));

    await expect(getActiveEvent()).rejects.toThrow('No rows returned');
  });
});

describe('getAllEvents', () => {
  it('retorna la lista de eventos', async () => {
    const events = [{ id: 'e1' }, { id: 'e2' }];
    supabase.from.mockReturnValue(q({ data: events, error: null }));

    const result = await getAllEvents();

    expect(result).toEqual(events);
    expect(supabase.from).toHaveBeenCalledWith('events');
  });

  it('lanza error si la consulta falla', async () => {
    supabase.from.mockReturnValue(q({ data: null, error: { message: 'DB error' } }));
    await expect(getAllEvents()).rejects.toThrow('DB error');
  });
});

// ─── TIERS ────────────────────────────────────────────────────

describe('getTiers', () => {
  it('retorna los tiers ordenados', async () => {
    const tiers = [{ id: 't1', precio: 500 }, { id: 't2', precio: 300 }];
    supabase.from.mockReturnValue(q({ data: tiers, error: null }));

    const result = await getTiers();

    expect(result).toEqual(tiers);
    expect(supabase.from).toHaveBeenCalledWith('tiers');
  });
});

describe('updateTierPrice', () => {
  it('llama al RPC con los parámetros correctos', async () => {
    supabase.rpc.mockResolvedValue({ data: { ok: true }, error: null });

    await updateTierPrice('tier-1', 450);

    expect(supabase.rpc).toHaveBeenCalledWith('update_tier_price', {
      p_tier_id: 'tier-1',
      p_precio:  450,
    });
  });

  it('lanza error de negocio cuando el RPC retorna { error: "..." }', async () => {
    supabase.rpc.mockResolvedValue({ data: { error: 'Precio inválido' }, error: null });
    await expect(updateTierPrice('tier-1', -1)).rejects.toThrow('Precio inválido');
  });
});

describe('updateStandTier', () => {
  it('actualiza el tier del stand correctamente', async () => {
    supabase.from.mockReturnValue(q({ error: null }));
    await updateStandTier('stand-1', 'tier-2');
    expect(supabase.from).toHaveBeenCalledWith('stands');
  });

  it('lanza error si la actualización falla', async () => {
    supabase.from.mockReturnValue(q({ error: { message: 'Stand no encontrado' } }));
    await expect(updateStandTier('bad-id', 'tier-1')).rejects.toThrow('Stand no encontrado');
  });
});

describe('updateStandNombre', () => {
  it('actualiza el nombre del stand', async () => {
    supabase.from.mockReturnValue(q({ error: null }));
    await updateStandNombre('stand-1', 'A 99');
    expect(supabase.from).toHaveBeenCalledWith('stands');
  });
});

// ─── STANDS ───────────────────────────────────────────────────

describe('getStandsWithTiers', () => {
  it('retorna los stands con datos de tier', async () => {
    const stands = [{ id: 's1', nombre: 'Stand A 1', tiers: { nombre: 'Tier A', precio: 500 } }];
    supabase.from.mockReturnValue(q({ data: stands, error: null }));

    const result = await getStandsWithTiers('event-1');

    expect(result).toEqual(stands);
    expect(supabase.from).toHaveBeenCalledWith('stands');
  });

  it('lanza error si la consulta falla', async () => {
    supabase.from.mockReturnValue(q({ data: null, error: { message: 'Error de red' } }));
    await expect(getStandsWithTiers('event-1')).rejects.toThrow('Error de red');
  });
});

describe('releaseStand', () => {
  it('llama al RPC release_stand con el stand_id correcto', async () => {
    supabase.rpc.mockResolvedValue({ data: { ok: true }, error: null });

    await releaseStand('stand-1');

    expect(supabase.rpc).toHaveBeenCalledWith('release_stand', { p_stand_id: 'stand-1' });
  });

  it('lanza error de negocio si el RPC retorna { error: "..." }', async () => {
    supabase.rpc.mockResolvedValue({ data: { error: 'Stand no encontrado' }, error: null });
    await expect(releaseStand('stand-x')).rejects.toThrow('Stand no encontrado');
  });
});

// ─── RESERVATIONS — Flujo público ─────────────────────────────

describe('createReservation', () => {
  const payload = {
    stand_id: 's1', nombre: 'Ana', cedula: '8-1-1',
    celular: '6000', correo: 'ana@test.com',
  };

  it('llama al RPC create_reservation con los parámetros mapeados', async () => {
    supabase.rpc.mockResolvedValue({ data: { ok: true, reservation_id: 'r1' }, error: null });

    await createReservation(payload);

    expect(supabase.rpc).toHaveBeenCalledWith('create_reservation', {
      p_stand_id:    's1',
      p_nombre:      'Ana',
      p_cedula:      '8-1-1',
      p_celular:     '6000',
      p_correo:      'ana@test.com',
      p_metodo_pago: 'efectivo',
      p_pago_tipo:   'completo',
      p_pago_monto:  null,
    });
  });

  it('retorna el resultado exitoso', async () => {
    const success = { ok: true, reservation_id: 'r1' };
    supabase.rpc.mockResolvedValue({ data: success, error: null });
    const result = await createReservation(payload);
    expect(result).toEqual(success);
  });

  it('lanza error si el stand ya no está disponible (error de negocio)', async () => {
    supabase.rpc.mockResolvedValue({ data: { error: 'Stand no disponible' }, error: null });
    await expect(createReservation(payload)).rejects.toThrow('Stand no disponible');
  });

  it('lanza error si la cédula ya tiene reserva en el evento', async () => {
    supabase.rpc.mockResolvedValue({ data: { error: 'Cédula ya registrada en este evento' }, error: null });
    await expect(createReservation(payload)).rejects.toThrow('Cédula ya registrada');
  });

  it('permite metodo_pago y pago_tipo personalizados', async () => {
    supabase.rpc.mockResolvedValue({ data: { ok: true, reservation_id: 'r2' }, error: null });

    await createReservation({ ...payload, metodo_pago: 'transferencia', pago_tipo: 'abono', pago_monto: 200 });

    expect(supabase.rpc).toHaveBeenCalledWith('create_reservation', expect.objectContaining({
      p_metodo_pago: 'transferencia',
      p_pago_tipo:   'abono',
      p_pago_monto:  200,
    }));
  });
});

// ─── RESERVATIONS — Flujo admin ───────────────────────────────

describe('confirmReservation', () => {
  it('llama al RPC confirm_reservation con el ID de reserva', async () => {
    supabase.rpc.mockResolvedValue({ data: { ok: true }, error: null });

    await confirmReservation('res-1');

    expect(supabase.rpc).toHaveBeenCalledWith('confirm_reservation', { p_reservation_id: 'res-1' });
  });

  it('lanza error de Supabase si la llamada falla', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: 'Reserva no encontrada' } });
    await expect(confirmReservation('bad-id')).rejects.toThrow('Reserva no encontrada');
  });
});

describe('rejectReservation', () => {
  it('llama al RPC reject_reservation con el ID de reserva', async () => {
    supabase.rpc.mockResolvedValue({ data: { ok: true }, error: null });

    await rejectReservation('res-1');

    expect(supabase.rpc).toHaveBeenCalledWith('reject_reservation', { p_reservation_id: 'res-1' });
  });
});

describe('manualReservation', () => {
  const payload = {
    stand_id: 's1', nombre: 'Carlos', cedula: '8-2-2',
    celular: '6222', correo: 'carlos@test.com',
  };

  it('llama al RPC manual_reservation con los parámetros correctos', async () => {
    supabase.rpc.mockResolvedValue({ data: { ok: true, reservation_id: 'r2' }, error: null });

    await manualReservation(payload);

    expect(supabase.rpc).toHaveBeenCalledWith('manual_reservation', expect.objectContaining({
      p_stand_id: 's1',
      p_nombre:   'Carlos',
    }));
  });

  it('lanza error de negocio si el RPC retorna { error: "..." }', async () => {
    supabase.rpc.mockResolvedValue({ data: { error: 'Error en reserva manual' }, error: null });
    await expect(manualReservation(payload)).rejects.toThrow('Error en reserva manual');
  });
});

// ─── CICLOS ───────────────────────────────────────────────────

describe('startNewCycle', () => {
  it('llama al RPC start_new_cycle con nombre, fecha y hora_expiracion', async () => {
    const mockResult = { ok: true, event_id: 'e2', nombre: 'Expo Julio', fecha: '2026-07-31' };
    supabase.rpc.mockResolvedValue({ data: mockResult, error: null });

    const result = await startNewCycle('Expo Julio', '2026-07-31', '23:59:00');

    expect(supabase.rpc).toHaveBeenCalledWith('start_new_cycle', {
      p_nombre:          'Expo Julio',
      p_fecha:           '2026-07-31',
      p_hora_expiracion: '23:59:00',
    });
    expect(result).toEqual(mockResult);
  });

  it('usa "23:59:00" como hora_expiracion por defecto', async () => {
    supabase.rpc.mockResolvedValue({ data: { ok: true }, error: null });

    await startNewCycle('Expo Agosto', '2026-08-31');

    expect(supabase.rpc).toHaveBeenCalledWith('start_new_cycle', expect.objectContaining({
      p_hora_expiracion: '23:59:00',
    }));
  });

  it('lanza error de negocio si el ciclo falla', async () => {
    supabase.rpc.mockResolvedValue({ data: { error: 'Ya existe un evento activo' }, error: null });
    await expect(startNewCycle('Expo X', '2026-09-30')).rejects.toThrow('Ya existe un evento activo');
  });
});

describe('deleteEvent', () => {
  it('llama al RPC delete_event con el eventId', async () => {
    supabase.rpc.mockResolvedValue({ data: { ok: true }, error: null });

    await deleteEvent('event-1');

    expect(supabase.rpc).toHaveBeenCalledWith('delete_event', { p_event_id: 'event-1' });
  });

  it('lanza error si el RPC falla', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: { message: 'Evento no encontrado' } });
    await expect(deleteEvent('bad-id')).rejects.toThrow('Evento no encontrado');
  });
});

// ─── EXPORTACIÓN PDF ──────────────────────────────────────────

describe('getReservationsForExport', () => {
  it('retorna array vacío si el evento no tiene stands', async () => {
    supabase.from.mockReturnValue(q({ data: [], error: null }));

    const result = await getReservationsForExport('event-1');

    expect(result).toEqual([]);
  });

  it('retorna las reservas del evento sin filtro', async () => {
    const mockReservations = [{ id: 'r1' }, { id: 'r2' }];
    supabase.from.mockImplementation((table) => {
      if (table === 'stands')       return q({ data: [{ id: 's1' }], error: null });
      if (table === 'reservations') return q({ data: mockReservations, error: null });
      return q({ data: null, error: null });
    });

    const result = await getReservationsForExport('event-1');

    expect(result).toEqual(mockReservations);
  });

  it('aplica filtro de status cuando se proporciona', async () => {
    const mockReservations = [{ id: 'r1', status: 'confirmed' }];
    const reservationChain = q({ data: mockReservations, error: null });
    supabase.from.mockImplementation((table) => {
      if (table === 'stands')       return q({ data: [{ id: 's1' }], error: null });
      if (table === 'reservations') return reservationChain;
      return q({ data: null, error: null });
    });

    await getReservationsForExport('event-1', 'confirmed');

    // Verifica que .eq('status', 'confirmed') fue llamado
    expect(reservationChain.eq).toHaveBeenCalledWith('status', 'confirmed');
  });

  it('lanza error si falla la consulta de stands', async () => {
    supabase.from.mockReturnValue(q({ data: null, error: { message: 'Error de stands' } }));
    await expect(getReservationsForExport('event-1')).rejects.toThrow('Error de stands');
  });
});

describe('getExportHistory', () => {
  it('retorna el historial de exportaciones', async () => {
    const history = [{ id: 'ex1' }, { id: 'ex2' }];
    supabase.from.mockReturnValue(q({ data: history, error: null }));

    const result = await getExportHistory();

    expect(result).toEqual(history);
    expect(supabase.from).toHaveBeenCalledWith('pdf_exports');
  });

  it('respeta el límite por defecto de 50', async () => {
    const chain = q({ data: [], error: null });
    supabase.from.mockReturnValue(chain);

    await getExportHistory();

    expect(chain.limit).toHaveBeenCalledWith(50);
  });

  it('respeta un límite personalizado', async () => {
    const chain = q({ data: [], error: null });
    supabase.from.mockReturnValue(chain);

    await getExportHistory(10);

    expect(chain.limit).toHaveBeenCalledWith(10);
  });
});

describe('saveExportRecord', () => {
  it('guarda el registro con los datos correctos', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'admin-1' } } },
    });
    const chain = q({ error: null });
    supabase.from.mockReturnValue(chain);

    await saveExportRecord({
      event_id: 'event-1',
      event_nombre: 'Expo Junio',
      reservation_count: 10,
      confirmed_count: 8,
      revenue: 4000,
    });

    expect(supabase.from).toHaveBeenCalledWith('pdf_exports');
    expect(chain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        event_id:          'event-1',
        event_nombre:      'Expo Junio',
        reservation_count: 10,
        confirmed_count:   8,
        revenue:           4000,
        generated_by:      'admin-1',
      }),
      { onConflict: 'event_id' }
    );
  });

  it('usa null como generated_by cuando no hay sesión activa', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    const chain = q({ error: null });
    supabase.from.mockReturnValue(chain);

    await saveExportRecord({
      event_id: 'event-1', event_nombre: 'Expo',
      reservation_count: 0, confirmed_count: 0, revenue: 0,
    });

    expect(chain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ generated_by: null }),
      expect.any(Object)
    );
  });
});

describe('deleteExportRecord', () => {
  it('elimina el registro por ID', async () => {
    supabase.from.mockReturnValue(q({ error: null }));

    await deleteExportRecord('export-1');

    expect(supabase.from).toHaveBeenCalledWith('pdf_exports');
  });

  it('lanza error si la eliminación falla', async () => {
    supabase.from.mockReturnValue(q({ error: { message: 'Registro no encontrado' } }));
    await expect(deleteExportRecord('bad-id')).rejects.toThrow('Registro no encontrado');
  });
});
