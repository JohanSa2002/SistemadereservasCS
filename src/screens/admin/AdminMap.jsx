import React, { useState, useEffect } from 'react';
import { T, STATUS, TIERS } from '../../theme/tokens';
import { CSCard, CSBadge, CSButton, Icons, CSField, CSInput } from '../../components/UI';
import { StandMap, Legend } from '../../components/StandMap';
import { getActiveEvent, getStandsWithTiers, releaseStand, manualReservation, subscribeToStands } from '../../api/api';

export function AdminMap() {
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [stands, setStands] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const activeEvent = await getActiveEvent();
      setEvent(activeEvent);
      const data = await getStandsWithTiers(activeEvent.id);
      setStands(data);
      
      // Subscribe to real-time changes
      const channel = subscribeToStands(activeEvent.id, (newStand) => {
        setStands(prev => prev.map(s => s.id === newStand.id ? { ...s, ...newStand } : s));
      });
      return () => channel.unsubscribe();
    } catch (error) {
      console.error('Error loading map data:', error);
    } finally {
      setLoading(false);
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
          <Legend />
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <CSField label="Nombre del expositor"><CSInput placeholder="Ej. Juan Pérez" /></CSField>
                  <CSField label="Cédula"><CSInput placeholder="0-000-0000" /></CSField>
                  <CSButton variant="primary" full>Guardar Reserva</CSButton>
                  <CSButton variant="ghost" full onClick={() => setIsManual(false)}>Cancelar</CSButton>
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
