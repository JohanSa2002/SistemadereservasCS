import React, { useState, useEffect } from 'react';
import { T } from '../../theme/tokens';
import { CSCard, CSButton } from '../../components/UI';
import { getActiveEvent, getReservationsForExport } from '../../api/api';
import { FileDown, Filter } from 'lucide-react';

const STATUS_LABELS = { pending: 'Por confirmar', confirmed: 'Confirmado', rejected: 'Rechazado' };
const STATUS_COLORS = { pending: T.pending, confirmed: T.available, rejected: T.reserved };

export function Export() {
  const [event, setEvent] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const ev = await getActiveEvent();
        setEvent(ev);
        const data = await getReservationsForExport(ev.id, null);
        setReservations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = filter ? reservations.filter(r => r.status === filter) : reservations;

  function exportCSV() {
    const rows = [
      ['Stand', 'Tier', 'Nombre', 'Cédula', 'Celular', 'Correo', 'Estado', 'Fecha'],
      ...filtered.map(r => [
        r.stands?.nombre ?? '',
        r.stands?.tiers?.nombre ?? '',
        r.nombre, r.cedula, r.celular, r.correo,
        STATUS_LABELS[r.status] ?? r.status,
        new Date(r.created_at).toLocaleDateString('es-PA'),
      ])
    ];
    const csv = rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservas-${event?.nombre ?? 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div style={{ padding: 40 }}>Cargando...</div>;

  return (
    <div style={{ padding: 32 }}>
      <header style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Exportar Reservas</h1>
          <p style={{ color: T.textMuted, marginTop: 4 }}>{event?.nombre}</p>
        </div>
        <CSButton variant="primary" icon={<FileDown size={16} />} onClick={exportCSV} disabled={filtered.length === 0}>
          Descargar CSV
        </CSButton>
      </header>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        <Filter size={16} color={T.textMuted} />
        {[null, 'confirmed', 'pending', 'rejected'].map(s => (
          <button key={String(s)} onClick={() => setFilter(s)} style={{
            padding: '6px 14px', borderRadius: 20, border: `1px solid ${filter === s ? T.accent : T.border}`,
            background: filter === s ? T.accentSoft : 'transparent',
            color: filter === s ? T.accentDark : T.textMuted,
            fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: T.font,
          }}>
            {s === null ? `Todos (${reservations.length})` : `${STATUS_LABELS[s]} (${reservations.filter(r => r.status === s).length})`}
          </button>
        ))}
      </div>

      <CSCard padding={0} style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
              {['Stand', 'Tier', 'Nombre', 'Cédula', 'Celular', 'Correo', 'Estado', 'Fecha'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: T.textMuted }}>No hay reservas</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{r.stands?.nombre}</td>
                <td style={{ padding: '12px 16px', color: T.textMuted }}>{r.stands?.tiers?.nombre}</td>
                <td style={{ padding: '12px 16px' }}>{r.nombre}</td>
                <td style={{ padding: '12px 16px' }}>{r.cedula}</td>
                <td style={{ padding: '12px 16px' }}>{r.celular}</td>
                <td style={{ padding: '12px 16px' }}>{r.correo}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: (STATUS_COLORS[r.status] ?? T.textMuted) + '18',
                    color: STATUS_COLORS[r.status] ?? T.textMuted,
                  }}>
                    {STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: T.textMuted }}>{new Date(r.created_at).toLocaleDateString('es-PA')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CSCard>
    </div>
  );
}
