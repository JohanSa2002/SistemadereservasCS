import React, { useState, useEffect } from 'react';
import { T } from '../../theme/tokens';
import { CSCard, CSButton, CSField, CSInput } from '../../components/UI';
import { getActiveEvent, startNewCycle } from '../../api/api';
import { Calendar, RefreshCw } from 'lucide-react';

export function Cycles() {
  const [activeEvent, setActiveEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('23:59');
  const [result, setResult] = useState(null);

  useEffect(() => {
    getActiveEvent()
      .then(setActiveEvent)
      .catch(() => setActiveEvent(null))
      .finally(() => setLoading(false));
  }, []);

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
    } catch (err) {
      setResult({ ok: false, mensaje: err.message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 40 }}>Cargando...</div>;

  return (
    <div style={{ padding: 32, maxWidth: 640 }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Eventos</h1>
        <p style={{ color: T.textMuted, marginTop: 4 }}>Inicia un nuevo evento para el próximo mes de la feria</p>
      </header>

      {activeEvent && (
        <CSCard padding={20} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: T.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} color={T.accent} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Evento activo</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{activeEvent.nombre}</div>
            {activeEvent.fecha && (
              <div style={{ fontSize: 13, color: T.textMuted }}>
                Expira: {new Date(activeEvent.fecha + 'T00:00:00').toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' })}
                {activeEvent.hora_expiracion && ` a las ${activeEvent.hora_expiracion.slice(0, 5)}`}
              </div>
            )}
          </div>
        </CSCard>
      )}

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
              <CSInput
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                required
              />
            </CSField>
            <CSField label="Hora de expiración">
              <CSInput
                type="time"
                value={hora}
                onChange={e => setHora(e.target.value)}
                required
              />
            </CSField>
          </div>

          {result && (
            <div style={{
              padding: '12px 16px', borderRadius: T.r2, fontSize: 14,
              background: result.ok ? T.availableSoft : '#FCE9E9',
              color: result.ok ? T.available : T.reserved,
              border: `1px solid ${result.ok ? T.available : T.reserved}30`
            }}>
              {result.mensaje}
            </div>
          )}

          <CSButton variant="primary" size="lg" disabled={saving || !nombre.trim() || !fecha || !hora}>
            {saving ? 'Iniciando...' : 'Iniciar nuevo evento'}
          </CSButton>
        </form>
      </CSCard>
    </div>
  );
}
