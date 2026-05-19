import React, { useState, useEffect } from 'react';
import { T } from '../../theme/tokens';
import { CSCard, CSButton } from '../../components/UI';
import { getActiveEvent, getReservationsForExport, getStandsWithTiers } from '../../api/api';
import { openPrintWindow } from '../../utils/pdf';
import { FileText } from 'lucide-react';


export function Export() {
  const [event, setEvent]               = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const ev   = await getActiveEvent();
        setEvent(ev);
        const data = await getReservationsForExport(ev.id, 'confirmed');
        setReservations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleGeneratePDF() {
    const confirmedOnly = reservations;
    if (!event || confirmedOnly.length === 0) return;
    setGeneratingPDF(true);
    try {
      const stands = await getStandsWithTiers(event.id);
      openPrintWindow(event, confirmedOnly, stands);
    } finally {
      setGeneratingPDF(false);
    }
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
        <CSButton
          variant="primary"
          icon={<FileText size={16} />}
          onClick={handleGeneratePDF}
          disabled={reservations.length === 0 || generatingPDF}
        >
          {generatingPDF ? 'Abriendo...' : 'Descargar PDF'}
        </CSButton>
      </header>

      {/* ── Tabla de preview ── */}
      <CSCard padding={0} style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
              {['Stand', 'Nombre', 'Cédula', 'Celular', 'Correo', 'Saldo', 'Fecha'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left', fontWeight: 600,
                  fontSize: 12, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: T.textMuted }}>
                  No hay reservas confirmadas
                </td>
              </tr>
            ) : reservations.map(r => (
              <tr key={r.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{r.stands?.nombre}</td>
                <td style={{ padding: '12px 16px' }}>{r.nombre}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 13 }}>{r.cedula}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 13 }}>{r.celular}</td>
                <td style={{ padding: '12px 16px', color: T.textMuted }}>{r.correo}</td>
                <td style={{ padding: '12px 16px' }}>
                  {r.pago_tipo === 'abono' ? (() => {
                    const total  = r.stands?.tiers?.precio ?? 0;
                    const pagado = r.pago_monto ?? 0;
                    const debe   = total - pagado;
                    return (
                      <div>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#FDF1E0', color: '#D97706', display: 'inline-block', marginBottom: 2 }}>
                          Abono {pagado > 0 ? `$${pagado}` : ''}
                        </span>
                        {debe > 0 && <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>Debe: ${debe}</div>}
                      </div>
                    );
                  })() : r.pago_tipo === 'dia_evento' ? (
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#FDF1E0', color: '#D97706' }}>
                      Pago día del evento
                    </span>
                  ) : (
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#E8F6EC', color: '#16A34A' }}>
                      Pagado
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', color: T.textMuted }}>
                  {new Date(r.created_at).toLocaleDateString('es-PA')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CSCard>

    </div>
  );
}
