import React, { useState } from 'react';
import { T, TIERS, STATUS } from '../theme/tokens';

export function StandMap({ stands = [], onSelect, selectedId, height = 460, showHover = true }) {
  const [hover, setHover] = useState(null);
  const [zoom, setZoom] = useState(1);
  const W = 706; const H = 372; // Intrinsic dimensions

  return (
    <div style={{
      position: 'relative', width: '100%', height, background: T.surface,
      borderRadius: T.r3, border: `1px solid ${T.border}`, overflow: 'hidden',
      userSelect: 'none',
    }}>
      {/* Zoom controls */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, display: 'flex', flexDirection: 'column', background: '#fff', border: `1px solid ${T.border}`, borderRadius: T.r2, boxShadow: T.shadow1 }}>
        <button onClick={() => setZoom(z => Math.min(2, z + 0.2))} style={{ width: 36, height: 36, border: 'none', background: 'transparent', borderBottom: `1px solid ${T.border}`, fontSize: 18, cursor: 'pointer' }}>＋</button>
        <button onClick={() => setZoom(z => Math.max(0.6, z - 0.2))} style={{ width: 36, height: 36, border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer' }}>−</button>
      </div>

      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ maxHeight: '100%', transform: `scale(${zoom})`, transition: 'transform .2s' }}>
          {stands.map((s) => {
            const tierKey = s.tiers?.nombre?.split(' ')[1] || 'C';
            const tier = TIERS[tierKey] || TIERS.C;
            const status = STATUS[s.status] || STATUS.available;
            const isSelected = selectedId === s.id;
            const isHover = hover === s.id;
            
            const fill = status.soft;
            const stroke = status.color;
            
            return (
              <g key={s.id}
                onClick={() => onSelect && onSelect(s)}
                onMouseEnter={() => setHover(s.id)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: 'pointer' }}>
                <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={6}
                  fill={fill} stroke={stroke} strokeWidth={isSelected || isHover ? 2.5 : 1.5}
                  style={{ transition: 'stroke-width .1s' }} />
                <text x={s.x + s.w/2} y={s.y + s.h/2 - 2} textAnchor="middle" fontSize="11" fontWeight="700"
                  fontFamily={T.font} fill={stroke} dominantBaseline="middle">
                  {`${tierKey}${s.nombre?.replace('Stand ', '') ?? ''}`}
                </text>
                {status.id !== 'available' && (
                  <circle cx={s.x + s.w - 7} cy={s.y + 7} r={3.5} fill={stroke} stroke="#fff" strokeWidth="1.2" />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function Legend({ tiers = [], lang = 'es' }) {
  const labels = {
    es: { status: 'Estado', category: 'Categoría', available: 'Disponible', pending: 'Por confirmar', reserved: 'Reservado' },
    en: { status: 'Status', category: 'Category', available: 'Available', pending: 'Pending', reserved: 'Reserved' },
  }[lang] ?? { status: 'Estado', category: 'Categoría', available: 'Disponible', pending: 'Por confirmar', reserved: 'Reservado' };

  const items = [
    { label: labels.available, color: T.available },
    { label: labels.pending,   color: T.pending },
    { label: labels.reserved,  color: T.reserved },
  ];

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>{labels.status}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {items.map(i => (
            <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: i.color }} />
              {i.label}
            </div>
          ))}
        </div>
      </div>
      {tiers.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>{labels.category}</div>
          <div style={{ display: 'flex', gap: 16 }}>
            {tiers.map(t => {
              const letra = t.nombre?.split(' ')[1] ?? t.nombre;
              return (
                <div key={t.id} style={{ fontSize: 13, color: T.text }}>
                  <span style={{ fontWeight: 700 }}>{letra}</span>
                  <span style={{ color: T.textMuted }}> = ${t.precio}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
