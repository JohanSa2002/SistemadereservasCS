import React, { useState } from 'react';
import { T, STATUS, TIERS } from '../theme/tokens';
import { Check, X, Search, Download, Plus, Edit, Pencil, User, Phone, Mail, CreditCard, ArrowRight, Calendar, Filter, FileDown, RefreshCw, MapPin, Shield, Layers } from 'lucide-react';

export function CSButton({ children, variant = 'primary', size = 'md', icon, full, onClick, style = {}, disabled }) {
  const sizes = {
    sm: { h: 36, px: 12, fs: 13 },
    md: { h: 44, px: 16, fs: 14 },
    lg: { h: 52, px: 20, fs: 16 },
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
  const [hover, setHover] = useState(false);
  
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
        width: full ? '100%' : 'auto', transition: 'all .12s',
        opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: -0.1, ...style,
      }}>
      {icon}{children}
    </button>
  );
}

export function CSBadge({ children, status, tier, dot, style = {} }) {
  let bg = T.surface2, color = T.textMuted, dotColor;
  if (status) { bg = STATUS[status].soft; color = STATUS[status].color; dotColor = STATUS[status].color; }
  if (tier) { bg = TIERS[tier].soft; color = TIERS[tier].color; dotColor = TIERS[tier].color; }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
      background: bg, color, lineHeight: 1, ...style,
    }}>
      {(dot || dotColor) && (
        <span style={{ width: 6, height: 6, borderRadius: 3, background: dotColor || color }} />
      )}
      {children}
    </span>
  );
}

export function CSCard({ children, padding = 20, style = {} }) {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${T.border}`, borderRadius: T.r3,
      padding, ...style,
    }}>{children}</div>
  );
}

export function CSField({ label, hint, error, children, required }) {
  return (
    <label style={{ display: 'block', width: '100%' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 6 }}>
        {label}{required && <span style={{ color: T.reserved, marginLeft: 2 }}>*</span>}
      </div>
      {children}
      {hint && !error && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 5 }}>{hint}</div>}
      {error && <div style={{ fontSize: 12, color: T.reserved, marginTop: 5 }}>{error}</div>}
    </label>
  );
}

export function CSInput({ value, onChange, placeholder, type = 'text', icon, size = 'md', style = {}, ...rest }) {
  const h = size === 'lg' ? 52 : size === 'sm' ? 36 : 44;
  const fs = size === 'lg' ? 16 : 14;
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {icon && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, display: 'flex' }}>{icon}</span>}
      <input
        type={type} value={value || ''} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', height: h, paddingLeft: icon ? 38 : 14, paddingRight: 14,
          fontSize: fs, color: T.text, background: '#fff',
          border: `1px solid ${focused ? T.accent : T.borderStrong}`, 
          boxShadow: focused ? `0 0 0 3px ${T.accentSoft}` : 'none',
          borderRadius: T.r2, outline: 'none', transition: 'all .12s',
          ...style,
        }}
        {...rest}
      />
    </div>
  );
}

export function CSLogo({ size = 16, color = T.text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color }}>
      <div style={{ 
        width: size * 1.5, height: size * 1.5, background: T.accent, 
        borderRadius: size * 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff'
      }}>
        <Shield size={size} />
      </div>
      <span style={{ fontSize: size, fontWeight: 700, letterSpacing: -0.5 }}>Chiriquí Storage</span>
    </div>
  );
}

export const Icons = {
  Check, X, Search, Download, Plus, Edit, Pencil, User, Phone, Mail, CreditCard, ArrowRight, Calendar, Filter, FileDown, RefreshCw, MapPin, Shield, Layers
};
