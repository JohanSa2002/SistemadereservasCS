import React, { useState, useEffect, useCallback } from 'react';
import { T } from '../../theme/tokens';
import { CSCard, CSButton } from '../../components/UI';
import {
  getActiveEvent,
  getReservationsForExport,
  saveExportRecord,
  getExportHistory,
  deleteExportRecord,
} from '../../api/api';
import { FileDown, FileText, Filter, Clock, Trash2, RefreshCw } from 'lucide-react';

const STATUS_LABELS  = { pending: 'Por confirmar', confirmed: 'Confirmado', rejected: 'Rechazado' };
const STATUS_COLORS  = { pending: T.pending, confirmed: T.available, rejected: T.reserved };
const FILTER_LABELS  = { null: 'Todos', pending: 'Por confirmar', confirmed: 'Confirmados', rejected: 'Rechazados' };

// ─── PDF helpers ─────────────────────────────────────────────

function groupByTier(reservations) {
  const map = {};
  for (const r of reservations) {
    const tierNombre = r.stands?.tiers?.nombre ?? 'Sin categoría';
    const tierPrecio = r.stands?.tiers?.precio ?? 0;
    const tierColor  = r.stands?.tiers?.color  ?? '#6B6862';
    if (!map[tierNombre]) map[tierNombre] = { nombre: tierNombre, precio: tierPrecio, color: tierColor, rows: [] };
    map[tierNombre].rows.push(r);
  }
  return Object.values(map).sort((a, b) => b.precio - a.precio);
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(iso) {
  return new Date(iso).toLocaleString('es-PA', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function fmtCurrency(n) {
  return new Intl.NumberFormat('es-PA', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
}

function buildPrintHTML(event, reservations) {
  const now = fmtDateTime(new Date().toISOString());

  const total  = reservations.length;
  const groups = groupByTier(reservations);

  const statusBadge = (status) => {
    const labels = { pending: 'Por confirmar', confirmed: 'Confirmado', rejected: 'Rechazado' };
    const colors = { pending: '#D97706', confirmed: '#16A34A', rejected: '#DC2626' };
    const bgs    = { pending: '#FDF1E0', confirmed: '#E8F6EC', rejected: '#FCE9E9' };
    return `<span style="
      display:inline-block; padding:2px 8px; border-radius:20px;
      font-size:9px; font-weight:600;
      background:${bgs[status] ?? '#F4F4F2'};
      color:${colors[status] ?? '#6B6862'};
    ">${labels[status] ?? status}</span>`;
  };

  const groupSections = groups.map(g => `
    <div class="tier-section">
      <div class="tier-header">
        <span class="tier-dot" style="background:${g.color}"></span>
        <span class="tier-name">${g.nombre}</span>
        <span class="tier-meta">${fmtCurrency(g.precio)} por stand &middot; ${g.rows.length} reserva${g.rows.length !== 1 ? 's' : ''}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Stand</th>
            <th>Nombre</th>
            <th>Cédula</th>
            <th>Celular</th>
            <th>Correo</th>
            <th>Estado</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          ${g.rows.map(r => `
            <tr>
              <td class="mono">${r.stands?.nombre ?? '—'}</td>
              <td><strong>${r.nombre}</strong></td>
              <td class="mono">${r.cedula}</td>
              <td class="mono">${r.celular}</td>
              <td class="muted">${r.correo}</td>
              <td>${statusBadge(r.status)}</td>
              <td class="muted">${fmtDate(r.created_at)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Reporte de Reservas — ${event?.nombre ?? 'Evento'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    @page { size: letter portrait; margin: 18mm 16mm 20mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 10px; color: #1A1816;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .report-header {
      display: flex; justify-content: space-between; align-items: flex-end;
      border-bottom: 2px solid #1A1816; padding-bottom: 12px; margin-bottom: 18px;
    }
    .logo { font-size: 15px; font-weight: 700; letter-spacing: -0.4px; color: #2563EB; }
    .logo-sub { font-size: 9px; font-weight: 500; color: #6B6862; text-transform: uppercase; letter-spacing: 0.6px; margin-top: 2px; }
    .report-title { font-size: 16px; font-weight: 700; margin-top: 6px; letter-spacing: -0.3px; }
    .report-subtitle { font-size: 10px; color: #6B6862; margin-top: 2px; }
    .report-meta { text-align: right; font-size: 9.5px; color: #6B6862; }
    .report-meta strong { display: block; font-size: 10.5px; font-weight: 600; color: #1A1816; }
    .stats-bar {
      display: flex; border: 1px solid #E7E5E1; border-radius: 8px;
      overflow: hidden; margin-bottom: 20px;
    }
    .stat-cell { flex: 1; padding: 10px 14px; border-right: 1px solid #E7E5E1; }
    .stat-cell:last-child { border-right: none; }
    .stat-label { font-size: 8.5px; font-weight: 600; color: #6B6862; text-transform: uppercase; letter-spacing: 0.4px; }
    .stat-value { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; margin-top: 2px; }
    .stat-value.green { color: #16A34A; }
    .stat-value.amber { color: #D97706; }
    .stat-value.red   { color: #DC2626; }
    .stat-value.blue  { color: #2563EB; }
    .tier-section { margin-bottom: 18px; page-break-inside: avoid; }
    .tier-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .tier-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
    .tier-name { font-size: 11.5px; font-weight: 700; }
    .tier-meta { font-size: 9.5px; color: #6B6862; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { border-bottom: 1.5px solid #1A1816; border-top: 1px solid #E7E5E1; }
    th { text-align: left; padding: 5px 6px; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; color: #6B6862; }
    tbody tr { border-bottom: 1px solid #E7E5E1; }
    tbody tr:last-child { border-bottom: none; }
    td { padding: 6px 6px; font-size: 9.5px; vertical-align: middle; }
    td.mono { font-family: "JetBrains Mono", monospace; font-size: 9px; }
    td.muted { color: #6B6862; }
    .report-footer {
      position: fixed; bottom: 10mm; left: 16mm; right: 16mm;
      display: flex; justify-content: space-between;
      font-size: 8.5px; color: #9A968E;
      border-top: 1px solid #E7E5E1; padding-top: 5px;
    }
    @media screen {
      body { background: #F4F4F2; padding: 32px; }
      .print-wrap {
        background: #fff; max-width: 760px; margin: 0 auto;
        padding: 48px 52px; box-shadow: 0 4px 24px rgba(0,0,0,0.10); border-radius: 4px;
      }
      .report-footer { position: static; border-top: 1px solid #E7E5E1; padding-top: 8px; margin-top: 24px; }
    }
  </style>
</head>
<body>
  <div class="print-wrap">
    <header class="report-header">
      <div>
        <div class="logo">Standly</div>
        <div class="logo-sub">Sistema de Reservas</div>
        <div class="report-title">Reporte de Reservas</div>
        <div class="report-subtitle">${event?.nombre ?? 'Evento'}</div>
      </div>
      <div class="report-meta">
        <span>Generado el</span>
        <strong>${now}</strong>
        <span style="margin-top:4px;display:block;">${total} reserva${total !== 1 ? 's' : ''} en el reporte</span>
      </div>
    </header>
    ${groupSections}
    <footer class="report-footer">
      <span>Standly &mdash; Sistema de Reservas de Stands</span>
      <span>Generado: ${now}</span>
    </footer>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;
}

function openPrintWindow(event, reservations) {
  const html = buildPrintHTML(event, reservations);
  const win  = window.open('', '_blank', 'width=900,height=700');
  if (!win) { alert('Permite las ventanas emergentes para generar el PDF.'); return; }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

// ─── Component ────────────────────────────────────────────────

export function Export() {
  const [event, setEvent]               = useState(null);
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const [history, setHistory]           = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF]   = useState(false);
  const [deletingId, setDeletingId]         = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const ev   = await getActiveEvent();
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

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await getExportHistory(30);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const filtered = filter ? reservations.filter(r => r.status === filter) : reservations;

  async function handleGeneratePDF() {
    const confirmedOnly = reservations.filter(r => r.status === 'confirmed');
    if (!event || confirmedOnly.length === 0) return;
    setGeneratingPDF(true);
    try {
      openPrintWindow(event, confirmedOnly);

      const confirmed = confirmedOnly;
      await saveExportRecord({
        event_id:          event.id,
        event_nombre:      event.nombre,
        event_fecha:       event.fecha ?? null,
        filter_status:     filter,
        reservation_count: filtered.length,
        confirmed_count:   confirmed.length,
        revenue:           confirmed.reduce((acc, r) => acc + (r.stands?.tiers?.precio ?? 0), 0),
      });
      await loadHistory();
    } catch (err) {
      console.error('Error al guardar historial:', err);
    } finally {
      setGeneratingPDF(false);
    }
  }

  async function handleDownloadFromHistory(record) {
    if (!event) return;
    try {
      const data = await getReservationsForExport(event.id, 'confirmed');
      openPrintWindow(event, data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await deleteExportRecord(id);
      setHistory(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  function exportCSV() {
    const rows = [
      ['Stand', 'Categoría', 'Nombre', 'Cédula', 'Celular', 'Correo', 'Estado', 'Fecha'],
      ...filtered.map(r => [
        r.stands?.nombre ?? '',
        r.stands?.tiers?.nombre ?? '',
        r.nombre, r.cedula, r.celular, r.correo,
        STATUS_LABELS[r.status] ?? r.status,
        new Date(r.created_at).toLocaleDateString('es-PA'),
      ])
    ];
    const csv  = rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `reservas-${event?.nombre ?? 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div style={{ padding: 40, color: T.textMuted }}>Cargando...</div>;

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── Header ── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>Exportar Reservas</h1>
          <p style={{ color: T.textMuted, marginTop: 4, fontSize: 14 }}>{event?.nombre}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <CSButton
            variant="secondary"
            icon={<FileDown size={16} />}
            onClick={exportCSV}
            disabled={filtered.length === 0}
          >
            CSV
          </CSButton>
          <CSButton
            variant="primary"
            icon={<FileText size={16} />}
            onClick={handleGeneratePDF}
            disabled={filtered.length === 0 || generatingPDF}
          >
            {generatingPDF ? 'Abriendo...' : 'Descargar PDF'}
          </CSButton>
        </div>
      </header>

      {/* ── Filtros ── */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Filter size={16} color={T.textMuted} />
        {[null, 'confirmed', 'pending', 'rejected'].map(s => (
          <button key={String(s)} onClick={() => setFilter(s)} style={{
            padding: '6px 14px', borderRadius: 20,
            border: `1px solid ${filter === s ? T.accent : T.border}`,
            background: filter === s ? T.accentSoft : 'transparent',
            color: filter === s ? T.accentDark : T.textMuted,
            fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: T.font,
          }}>
            {s === null
              ? `Todos (${reservations.length})`
              : `${STATUS_LABELS[s]} (${reservations.filter(r => r.status === s).length})`}
          </button>
        ))}
      </div>

      {/* ── Tabla de preview ── */}
      <CSCard padding={0} style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
              {['Stand', 'Categoría', 'Nombre', 'Cédula', 'Celular', 'Correo', 'Estado', 'Fecha'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left', fontWeight: 600,
                  fontSize: 12, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: T.textMuted }}>
                  No hay reservas
                </td>
              </tr>
            ) : filtered.map(r => (
              <tr key={r.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{r.stands?.nombre}</td>
                <td style={{ padding: '12px 16px', color: T.textMuted }}>{r.stands?.tiers?.nombre}</td>
                <td style={{ padding: '12px 16px' }}>{r.nombre}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 13 }}>{r.cedula}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 13 }}>{r.celular}</td>
                <td style={{ padding: '12px 16px', color: T.textMuted }}>{r.correo}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: (STATUS_COLORS[r.status] ?? T.textMuted) + '18',
                    color: STATUS_COLORS[r.status] ?? T.textMuted,
                  }}>
                    {STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: T.textMuted }}>
                  {new Date(r.created_at).toLocaleDateString('es-PA')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CSCard>

      {/* ── Historial de exportaciones ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} color={T.textMuted} />
            <span style={{ fontSize: 15, fontWeight: 700 }}>Historial de reportes</span>
          </div>
          <button
            onClick={loadHistory}
            disabled={historyLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: T.textMuted, fontFamily: T.font,
            }}
          >
            <RefreshCw size={14} style={{ opacity: historyLoading ? 0.4 : 1 }} />
            Actualizar
          </button>
        </div>

        <CSCard padding={0} style={{ overflow: 'hidden' }}>
          {historyLoading ? (
            <div style={{ padding: 32, textAlign: 'center', color: T.textMuted, fontSize: 14 }}>
              Cargando historial...
            </div>
          ) : history.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: T.textSubtle }}>
              <FileText size={28} color={T.border} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 14, fontWeight: 500, color: T.textMuted }}>Sin reportes generados</div>
              <div style={{ fontSize: 13, color: T.textSubtle, marginTop: 4 }}>
                Los PDFs generados quedarán registrados aquí.
              </div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
                  {['Nombre', 'Fecha del evento', 'Reservas', 'Confirmados', 'Ingresos', 'PDF'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left', fontWeight: 600,
                      fontSize: 11, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.4,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((rec, i) => (
                  <tr key={rec.id} style={{ borderBottom: i === history.length - 1 ? 'none' : `1px solid ${T.border}` }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500, maxWidth: 220 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {rec.event_nombre}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: T.textMuted, fontSize: 13 }}>
                      {rec.event_fecha ? fmtDate(rec.event_fecha) : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>{rec.reservation_count}</td>
                    <td style={{ padding: '12px 16px', color: T.available, fontWeight: 600 }}>{rec.confirmed_count}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{fmtCurrency(rec.revenue)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <CSButton
                          variant="secondary"
                          size="sm"
                          icon={<FileDown size={13} />}
                          onClick={() => handleDownloadFromHistory(rec)}
                        >
                          Descargar PDF
                        </CSButton>
                        <button
                          onClick={() => handleDelete(rec.id)}
                          disabled={deletingId === rec.id}
                          style={{
                            width: 36, height: 36, borderRadius: 8, border: `1px solid ${T.border}`,
                            background: 'transparent', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            color: deletingId === rec.id ? T.textSubtle : T.reserved,
                            opacity: deletingId === rec.id ? 0.5 : 1,
                          }}
                          title="Eliminar del historial"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CSCard>
      </section>
    </div>
  );
}
