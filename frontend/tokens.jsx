// Design tokens for ProyectoChiriquistorage
// Minimal profesional aesthetic: white/neutral + single accent (azul confianza)

const T = {
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

// Inject base styles + Inter font
if (typeof document !== 'undefined' && !document.getElementById('cs-base-styles')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
  document.head.appendChild(link);

  const s = document.createElement('style');
  s.id = 'cs-base-styles';
  s.textContent = `
    .cs-screen { font-family: ${T.font}; color: ${T.text}; -webkit-font-smoothing: antialiased; box-sizing: border-box; }
    .cs-screen *, .cs-screen *::before, .cs-screen *::after { box-sizing: border-box; }
    .cs-screen button { font-family: inherit; cursor: pointer; }
    .cs-screen input, .cs-screen textarea, .cs-screen select { font-family: inherit; }
    .cs-screen ::-webkit-scrollbar { width: 8px; height: 8px; }
    .cs-screen ::-webkit-scrollbar-thumb { background: ${T.borderStrong}; border-radius: 4px; }
    .cs-screen ::-webkit-scrollbar-track { background: transparent; }
  `;
  document.head.appendChild(s);
}

// Tier metadata (mutable so tweaks could change them later)
const TIERS = {
  A: { id: 'A', name: 'Tier A', subtitle: 'Esquinas premium', price: 250, color: T.tierA, soft: T.tierASoft },
  B: { id: 'B', name: 'Tier B', subtitle: 'Pasillo principal', price: 175, color: T.tierB, soft: T.tierBSoft },
  C: { id: 'C', name: 'Tier C', subtitle: 'Estándar', price: 110, color: T.tierC, soft: T.tierCSoft },
};

// Stand status
const STATUS = {
  available: { id: 'available', label: 'Disponible', color: T.available, soft: T.availableSoft },
  pending: { id: 'pending', label: 'Por confirmar', color: T.pending, soft: T.pendingSoft },
  reserved: { id: 'reserved', label: 'Reservado', color: T.reserved, soft: T.reservedSoft },
};

// 60-stand grid layout — 10 cols × 6 rows in a U-shape with corridors
// Returns array of stands with { id, name, tier, status, x, y, w, h }
function buildStands() {
  const stands = [];
  let n = 1;
  const W = 64; const H = 56;
  // 6 rows, two blocks of 5 cols (corridor in middle)
  const rows = 6; const cols = 10;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // skip middle corridor (cols 4-5 on rows 1-4)
      if (c >= 4 && c <= 5 && r >= 1 && r <= 4) continue;
      // tier: corners A, edges B, center C
      let tier = 'C';
      const isCorner = (r === 0 || r === rows - 1) && (c === 0 || c === cols - 1);
      const isEdge = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
      if (isCorner) tier = 'A';
      else if (isEdge) tier = 'B';
      // status (deterministic for demo)
      const seed = (r * cols + c) * 7;
      let status = 'available';
      if (seed % 11 === 0) status = 'reserved';
      else if (seed % 13 === 0) status = 'pending';
      stands.push({
        id: `S${String(n).padStart(2, '0')}`,
        name: `Stand ${n}`,
        tier, status,
        x: 12 + c * (W + 6),
        y: 12 + r * (H + 6),
        w: W, h: H,
        row: r, col: c,
      });
      n++;
    }
  }
  return stands;
}

const STANDS = buildStands();

// Demo solicitudes
const REQUESTS = [
  { id: 'r1', stand: 'S07', name: 'María González', cedula: '8-901-2345', phone: '+507 6123 4567', email: 'maria.g@ejemplo.com', date: 'hace 2 h', tier: 'B' },
  { id: 'r2', stand: 'S23', name: 'Carlos Pinto', cedula: '4-783-1290', phone: '+507 6876 5432', email: 'cpinto@artesano.pa', date: 'hace 4 h', tier: 'C' },
  { id: 'r3', stand: 'S01', name: 'Lucía Méndez', cedula: '8-512-0099', phone: '+507 6555 0192', email: 'lu.mendez@correo.com', date: 'hace 5 h', tier: 'A' },
  { id: 'r4', stand: 'S44', name: 'Andrés Quintero', cedula: '6-720-1843', phone: '+507 6411 7720', email: 'andresq@negocio.com', date: 'ayer', tier: 'C' },
  { id: 'r5', stand: 'S12', name: 'Patricia Saldaña', cedula: '8-123-4567', phone: '+507 6202 0011', email: 'p.saldana@gmail.com', date: 'ayer', tier: 'B' },
];

window.T = T;
window.TIERS = TIERS;
window.STATUS = STATUS;
window.STANDS = STANDS;
window.REQUESTS = REQUESTS;
