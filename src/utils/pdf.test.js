import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildPrintHTML, openPrintWindow } from './pdf.js';

const mockEvent = { nombre: 'Expo Emprende — Junio 2026' };

const mockStands = [
  { nombre: 'Stand A 1', x: 10,  y: 10, w: 80, h: 60, status: 'available' },
  { nombre: 'Stand A 2', x: 100, y: 10, w: 80, h: 60, status: 'pending'   },
  { nombre: 'Stand B 1', x: 200, y: 10, w: 60, h: 60, status: 'reserved'  },
];

const reservationBase = {
  nombre: 'Juan Pérez',
  cedula: '8-123-456',
  celular: '6000-0000',
  correo: 'juan@test.com',
  status: 'confirmed',
  pago_tipo: 'completo',
  pago_monto: null,
  created_at: '2026-06-01T12:00:00Z',
  stands: {
    nombre: 'Stand A 1',
    tiers: { nombre: 'Tier A', precio: 500, color: '#EF4444' },
  },
};

const reservationAbono = {
  nombre: 'María López',
  cedula: '4-567-890',
  celular: '6111-1111',
  correo: 'maria@test.com',
  status: 'pending',
  pago_tipo: 'abono',
  pago_monto: 100,
  created_at: '2026-06-02T10:00:00Z',
  stands: {
    nombre: 'Stand B 1',
    tiers: { nombre: 'Tier B', precio: 300, color: '#3B82F6' },
  },
};

// ─── buildPrintHTML ────────────────────────────────────────────

describe('buildPrintHTML — estructura base', () => {
  it('devuelve un string HTML válido', () => {
    const html = buildPrintHTML(mockEvent, []);
    expect(typeof html).toBe('string');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
  });

  it('incluye el nombre del evento en el título y el cuerpo', () => {
    const html = buildPrintHTML(mockEvent, []);
    expect(html).toContain('Expo Emprende — Junio 2026');
  });

  it('incluye la marca Chiriquí Storage', () => {
    const html = buildPrintHTML(mockEvent, []);
    expect(html).toContain('Chiriquí Storage');
  });

  it('muestra "Evento" cuando el evento es null', () => {
    const html = buildPrintHTML(null, []);
    expect(html).toContain('Evento');
  });

  it('incluye la fecha/hora de generación', () => {
    const html = buildPrintHTML(mockEvent, []);
    expect(html).toContain('Generado');
  });
});

describe('buildPrintHTML — contador de reservas', () => {
  it('muestra singular cuando hay 1 reserva', () => {
    const html = buildPrintHTML(mockEvent, [reservationBase]);
    expect(html).toContain('1 reserva en el reporte');
  });

  it('muestra plural cuando hay varias reservas', () => {
    const html = buildPrintHTML(mockEvent, [reservationBase, reservationAbono]);
    expect(html).toContain('2 reservas en el reporte');
  });

  it('muestra 0 reservas con array vacío', () => {
    const html = buildPrintHTML(mockEvent, []);
    expect(html).toContain('0 reservas');
  });
});

describe('buildPrintHTML — agrupación por tier', () => {
  it('agrupa reservas de distintos tiers en secciones separadas', () => {
    const html = buildPrintHTML(mockEvent, [reservationBase, reservationAbono]);
    expect(html).toContain('Tier A');
    expect(html).toContain('Tier B');
  });

  it('muestra "Sin categoría" cuando el tier es null', () => {
    const sinTier = { ...reservationBase, stands: { nombre: 'Stand X', tiers: null } };
    const html = buildPrintHTML(mockEvent, [sinTier]);
    expect(html).toContain('Sin categoría');
  });

  it('incluye el precio del tier en el encabezado de sección', () => {
    const html = buildPrintHTML(mockEvent, [reservationBase]);
    expect(html).toContain('500');
  });

  it('muestra conteo de reservas por tier', () => {
    const html = buildPrintHTML(mockEvent, [reservationBase]);
    expect(html).toContain('1 reserva');
  });

  it('ordena tiers de mayor a menor precio (Tier A antes que Tier B)', () => {
    const html = buildPrintHTML(mockEvent, [reservationBase, reservationAbono]);
    const idxA = html.indexOf('Tier A');
    const idxB = html.indexOf('Tier B');
    expect(idxA).toBeLessThan(idxB);
  });
});

describe('buildPrintHTML — datos de reservas en tabla', () => {
  it('muestra el nombre del cliente', () => {
    const html = buildPrintHTML(mockEvent, [reservationBase]);
    expect(html).toContain('Juan Pérez');
  });

  it('muestra la cédula', () => {
    const html = buildPrintHTML(mockEvent, [reservationBase]);
    expect(html).toContain('8-123-456');
  });

  it('muestra el celular', () => {
    const html = buildPrintHTML(mockEvent, [reservationBase]);
    expect(html).toContain('6000-0000');
  });

  it('muestra el correo', () => {
    const html = buildPrintHTML(mockEvent, [reservationBase]);
    expect(html).toContain('juan@test.com');
  });

  it('muestra el nombre del stand', () => {
    const html = buildPrintHTML(mockEvent, [reservationBase]);
    expect(html).toContain('Stand A 1');
  });
});

describe('buildPrintHTML — estados de pago', () => {
  it('muestra "Pagado" para pago_tipo completo', () => {
    const html = buildPrintHTML(mockEvent, [reservationBase]);
    expect(html).toContain('Pagado');
  });

  it('muestra "Abono" con el monto para pago por abono', () => {
    const html = buildPrintHTML(mockEvent, [reservationAbono]);
    expect(html).toContain('Abono $100');
  });

  it('muestra "Debe" con el saldo pendiente cuando hay abono parcial', () => {
    // pago_monto=100, precio=300 → debe 200
    const html = buildPrintHTML(mockEvent, [reservationAbono]);
    expect(html).toContain('Debe: $200');
  });

  it('no muestra "Debe" cuando el pago es completo', () => {
    const html = buildPrintHTML(mockEvent, [reservationBase]);
    expect(html).not.toContain('Debe:');
  });
});

describe('buildPrintHTML — badges de estado de reserva', () => {
  it('muestra "Confirmado" para status confirmed', () => {
    const html = buildPrintHTML(mockEvent, [reservationBase]);
    expect(html).toContain('Confirmado');
  });

  it('muestra "Por confirmar" para status pending', () => {
    const html = buildPrintHTML(mockEvent, [reservationAbono]);
    expect(html).toContain('Por confirmar');
  });

  it('muestra "Rechazado" para status rejected', () => {
    const rejected = { ...reservationBase, status: 'rejected' };
    const html = buildPrintHTML(mockEvent, [rejected]);
    expect(html).toContain('Rechazado');
  });
});

// ─── Sección del mapa ──────────────────────────────────────────

describe('buildPrintHTML — sección del mapa', () => {
  it('NO incluye el mapa cuando stands está vacío', () => {
    const html = buildPrintHTML(mockEvent, [], []);
    expect(html).not.toContain('Estado Final del Mapa de Stands');
  });

  it('incluye el mapa cuando se pasan stands', () => {
    const html = buildPrintHTML(mockEvent, [], mockStands);
    expect(html).toContain('Estado Final del Mapa de Stands');
  });

  it('incluye un SVG en la sección del mapa', () => {
    const html = buildPrintHTML(mockEvent, [], mockStands);
    expect(html).toContain('<svg');
    expect(html).toContain('</svg>');
  });

  it('muestra contadores correctos: 1 disponible, 1 pendiente, 1 reservado, 3 total', () => {
    const html = buildPrintHTML(mockEvent, [], mockStands);
    expect(html).toContain('Disponibles');
    expect(html).toContain('Por confirmar');
    expect(html).toContain('Reservados');
    expect(html).toContain('Total stands');
  });

  it('las etiquetas de stands en el SVG NO incluyen el prefijo "Stand "', () => {
    const html = buildPrintHTML(mockEvent, [], mockStands);
    // El SVG debe mostrar "A 1" y "A 2", no "Stand A 1"
    expect(html).toContain('>A 1<');
    expect(html).toContain('>A 2<');
    expect(html).toContain('>B 1<');
  });

  it('los stands disponibles usan el color verde en el SVG', () => {
    const stands = [{ nombre: 'Stand A 1', x: 10, y: 10, w: 80, h: 60, status: 'available' }];
    const html = buildPrintHTML(mockEvent, [], stands);
    expect(html).toContain('#16A34A'); // color verde de available
  });

  it('los stands reservados usan el color rojo en el SVG', () => {
    const stands = [{ nombre: 'Stand B 1', x: 10, y: 10, w: 80, h: 60, status: 'reserved' }];
    const html = buildPrintHTML(mockEvent, [], stands);
    expect(html).toContain('#DC2626'); // color rojo de reserved
  });

  it('incluye la leyenda del mapa', () => {
    const html = buildPrintHTML(mockEvent, [], mockStands);
    expect(html).toContain('Disponible');
    expect(html).toContain('map-legend');
  });
});

// ─── openPrintWindow ──────────────────────────────────────────

describe('openPrintWindow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('abre una ventana nueva con el HTML generado', () => {
    const mockWin = {
      document: { open: vi.fn(), write: vi.fn(), close: vi.fn() },
    };
    vi.spyOn(window, 'open').mockReturnValue(mockWin);

    openPrintWindow(mockEvent, []);

    expect(window.open).toHaveBeenCalledWith('', '_blank', expect.any(String));
    expect(mockWin.document.open).toHaveBeenCalled();
    expect(mockWin.document.write).toHaveBeenCalledWith(expect.stringContaining('<!DOCTYPE html>'));
    expect(mockWin.document.close).toHaveBeenCalled();
  });

  it('muestra alerta cuando el popup está bloqueado (window.open devuelve null)', () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    openPrintWindow(mockEvent, []);

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('ventanas emergentes'));
  });

  it('pasa los stands al HTML generado', () => {
    const mockWin = {
      document: { open: vi.fn(), write: vi.fn(), close: vi.fn() },
    };
    vi.spyOn(window, 'open').mockReturnValue(mockWin);

    openPrintWindow(mockEvent, [], mockStands);

    const writtenHtml = mockWin.document.write.mock.calls[0][0];
    expect(writtenHtml).toContain('Estado Final del Mapa de Stands');
  });
});
