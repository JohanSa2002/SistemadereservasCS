import React, { useState, useEffect } from 'react';
import { T, STATUS, TIERS } from '../../theme/tokens';
import { CSCard, CSBadge, CSButton, Icons, CSField, CSInput } from '../../components/UI';
import { StandMap, Legend } from '../../components/StandMap';
import { getActiveEvent, getStandsWithTiers, getTiers, releaseStand, manualReservation, updateStandTier, subscribeToStands } from '../../api/api';

const EMPTY_FORM = { nombre: '', cedula: '', celular: '', correo: '' };

export function AdminMap() {
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [stands, setStands] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isManual, setIsManual] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let channel;
    async function loadData() {
      try {
        setLoading(true);
        const activeEvent = await getActiveEvent();
        setEvent(activeEvent);
        const data = await getStandsWithTiers(activeEvent.id);
        setStands(data);
        const tiersData = await getTiers();
        setTiers(tiersData);
        channel = subscribeToStands(activeEvent.id, (newStand) => {
          setStands(prev => prev.map(s => s.id === newStand.id ? { ...s, ...newStand } : s));
        });
      } catch (error) {
        console.error('Error loading map data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    return () => { if (channel) channel.unsubscribe(); };
  }, []);

  async function loadData() {
    try {
      const activeEvent = await getActiveEvent();
      setEvent(activeEvent);
      const data = await getStandsWithTiers(activeEvent.id);
      setStands(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleTierChange(tierId) {
    try {
      await updateStandTier(selected.id, tierId);
      await loadData();
      setSelected(prev => {
        const updated = stands.find(s => s.id === prev.id);
        return updated ?? prev;
      });
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleManualSave() {
    const { nombre, cedula, celular, correo } = form;
    if (!nombre || !cedula || !celular || !correo) return alert('Completa todos los campos');
    setSaving(true);
    try {
      await manualReservation({ stand_id: selected.id, nombre, cedula, celular, correo });
      setIsManual(false);
      setForm(EMPTY_FORM);
      setSelected(null);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRelease() {
    if (!confirm('¿Liberar este stand? Se cancelarán las solicitudes pendientes.')) return;
    await releaseStand(selected.id);
    setSelected(null);
  }

  if (loading) return <div style={{ padding: 40 }}>Cargando mapa...</div>;

  const status = STATUS[selected?.status] || STATUS.available;
  const tier = selected?.tiers;

  return (
    <div style={{ display: 'flex', height: '100%', gap: 24, padding: 24 }}>
      {/* Map Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Mapa Interactivo</h1>
            <p style={{ color: T.textMuted, marginTop: 4 }}>Gestión técnica de stands — {event?.nombre}</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <CSButton variant="secondary" icon={<Icons.RefreshCw size={14} />} onClick={loadData}>Actualizar</CSButton>
            <CSButton variant="secondary" icon={<Icons.Filter size={14} />}>Filtrar</CSButton>
          </div>
        </header>
        
        <StandMap 
          stands={stands} 
          selectedId={selected?.id} 
          onSelect={setSelected} 
          height="calc(100vh - 220px)" 
        />
        
        <CSCard padding={16}>
          <Legend tiers={tiers} />
        </CSCard>
      </div>

      {/* Action Panel */}
      <aside style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {selected ? (
          <>
            <CSCard padding={24}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <h2 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>{selected.nombre}</h2>
                <CSBadge status={selected.status} dot>{status.label}</CSBadge>
              </div>
              <div style={{ color: T.textMuted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: tier?.color }} />
                {tier?.nombre} · ${tier?.precio} USD
              </div>

              {tiers.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Cambiar categoría</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {tiers.map(t => {
                      const isActive = t.id === selected.tier_id;
                      return (
                        <button key={t.id} onClick={() => !isActive && handleTierChange(t.id)} style={{
                          flex: 1, padding: '8px 4px', borderRadius: T.r2, border: `2px solid ${isActive ? t.color : T.border}`,
                          background: isActive ? t.color + '18' : 'transparent',
                          color: isActive ? t.color : T.textMuted,
                          fontWeight: 700, fontSize: 13, cursor: isActive ? 'default' : 'pointer',
                          fontFamily: T.font, transition: 'all 0.15s',
                        }}>
                          {t.nombre.replace('Tier ', '')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selected.status === 'available' ? (
                  <CSButton variant="primary" full onClick={() => setIsManual(true)}>Reserva Manual</CSButton>
                ) : (
                  <>
                    <CSButton variant="ghost" full icon={<Icons.RefreshCw size={14} />} onClick={handleRelease}>Liberar Stand</CSButton>
                    <CSButton variant="secondary" full>Ver Solicitud</CSButton>
                  </>
                )}
              </div>
            </CSCard>

            {isManual && (
              <CSCard padding={24} style={{ border: `2px solid ${T.accent}` }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Nueva Reserva Manual</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <CSField label="Nombre completo">
                    <CSInput placeholder="Ej. Juan Pérez" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                  </CSField>
                  <CSField label="Cédula">
                    <CSInput placeholder="0-000-0000" value={form.cedula} onChange={e => setForm(f => ({ ...f, cedula: e.target.value }))} />
                  </CSField>
                  <CSField label="Celular">
                    <CSInput placeholder="6000-0000" value={form.celular} onChange={e => setForm(f => ({ ...f, celular: e.target.value }))} />
                  </CSField>
                  <CSField label="Correo electrónico">
                    <CSInput type="email" placeholder="correo@ejemplo.com" value={form.correo} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} />
                  </CSField>
                  <CSButton variant="primary" full onClick={handleManualSave} disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar Reserva'}
                  </CSButton>
                  <CSButton variant="ghost" full onClick={() => { setIsManual(false); setForm(EMPTY_FORM); }}>Cancelar</CSButton>
                </div>
              </CSCard>
            )}
          </>
        ) : (
          <CSCard padding={40} style={{ textAlign: 'center', color: T.textSubtle }}>
            <Icons.MapPin size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>Selecciona un stand</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Toca cualquier stand en el mapa para ver sus detalles y gestionarlo.</div>
          </CSCard>
        )}
      </aside>
    </div>
  );
}
