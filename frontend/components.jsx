// Reusable UI components — buttons, badges, cards, inputs, modals, tooltips

function CSButton({ children, variant = 'primary', size = 'md', icon, full, onClick, style = {}, disabled }) {
  const sizes = {
    sm: { h: 36, px: 12, fs: 13 },
    md: { h: 44, px: 16, fs: 14 },
    lg: { h: 52, px: 20, fs: 16 },
    xl: { h: 60, px: 24, fs: 17 },
  };
  const sz = sizes[size];
  const variants = {
    primary: { bg: T.accent, color: '#fff', border: T.accent, hover: T.accentDark },
    secondary: { bg: '#fff', color: T.text, border: T.borderStrong, hover: T.surface },
    ghost: { bg: 'transparent', color: T.text, border: 'transparent', hover: T.surface2 },
    success: { bg: T.available, color: '#fff', border: T.available, hover: '#0F8A3D' },
    danger: { bg: '#fff', color: T.reserved, border: '#F2C5C5', hover: T.reservedSoft },
    whatsapp: { bg: '#25D366', color: '#fff', border: '#25D366', hover: '#1EB852' },
  };
  const v = variants[variant];
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: sz.h, padding: `0 ${sz.px}px`, fontSize: sz.fs, fontWeight: 600,
        background: hover && !disabled ? v.hover : v.bg, color: v.color,
        border: `1px solid ${v.border}`, borderRadius: T.r2,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: full ? '100%' : 'auto', transition: 'background .12s',
        opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: -0.1, lineHeight: 1,
        ...style,
      }}>
      {icon}{children}
    </button>
  );
}

function CSBadge({ children, status, tier, dot, style = {} }) {
  let bg = T.surface2, color = T.textMuted, dotColor;
  if (status) { bg = STATUS[status].soft; color = STATUS[status].color; dotColor = STATUS[status].color; }
  if (tier) { bg = TIERS[tier].soft; color = TIERS[tier].color; dotColor = TIERS[tier].color; }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
      background: bg, color, lineHeight: 1, letterSpacing: -0.1,
      ...style,
    }}>
      {(dot || dotColor) && (
        <span style={{ width: 6, height: 6, borderRadius: 3, background: dotColor || color }} />
      )}
      {children}
    </span>
  );
}

function CSCard({ children, padding = 20, style = {} }) {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${T.border}`, borderRadius: T.r3,
      padding, ...style,
    }}>{children}</div>
  );
}

function CSField({ label, hint, error, children, required }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 6, letterSpacing: -0.1 }}>
        {label}{required && <span style={{ color: T.reserved, marginLeft: 2 }}>*</span>}
      </div>
      {children}
      {hint && !error && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 5 }}>{hint}</div>}
      {error && <div style={{ fontSize: 12, color: T.reserved, marginTop: 5 }}>{error}</div>}
    </label>
  );
}

function CSInput({ value, onChange, placeholder, type = 'text', icon, size = 'md', style = {}, ...rest }) {
  const h = size === 'lg' ? 52 : size === 'sm' ? 36 : 44;
  const fs = size === 'lg' ? 16 : 14;
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {icon && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, display: 'flex' }}>{icon}</span>}
      <input
        type={type} value={value || ''} onChange={onChange} placeholder={placeholder}
        style={{
          width: '100%', height: h, padding: `0 14px ${icon ? '0 38px' : ''}`,
          paddingLeft: icon ? 38 : 14,
          fontSize: fs, color: T.text, background: '#fff',
          border: `1px solid ${T.borderStrong}`, borderRadius: T.r2, outline: 'none',
          transition: 'border-color .12s, box-shadow .12s',
          ...style,
        }}
        onFocus={(e) => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentSoft}`; }}
        onBlur={(e) => { e.target.style.borderColor = T.borderStrong; e.target.style.boxShadow = 'none'; }}
        {...rest}
      />
    </div>
  );
}

function CSStandTooltip({ stand, x, y }) {
  const tier = TIERS[stand.tier];
  const status = STATUS[stand.status];
  return (
    <div style={{
      position: 'absolute', left: x, top: y, transform: 'translate(-50%, calc(-100% - 12px))',
      background: '#1A1816', color: '#fff', borderRadius: T.r2,
      padding: '10px 12px', fontSize: 12, lineHeight: 1.4,
      boxShadow: T.shadow3, pointerEvents: 'none', zIndex: 50,
      minWidth: 140, fontFamily: T.font, whiteSpace: 'nowrap',
    }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{stand.name}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.85 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: tier.color }} />
        {tier.name} · ${tier.price}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, opacity: 0.85 }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: status.color }} />
        {status.label}
      </div>
      <div style={{
        position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
        width: 10, height: 10, background: '#1A1816',
      }} />
    </div>
  );
}

// Logo / wordmark
function CSLogo({ size = 16, color = T.text, mono = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color }}>
      <svg width={size + 4} height={size + 4} viewBox="0 0 20 20" fill="none">
        <rect x="1" y="1" width="8" height="8" rx="1.5" fill={mono ? color : T.accent} />
        <rect x="11" y="1" width="8" height="8" rx="1.5" stroke={color} strokeWidth="1.6" />
        <rect x="1" y="11" width="8" height="8" rx="1.5" stroke={color} strokeWidth="1.6" />
        <rect x="11" y="11" width="8" height="8" rx="1.5" fill={mono ? color : T.accent} opacity="0.4" />
      </svg>
      <span style={{ fontSize: size, fontWeight: 700, letterSpacing: -0.4 }}>Standly</span>
    </div>
  );
}

// Map renderer (used in public + admin views)
// onSelect(stand), selectedId, mode = 'user' | 'admin'
function CSStandMap({ stands = STANDS, onSelect, selectedId, mode = 'user', height = 460, showHover = true, density = 'comfy' }) {
  const [hover, setHover] = React.useState(null);
  const [zoom, setZoom] = React.useState(1);
  const W = 706; const H = 372; // intrinsic
  const padW = density === 'compact' ? 0 : 8;

  return (
    <div style={{
      position: 'relative', width: '100%', height, background: T.surface,
      borderRadius: T.r3, border: `1px solid ${T.border}`, overflow: 'hidden',
      userSelect: 'none',
    }}>
      {/* zoom controls */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, display: 'flex', flexDirection: 'column', background: '#fff', border: `1px solid ${T.border}`, borderRadius: T.r2, boxShadow: T.shadow1 }}>
        <button onClick={() => setZoom(z => Math.min(2, z + 0.2))} style={{ width: 36, height: 36, border: 'none', background: 'transparent', borderBottom: `1px solid ${T.border}`, fontSize: 18, color: T.text, cursor: 'pointer' }}>＋</button>
        <button onClick={() => setZoom(z => Math.max(0.6, z - 0.2))} style={{ width: 36, height: 36, border: 'none', background: 'transparent', fontSize: 18, color: T.text, cursor: 'pointer' }}>−</button>
      </div>

      {/* Venue label markers */}
      <div style={{ position: 'absolute', top: 12, left: 16, fontSize: 11, fontWeight: 600, color: T.textSubtle, fontFamily: T.fontMono, letterSpacing: 0.5, textTransform: 'uppercase' }}>
        ENTRADA PRINCIPAL ↓
      </div>

      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: padW,
      }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ maxHeight: '100%', transform: `scale(${zoom})`, transition: 'transform .2s' }}>
          {/* corridor labels */}
          <text x={W/2} y={H/2 + 4} textAnchor="middle" fontSize="10" fontFamily={T.fontMono} fill={T.textSubtle} letterSpacing="2" style={{ textTransform: 'uppercase' }}>PASILLO</text>
          {/* entrance arrow */}
          <path d={`M${W/2 - 14} ${H - 4} L${W/2} ${H + 8} L${W/2 + 14} ${H - 4}`} stroke={T.borderStrong} strokeWidth="1" fill="none" />

          {stands.map((s) => {
            const tier = TIERS[s.tier];
            const status = STATUS[s.status];
            const isSelected = selectedId === s.id;
            const isHover = hover === s.id;
            const fill = status.id === 'available' ? tier.soft : status.soft;
            const stroke = status.id === 'available' ? tier.color : status.color;
            const labelColor = status.id === 'available' ? tier.color : status.color;
            return (
              <g key={s.id}
                onClick={() => onSelect && onSelect(s)}
                onMouseEnter={() => setHover(s.id)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: 'pointer' }}>
                <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={6}
                  fill={fill} stroke={stroke} strokeWidth={isSelected || isHover ? 2.5 : 1.5}
                  style={{ transition: 'stroke-width .1s' }} />
                <text x={s.x + s.w/2} y={s.y + s.h/2 - 2} textAnchor="middle" fontSize="13" fontWeight="700"
                  fontFamily={T.font} fill={labelColor} dominantBaseline="middle">
                  {s.id.replace('S','')}
                </text>
                <text x={s.x + s.w/2} y={s.y + s.h/2 + 13} textAnchor="middle" fontSize="9" fontWeight="600"
                  fontFamily={T.fontMono} fill={labelColor} opacity="0.7" dominantBaseline="middle" letterSpacing="0.5">
                  {s.tier}
                </text>
                {/* status indicator dot */}
                {status.id !== 'available' && (
                  <circle cx={s.x + s.w - 7} cy={s.y + 7} r={3.5} fill={stroke} stroke="#fff" strokeWidth="1.2" />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {showHover && hover && (() => {
        const s = stands.find(x => x.id === hover);
        if (!s) return null;
        // approx tooltip pos (center of stand, in container coords)
        const cx = ((s.x + s.w/2) / W) * 100;
        const cy = ((s.y) / H) * 100;
        return (
          <div style={{ position: 'absolute', left: `${cx}%`, top: `${cy}%`, pointerEvents: 'none', zIndex: 20 }}>
            <CSStandTooltip stand={s} x={0} y={0} />
          </div>
        );
      })()}
    </div>
  );
}

function CSLegend({ compact = false }) {
  const items = [
    { label: 'Disponible', color: T.available },
    { label: 'Por confirmar', color: T.pending },
    { label: 'Reservado', color: T.reserved },
  ];
  const tiers = [
    { ...TIERS.A, label: `${TIERS.A.name} · $${TIERS.A.price}` },
    { ...TIERS.B, label: `${TIERS.B.name} · $${TIERS.B.price}` },
    { ...TIERS.C, label: `${TIERS.C.name} · $${TIERS.C.price}` },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: compact ? 'column' : 'row', gap: compact ? 12 : 24, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Estado</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {items.map(i => (
            <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.text }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: i.color }} />
              {i.label}
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>Categoría</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {tiers.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.text }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: t.color }} />
              {t.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Icon set (small inline svg)
const Icons = {
  check: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  x: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  search: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" /><path d="M14 14L11 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  download: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 2v9M4 7l4 4 4-4M3 14h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  whatsapp: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2.1-.3 0-.5 0-.1-.6-1.5-.8-2-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2 0 1.3.9 2.5 1.1 2.7.1.2 1.8 2.7 4.3 3.8.6.3 1.1.4 1.4.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3z M12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.4 1.3 4.9L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" /></svg>,
  plus: (s = 16) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  edit: (s = 14) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><path d="M9 2l3 3-7 7H2v-3l7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
  user: (s = 14) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" /><path d="M2 12c.5-2.2 2.5-3.5 5-3.5s4.5 1.3 5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>,
  phone: (s = 14) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><path d="M3 2h2l1 3-1.5 1c.7 1.5 2 2.8 3.5 3.5L9 8l3 1v2c0 .6-.4 1-1 1-5 0-9-4-9-9 0-.6.4-1 1-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>,
  mail: (s = 14) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><rect x="1.5" y="3" width="11" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" /><path d="M2 4l5 4 5-4" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>,
  card: (s = 14) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M1.5 6h11" stroke="currentColor" strokeWidth="1.3" /></svg>,
  arrowRight: (s = 14) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  calendar: (s = 14) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M1.5 5.5h11M4 1v3M10 1v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>,
  filter: (s = 14) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><path d="M2 3h10M3.5 7h7M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  pdf: (s = 14) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><path d="M3 1.5h5l3 3V12c0 .3-.2.5-.5.5h-7.5c-.3 0-.5-.2-.5-.5V2c0-.3.2-.5.5-.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="M8 1.5v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>,
  refresh: (s = 14) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><path d="M12 7a5 5 0 1 1-1.5-3.5L12 5M12 2v3H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  pin: (s = 14) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><path d="M7 1c-2.2 0-4 1.8-4 4 0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><circle cx="7" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.3" /></svg>,
  shield: (s = 14) => <svg width={s} height={s} viewBox="0 0 14 14" fill="none"><path d="M7 1l5 2v4c0 3-2 5-5 6-3-1-5-3-5-6V3l5-2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>,
};

window.CSButton = CSButton;
window.CSBadge = CSBadge;
window.CSCard = CSCard;
window.CSField = CSField;
window.CSInput = CSInput;
window.CSStandTooltip = CSStandTooltip;
window.CSLogo = CSLogo;
window.CSStandMap = CSStandMap;
window.CSLegend = CSLegend;
window.Icons = Icons;
