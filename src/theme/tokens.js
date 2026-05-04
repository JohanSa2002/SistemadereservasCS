export const T = {
  // Colors
  bg: '#FFFFFF',
  surface: '#FAFAF9',
  surface2: '#F4F4F2',
  border: '#E7E5E1',
  borderStrong: '#D4D2CD',

  // Text
  text: '#1A1816',
  textMuted: '#6B6862',
  textSubtle: '#9A968E',

  // Accent — azul confianza
  accent: '#2563EB',
  accentDark: '#1D4ED8',
  accentSoft: '#EFF4FF',
  accentBorder: '#BFD3F8',

  // Estado de stand
  available: '#16A34A',
  availableSoft: '#E8F6EC',
  pending: '#D97706',
  pendingSoft: '#FDF1E0',
  reserved: '#DC2626',
  reservedSoft: '#FCE9E9',

  // Tier (categoría de precio)
  tierA: '#7C3AED',
  tierB: '#0891B2',
  tierC: '#65A30D',
  tierASoft: '#F1EAFE',
  tierBSoft: '#E0F4F8',
  tierCSoft: '#EDF6DD',

  // Type
  font: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  fontMono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',

  // Radii
  r1: 6,
  r2: 10,
  r3: 14,
  r4: 20,

  // Shadow
  shadow1: '0 1px 2px rgba(15,15,12,0.04), 0 1px 3px rgba(15,15,12,0.03)',
  shadow2: '0 4px 12px rgba(15,15,12,0.06), 0 1px 3px rgba(15,15,12,0.04)',
  shadow3: '0 18px 48px rgba(15,15,12,0.14), 0 6px 18px rgba(15,15,12,0.08)',
};

export const TIERS = {
  A: { id: 'A', name: 'Tier A', subtitle: 'Esquinas premium', price: 250, color: T.tierA, soft: T.tierASoft },
  B: { id: 'B', name: 'Tier B', subtitle: 'Pasillo principal', price: 175, color: T.tierB, soft: T.tierBSoft },
  C: { id: 'C', name: 'Tier C', subtitle: 'Estándar', price: 110, color: T.tierC, soft: T.tierCSoft },
};

export const STATUS = {
  available: { id: 'available', label: 'Disponible', color: T.available, soft: T.availableSoft },
  pending: { id: 'pending', label: 'Por confirmar', color: T.pending, soft: T.pendingSoft },
  reserved: { id: 'reserved', label: 'Reservado', color: T.reserved, soft: T.reservedSoft },
};
