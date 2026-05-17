import React, { useState, useEffect } from 'react';
import { T } from '../../theme/tokens';
import { CSCard, CSButton, CSBadge, Icons } from '../../components/UI';
import { StandMap, Legend } from '../../components/StandMap';
import { getActiveEvent, getStandsWithTiers, getTiers, subscribeToStands } from '../../api/api';

export function PublicMap({ lang, onSelectStand, onBack }) {
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [stands, setStands] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [selected, setSelected] = useState(null);

  const t = {
    es: {
      title: 'Reserva tu Stand',
      subtitle: 'Selecciona un espacio disponible (verde) para iniciar tu reserva.',
      reserve: 'Reservar este espacio',
      details: 'Detalles del Stand',
      available: 'Disponible',
      notAvailable: 'No disponible',
      features: ['Espacio de 3x3 metros', 'Punto eléctrico incluido', 'Mesa y 2 sillas'],
    },
    en: {
      title: 'Reserve your Stand',
      subtitle: 'Select an available space (green) to start your reservation.',
      reserve: 'Reserve this space',
      details: 'Stand Details',
      available: 'Available',
      notAvailable: 'Not available',
      features: ['3x3 meter space', 'Electrical outlet included', 'Table and 2 chairs'],
    }
  }[lang];

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
        console.error('Error loading public map:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    return () => { if (channel) channel.unsubscribe(); };
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>{lang === 'es' ? 'Cargando mapa...' : 'Loading map...'}</div>;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: T.surface }}>
      <header style={{ padding: '20px 24px', background: '#fff', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{
            display: 'flex', alignItems: 'center', gap: 6, background: 'transparent',
            border: 'none', color: T.textMuted, fontSize: 13, fontWeight: 500,
            cursor: 'pointer', fontFamily: T.font, padding: '6px 10px',
            borderRadius: T.r1,
          }}>
            <Icons.ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
            {lang === 'es' ? 'Inicio' : 'Home'}
          </button>
          <div style={{ width: 32, height: 32, background: T.accent, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Icons.MapPin size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{t.title}</h1>
            <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{event?.nombre}</p>
          </div>
        </div>
        <Legend tiers={tiers} lang={lang} />
      </header>

      <main style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ flex: 1, padding: 24, minHeight: 0, overflow: 'hidden' }}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: T.textMuted, fontSize: 14 }}>{t.subtitle}</p>
          </div>
          <StandMap 
            stands={stands} 
            selectedId={selected?.id} 
            onSelect={setSelected} 
            height="calc(100% - 40px)" 
          />
        </div>

        {/* Desktop Detail Panel */}
        <aside style={{ width: 360, background: '#fff', borderLeft: `1px solid ${T.border}`, padding: 32, overflowY: 'auto' }}>
          {selected ? (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Stand {selected.nombre.split(' ')[1]}</h2>
                  <div style={{ marginTop: 4 }}>
                    <CSBadge tier={selected.tier} dot>{selected.tiers?.nombre}</CSBadge>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: T.text }}>${selected.tiers?.precio}</div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>USD</div>
                </div>
              </div>

{selected.status === 'available' ? (
                <CSButton variant="primary" size="lg" full onClick={() => onSelectStand(selected)}>
                  {t.reserve}
                </CSButton>
              ) : (
                <CSButton variant="secondary" size="lg" full disabled>
                  {t.notAvailable}
                </CSButton>
              )}
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.5 }}>
              <div>
                <Icons.MapPin size={48} style={{ margin: '0 auto 16px' }} />
                <p>{lang === 'es' ? 'Selecciona un stand en el mapa' : 'Select a stand on the map'}</p>
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

function DetailItem({ icon, text }) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: T.text }}>
      <span style={{ color: T.available }}>{icon}</span>
      {text}
    </li>
  );
}
