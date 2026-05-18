import React, { useState, useEffect } from 'react';
import { T } from '../../theme/tokens';
import { CSCard, CSButton, CSField, CSInput } from '../../components/UI';
import { getActiveEvent, startNewCycle, deleteEvent, getAllEvents, getReservationsForExport } from '../../api/api';
import { openPrintWindow } from '../../utils/pdf';
import { Calendar, RefreshCw, Trash2, FileText, Clock } from 'lucide-react';

export function Cycles() {
  const [activeEvent, setActiveEvent]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [nombre, setNombre]             = useState('');
  const [fecha, setFecha]               = useState('');
  const [hora, setHora]                 = useState('23:59');
  const [result, setResult]             = useState(null);
  const [history, setHistory]           = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [downloadingId, setDownloadingId]   = useState(null);

  useEffect(() => {
    getActiveEvent()
      .then(setActiveEvent)
      .catch(() => setActiveEvent(null))
      .finally(() => setLoading(false));
    loadHistory();
  }, []);

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const all = await getAllEvents();
      setHistory(all);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleDelete() {
    if (!activeEvent) return;
    const confirmed = window.confirm(
      `¿Desactivar el evento "${activeEvent.nombre}"?\n\nEl evento quedará inactivo. Sus stands se conservan para poder clonarlos al iniciar el próximo evento.`
    );
    if (!confirmed) return;
    setDeleting(true);
    setResult(null);
    try {
      const fresh = await getActiveEvent();
      const nombre = fresh.nombre;
      await deleteEvent(fresh.id);
      setActiveEvent(null);
      setResult({ ok: true, mensaje: `El evento "${nombre}" fue desactivado. Puedes iniciar un nuevo evento abajo.` });
      await loadHistory();
    } catch (err) {
      setResult({ ok: false, mensaje: err.message });
    } finally {
      setDeleting(false);
    }
  }

  async function handleStart(e) {
    e.preventDefault();
    if (!nombre.trim() || !fecha || !hora) return;
    setSaving(true);
    setResult(null);
    try {
      const data = await startNewCycle(nombre.trim(), fecha, hora + ':00');
      setResult({ ok: true, mensaje: `Nuevo evento "${data.nombre}" iniciado para el ${data.fecha}.` });
      setActiveEvent({ nombre: data.nombre, fecha: data.fecha, hora_expiracion: data.hora_expiracion });
      setNombre('');
      setFecha('');
      setHora('23:59');
      await loadHistory();
    } catch (err) {
      setResult({ ok: false, mensaje: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDownloadPDF(ev) {
    setDownloadingId(ev.id);
    try {
      const reservations = await getReservationsForExport(ev.id, 'confirmed');
      openPrintWindow(ev, reservations);
    } catch (err) {
      alert(err.message);
    } finally {
      setDownloadingId(null);
    }
  }

  function fmtDate(iso) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  if (loading) return <div style={{ padding: 40 }}>Cargando...</div>;

  return (
    <div style={{ padding: 32, maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 32 }}>
      <header>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Eventos</h1>
        <p style={{ color: T.textMuted, marginTop: 4 }}>Inicia un nuevo evento para el próximo mes de la feria</p>
      </header>

      {/* ── Evento activo ── */}
      {activeEvent && (
        <CSCard padding={20} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: T.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Calendar size={22} color={T.accent} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Evento activo</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{activeEvent.nombre}</div>
            {activeEvent.fecha && (
              <div style={{ fontSize: 13, color: T.textMuted }}>
                Expira: {fmtDate(activeEvent.fecha)}
                {activeEvent.hora_expiracion && ` a las ${activeEvent.hora_expiracion.slice(0, 5)}`}
              </div>
            )}
          </div>
          <CSButton variant="danger" size="sm" onClick={handleDelete} disabled={deleting} style={{ flexShrink: 0 }}>
            <Trash2 size={15} style={{ marginRight: 6 }} />
            {deleting ? 'Desactivando...' : 'Desactivar evento'}
          </CSButton>
        </CSCard>
      )}

      {/* ── Iniciar nuevo evento ── */}
      <CSCard padding={28}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <RefreshCw size={20} color={T.accent} />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Iniciar nuevo evento</h2>
        </div>
        <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 24, marginTop: 0 }}>
          Al iniciar un nuevo evento, el evento actual se desactiva y se clonan todos los stands como disponibles.
        </p>

        <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CSField label="Nombre del evento">
            <CSInput
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Expo Emprende — Junio 2026"
              required
            />
          </CSField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <CSField label="Fecha de expiración">
              <CSInput type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
            </CSField>
            <CSField label="Hora de expiración">
              <CSInput type="time" value={hora} onChange={e => setHora(e.target.value)} required />
            </CSField>
          </div>

          {result && (
            <div style={{
              padding: '12px 16px', borderRadius: T.r2, fontSize: 14,
              background: result.ok ? T.availableSoft : '#FCE9E9',
              color: result.ok ? T.available : T.reserved,
              border: `1px solid ${result.ok ? T.available : T.reserved}30`,
            }}>
              {result.mensaje}
            </div>
          )}

          <CSButton variant="primary" size="lg" disabled={saving || !nombre.trim() || !fecha || !hora}>
            {saving ? 'Iniciando...' : 'Iniciar nuevo evento'}
          </CSButton>
        </form>
      </CSCard>

      {/* ── Historial de eventos ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Clock size={16} color={T.textMuted} />
          <span style={{ fontSize: 17, fontWeight: 700 }}>Historial de Eventos</span>
        </div>

        <CSCard padding={0} style={{ overflow: 'hidden' }}>
          {historyLoading ? (
            <div style={{ padding: 32, textAlign: 'center', color: T.textMuted, fontSize: 14 }}>
              Cargando historial...
            </div>
          ) : history.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: T.textMuted, fontSize: 14 }}>
              No hay eventos registrados.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
                  {['Nombre', 'Fecha de expiración', 'Estado', 'PDF'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left', fontWeight: 600,
                      fontSize: 11, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.4,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((ev, i) => (
                  <tr key={ev.id} style={{ borderBottom: i === history.length - 1 ? 'none' : `1px solid ${T.border}` }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{ev.nombre}</td>
                    <td style={{ padding: '12px 16px', color: T.textMuted }}>
                      {ev.fecha ? fmtDate(ev.fecha) : '—'}
                      {ev.hora_expiracion && ` · ${ev.hora_expiracion.slice(0, 5)}`}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: ev.activo ? T.availableSoft : T.surface,
                        color: ev.activo ? T.available : T.textMuted,
                        border: `1px solid ${ev.activo ? T.available + '40' : T.border}`,
                      }}>
                        {ev.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <CSButton
                        variant="secondary"
                        size="sm"
                        icon={<FileText size={13} />}
                        onClick={() => handleDownloadPDF(ev)}
                        disabled={downloadingId === ev.id}
                      >
                        {downloadingId === ev.id ? 'Generando...' : 'Descargar PDF'}
                      </CSButton>
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
