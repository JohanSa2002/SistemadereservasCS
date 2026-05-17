import React, { useState } from 'react';
import { T, TIERS, STATUS } from '../theme/tokens';

const W = 900;
const H = 660;

// Bodegas: puntos de referencia fijos, no interactuables
const BODEGAS = [
  { id: 'b15', label: '15', sub: 'BODEGA', x: 668, y:  44, w: 100, h:  88 },
  { id: 'b26', label: '26', sub: 'BODEGA', x: 668, y: 140, w: 100, h: 100 },
  { id: 'b25', label: '25', sub: 'BODEGA', x: 776, y:  44, w: 116, h: 260 },
];

export function StandMap({ stands = [], onSelect, selectedId, height = 520 }) {
  const [hover, setHover] = useState(null);
  const [zoom, setZoom] = useState(1);

  return (
    <div style={{
      position: 'relative', width: '100%', height,
      background: T.surface,
      borderRadius: T.r3, border: `1px solid ${T.border}`,
      overflow: 'hidden', userSelect: 'none',
    }}>
      {/* Zoom controls */}
      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 10,
        display: 'flex', flexDirection: 'column',
        background: '#fff', border: `1px solid ${T.border}`,
        borderRadius: T.r2, boxShadow: T.shadow1,
      }}>
        <button onClick={() => setZoom(z => Math.min(3, z + 0.2))}
          style={{ width: 36, height: 36, border: 'none', background: 'transparent', borderBottom: `1px solid ${T.border}`, fontSize: 18, cursor: 'pointer' }}>＋</button>
        <button onClick={() => setZoom(z => Math.max(0.4, z - 0.2))}
          style={{ width: 36, height: 36, border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer' }}>−</button>
      </div>

      <div style={{
        position: 'absolute', inset: 0,
        overflow: 'auto', padding: 8,
      }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W * zoom}
          height={H * zoom}
          style={{ transition: 'width .2s, height .2s', display: 'block', margin: '0 auto' }}
        >
          {/* Outer border */}
          <rect x="2" y="2" width="896" height="656" rx="4" fill="none" stroke="#ccc" strokeWidth="1" />

          {/* Bodegas: estáticas, no interactuables */}
          {BODEGAS.map(b => (
            <g key={b.id}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={3}
                fill="#f0e8d0" stroke="#8B6914" strokeWidth={1.2} strokeDasharray="4 2" />
              <text x={b.x + b.w/2} y={b.y + b.h/2 - 7}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={14} fontWeight="700" fontFamily={T.font} fill="#6B4A0A">
                {b.label}
              </text>
              <text x={b.x + b.w/2} y={b.y + b.h/2 + 9}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={9} fontFamily={T.font} fill="#8B6914" letterSpacing="0.5">
                {b.sub}
              </text>
            </g>
          ))}

          {/* Stands interactuables */}
          {stands.filter(s => !s.nombre?.startsWith('BODEGA')).map((s) => {

            const status  = STATUS[s.status] || STATUS.available;
            const isSelected = selectedId === s.id;
            const isHover    = hover === s.id;
            const fill   = status.soft;
            const stroke = status.color;

            // Dynamic font size based on rect width
            const fs = s.w < 36 ? 8 : s.w < 60 ? 9 : s.w < 90 ? 11 : 13;

            return (
              <g key={s.id}
                onClick={() => onSelect && onSelect(s)}
                onMouseEnter={() => setHover(s.id)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: 'pointer' }}>
                <rect
                  x={s.x} y={s.y} width={s.w} height={s.h} rx={3}
                  fill={fill} stroke={stroke}
                  strokeWidth={isSelected || isHover ? 2.5 : 1.2}
                  style={{ transition: 'stroke-width .1s' }}
                />
                <text x={s.x + s.w / 2} y={s.y + s.h / 2}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={fs} fontWeight="600"
                  fontFamily={T.font} fill={stroke}>
                  {s.nombre.replace('Stand ', '')}
                </text>
                {status.id !== 'available' && (
                  <circle cx={s.x + s.w - 5} cy={s.y + 5} r={3}
                    fill={stroke} stroke="#fff" strokeWidth="1" />
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
    es: { status: 'Estado', available: 'Disponible', pending: 'Por confirmar', reserved: 'Reservado', category: 'Categoría' },
    en: { status: 'Status',  available: 'Available',  pending: 'Pending',       reserved: 'Reserved',   category: 'Category' },
  }[lang] ?? { status: 'Estado', available: 'Disponible', pending: 'Por confirmar', reserved: 'Reservado', category: 'Categoría' };

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>{labels.status}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: labels.available, color: T.available },
            { label: labels.pending,   color: T.pending   },
            { label: labels.reserved,  color: T.reserved  },
          ].map(i => (
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
            {tiers.map(t => (
              <div key={t.id} style={{ fontSize: 13, color: T.text }}>
                <span style={{ fontWeight: 700 }}>{t.nombre?.split(' ')[1] ?? t.nombre}</span>
                <span style={{ color: T.textMuted }}> = ${t.precio}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
