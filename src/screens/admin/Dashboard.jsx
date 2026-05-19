import React, { useState, useEffect } from 'react';
import { T } from '../../theme/tokens';
import { CSCard, CSBadge, CSButton, Icons } from '../../components/UI';
import { getPendingReservations, confirmReservation, rejectReservation, getActiveEvent, getStandsWithTiers } from '../../api/api';

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState({ total: 0, reserved: 0, pending: 0, available: 0 });
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const activeEvent = await getActiveEvent();
      setEvent(activeEvent);

      const stands = await getStandsWithTiers(activeEvent.id);
      const pendingReqs = await getPendingReservations();
      setRequests(pendingReqs);

      setStats({
        total: stands.length,
        reserved: stands.filter(s => s.status === 'reserved').length,
        pending: stands.filter(s => s.status === 'pending').length,
        available: stands.filter(s => s.status === 'available').length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  function buildConfirmationWhatsApp(req) {
    const phone = req.celular.replace(/\D/g, '');
    const fullPhone = phone.startsWith('507') ? phone : `507${phone}`;
    const metodo = req.metodo_pago === 'yappi' ? 'Yappi' : 'Efectivo';
    const precio = req.stands?.tiers?.precio ?? 0;
    const pagado = req.pago_monto ?? 0;
    const debe   = precio - pagado;

    const pagoLabel = req.pago_tipo === 'adelantado' ? 'Pago total adelantado'
      : req.pago_tipo === 'dia_evento'               ? 'Pago total día del evento'
      : req.pago_tipo === 'abono'                    ? 'Abono parcial'
      : 'Pago completo';

    const pagoDetalle = req.pago_tipo === 'abono'
      ? `- Abono pagado: $${pagado} USD\n- Saldo pendiente: $${debe} USD\n\n` +
        `*Recuerda que tienes un saldo pendiente.* Por favor coordina el pago del monto restante con nosotros a la brevedad.\n\n`
      : req.pago_tipo === 'dia_evento'
      ? `\n*Recuerda traer el pago completo ($${precio} USD) el día del evento.*\n\n`
      : '\n';

    const msg =
      `*¡Tu reserva ha sido confirmada!*\n\n` +
      `Hola ${req.nombre}, nos complace informarte que tu solicitud de reserva ha sido *aprobada*.\n\n` +
      `*Detalles de tu reserva:*\n` +
      `- Stand: ${req.stands?.nombre}\n` +
      `- Precio total: $${precio} USD\n` +
      `- Método de pago: ${metodo}\n` +
      `- Tipo de pago: ${pagoLabel}\n` +
      pagoDetalle +
      `Si tienes alguna pregunta, no dudes en contactarnos. ¡Gracias!`;

    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
  }

  async function handleConfirm(req) {
    if (!confirm(`¿Confirmar la reserva de ${req.nombre}?\nSe enviará notificación al: ${req.celular}`)) return;
    const url = buildConfirmationWhatsApp(req);
    // Abrir la ventana de forma síncrona (dentro del gesto del usuario)
    // para evitar que el navegador bloquee el popup tras el await
    const win = window.open('', '_blank');
    try {
      await confirmReservation(req.id);
      if (win) win.location.href = url;
      loadData();
    } catch (err) {
      if (win) win.close();
      alert(err.message);
    }
  }

  async function handleReject(id) {
    if (!confirm('¿Rechazar esta reserva? El stand volverá a estar disponible.')) return;
    try {
      await rejectReservation(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div style={{ padding: 40 }}>Cargando datos...</div>;

  return (
    <div style={{ padding: 32 }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Dashboard</h1>
        <p style={{ color: T.textMuted, marginTop: 4 }}>Resumen general del evento activo: <strong style={{ color: T.text }}>{event?.nombre}</strong></p>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Stands" value={stats.total} />
        <StatCard label="Confirmados" value={stats.reserved} color={T.available} />
        <StatCard label="Por Confirmar" value={stats.pending} color={T.pending} />
        <StatCard label="Disponibles" value={stats.available} />
      </div>

      {/* Requests Table */}
      <CSCard padding={0}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Solicitudes Pendientes</h2>
          <CSBadge status="pending" dot>{requests.length} pendientes</CSBadge>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: T.surface, textAlign: 'left', borderBottom: `1px solid ${T.border}` }}>
                {['Stand', 'Solicitante', 'Contacto', 'Pago', 'Fecha', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 24px', fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: 40, textAlign: 'center', color: T.textSubtle }}>No hay solicitudes pendientes.</td></tr>
              ) : requests.map(req => (
                <tr key={req.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, background: T.surface2,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12
                      }}>
                        {req.stands?.nombre.split(' ')[1]}
                      </div>
                      <span style={{ fontWeight: 600 }}>{req.stands?.nombre}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 500 }}>{req.nombre}</div>
                    <div style={{ fontSize: 12, color: T.textMuted }}>{req.cedula}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: 13 }}>{req.celular}</div>
                    <div style={{ fontSize: 12, color: T.textMuted }}>{req.correo}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {(() => {
                      const precio = req.stands?.tiers?.precio ?? 0;
                      const pagado = req.pago_monto ?? 0;
                      const debe   = precio - pagado;
                      const tipoBadge = req.pago_tipo === 'abono'
                        ? <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#FDF1E0', color: '#D97706', display: 'inline-block' }}>
                              Abono {pagado > 0 ? `$${pagado}` : ''}
                            </span>
                            {debe > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#DC2626' }}>Pendiente: ${debe}</span>}
                          </div>
                        : req.pago_tipo === 'dia_evento'
                        ? <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#FDF1E0', color: '#D97706' }}>Paga en evento</span>
                        : <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: T.surface2, color: T.textMuted }}>
                            {req.pago_tipo === 'adelantado' ? 'Pago adelantado' : 'Pago completo'}
                          </span>;
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>${precio} USD</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: T.textSubtle, textTransform: 'uppercase', letterSpacing: 0.5 }}>Método</div>
                            <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: T.surface2, color: T.text, display: 'inline-block' }}>
                              {req.metodo_pago === 'yappi' ? 'Yappi' : 'Efectivo'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: T.textSubtle, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tipo</div>
                            {tipoBadge}
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td style={{ padding: '16px 24px', color: T.textMuted, fontSize: 13 }}>
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <CSButton variant="success" size="sm" onClick={() => handleConfirm(req)} icon={<Icons.Check size={14} />}>Confirmar</CSButton>
                      <CSButton variant="danger" size="sm" onClick={() => handleReject(req.id)} icon={<Icons.X size={14} />}>Rechazar</CSButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CSCard>
    </div>
  );
}

function StatCard({ label, value, color = T.text }) {
  return (
    <CSCard padding={20}>
      <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8, color }}>{value}</div>
    </CSCard>
  );
}
