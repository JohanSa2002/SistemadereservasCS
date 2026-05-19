// Helpers de generación de PDF compartidos entre Export y Cycles

const MAP_W = 900;
const MAP_H = 660;

const BODEGAS_PRINT = [
  { label: '15', sub: 'BODEGA', x: 668, y:  44, w: 100, h:  88 },
  { label: '26', sub: 'BODEGA', x: 668, y: 140, w: 100, h: 100 },
  { label: '25', sub: 'BODEGA', x: 776, y:  44, w: 116, h: 260 },
];

const FILL   = { available: '#E8F6EC', pending: '#FDF1E0', reserved: '#FCE9E9' };
const STROKE = { available: '#16A34A', pending: '#D97706', reserved: '#DC2626' };

function buildMapSVG(stands) {
  const bodegas = BODEGAS_PRINT.map(b => `
    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="3"
      fill="#f0e8d0" stroke="#8B6914" stroke-width="1.2" stroke-dasharray="4 2"/>
    <text x="${b.x + b.w / 2}" y="${b.y + b.h / 2 - 7}"
      text-anchor="middle" dominant-baseline="middle"
      font-size="14" font-weight="700" fill="#6B4A0A">${b.label}</text>
    <text x="${b.x + b.w / 2}" y="${b.y + b.h / 2 + 9}"
      text-anchor="middle" dominant-baseline="middle"
      font-size="9" fill="#8B6914" letter-spacing="0.5">${b.sub}</text>
  `).join('');

  const standElems = stands.map(s => {
    const fill   = FILL[s.status]   ?? '#F4F4F2';
    const stroke = STROKE[s.status] ?? '#9A968E';
    const fs     = s.w < 36 ? 8 : s.w < 60 ? 9 : s.w < 90 ? 11 : 13;
    const label  = s.nombre.replace('Stand ', '');
    const dot    = s.status !== 'available'
      ? `<circle cx="${s.x + s.w - 5}" cy="${s.y + 5}" r="3" fill="${stroke}" stroke="#fff" stroke-width="1"/>`
      : '';
    return `
      <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="3"
        fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>
      <text x="${s.x + s.w / 2}" y="${s.y + s.h / 2}"
        text-anchor="middle" dominant-baseline="middle"
        font-size="${fs}" font-weight="600" fill="${stroke}">${label}</text>
      ${dot}`;
  }).join('');

  return `<svg viewBox="0 0 ${MAP_W} ${MAP_H}" width="${MAP_W}" height="${MAP_H}"
    xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;">
    <rect x="2" y="2" width="896" height="656" rx="4" fill="none" stroke="#ccc" stroke-width="1"/>
    ${bodegas}
    ${standElems}
  </svg>`;
}

function groupByTier(reservations) {
  const map = {};
  for (const r of reservations) {
    const tierNombre = r.stands?.tiers?.nombre ?? 'Sin categoría';
    const tierPrecio = r.stands?.tiers?.precio ?? 0;
    const tierColor  = r.stands?.tiers?.color  ?? '#6B6862';
    if (!map[tierNombre]) map[tierNombre] = { nombre: tierNombre, precio: tierPrecio, color: tierColor, rows: [] };
    map[tierNombre].rows.push(r);
  }
  return Object.values(map).sort((a, b) => b.precio - a.precio);
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(iso) {
  return new Date(iso).toLocaleString('es-PA', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function fmtCurrency(n) {
  return new Intl.NumberFormat('es-PA', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
}

export function buildPrintHTML(event, reservations, stands = []) {
  const now    = fmtDateTime(new Date().toISOString());
  const total  = reservations.length;
  const groups = groupByTier(reservations);

  const nAvailable = stands.filter(s => s.status === 'available').length;
  const nPending   = stands.filter(s => s.status === 'pending').length;
  const nReserved  = stands.filter(s => s.status === 'reserved').length;

  const mapSection = stands.length > 0 ? `
    <div class="map-page">
      <div class="map-page-title">Estado Final del Mapa de Stands</div>
      <div class="map-counters">
        <div class="map-counter" style="border-color:#16A34A;color:#16A34A">
          <span class="map-counter-n">${nAvailable}</span>
          <span class="map-counter-l">Disponibles</span>
        </div>
        <div class="map-counter" style="border-color:#D97706;color:#D97706">
          <span class="map-counter-n">${nPending}</span>
          <span class="map-counter-l">Por confirmar</span>
        </div>
        <div class="map-counter" style="border-color:#DC2626;color:#DC2626">
          <span class="map-counter-n">${nReserved}</span>
          <span class="map-counter-l">Reservados</span>
        </div>
        <div class="map-counter" style="border-color:#6B6862;color:#6B6862">
          <span class="map-counter-n">${stands.length}</span>
          <span class="map-counter-l">Total stands</span>
        </div>
      </div>
      <div class="map-svg-wrap">${buildMapSVG(stands)}</div>
      <div class="map-legend">
        <span class="map-legend-item"><span class="map-legend-dot" style="background:#E8F6EC;border-color:#16A34A"></span>Disponible</span>
        <span class="map-legend-item"><span class="map-legend-dot" style="background:#FDF1E0;border-color:#D97706"></span>Por confirmar</span>
        <span class="map-legend-item"><span class="map-legend-dot" style="background:#FCE9E9;border-color:#DC2626"></span>Reservado</span>
      </div>
    </div>
  ` : '';

  const statusBadge = (status) => {
    const labels = { pending: 'Por confirmar', confirmed: 'Confirmado', rejected: 'Rechazado' };
    const colors = { pending: '#D97706', confirmed: '#16A34A', rejected: '#DC2626' };
    const bgs    = { pending: '#FDF1E0', confirmed: '#E8F6EC', rejected: '#FCE9E9' };
    return `<span style="
      display:inline-block; padding:2px 8px; border-radius:20px;
      font-size:9px; font-weight:600;
      background:${bgs[status] ?? '#F4F4F2'};
      color:${colors[status] ?? '#6B6862'};
    ">${labels[status] ?? status}</span>`;
  };

  const groupSections = groups.map(g => `
    <div class="tier-section">
      <div class="tier-header">
        <span class="tier-dot" style="background:${g.color}"></span>
        <span class="tier-name">${g.nombre}</span>
        <span class="tier-meta">${fmtCurrency(g.precio)} por stand &middot; ${g.rows.length} reserva${g.rows.length !== 1 ? 's' : ''}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Stand</th><th>Nombre</th><th>Cédula</th><th>Celular</th>
            <th>Correo</th><th>Saldo</th><th>Estado</th><th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          ${g.rows.map(r => `
            <tr>
              <td class="mono">${r.stands?.nombre ?? '—'}</td>
              <td><strong>${r.nombre}</strong></td>
              <td class="mono">${r.cedula}</td>
              <td class="mono">${r.celular}</td>
              <td class="muted">${r.correo}</td>
              <td>${(() => {
                if (r.pago_tipo === 'dia_evento') return '<span style="color:#D97706;font-weight:600">Pago día del evento</span>';
                if (r.pago_tipo !== 'abono') return '<span style="color:#16A34A;font-weight:600">Pagado</span>';
                const total  = r.stands?.tiers?.precio ?? 0;
                const pagado = r.pago_monto ?? 0;
                const debe   = total - pagado;
                return `<span style="color:#D97706;font-weight:600">Abono${pagado > 0 ? ' $' + pagado : ''}</span>${debe > 0 ? '<br><span style="color:#DC2626;font-weight:700;font-size:8.5px">Debe: $' + debe + '</span>' : ''}`;
              })()}</td>
              <td>${statusBadge(r.status)}</td>
              <td class="muted">${fmtDate(r.created_at)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Reporte de Reservas — ${event?.nombre ?? 'Evento'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    @page { size: letter portrait; margin: 18mm 16mm 20mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif; font-size: 10px; color: #1A1816; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .report-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #1A1816; padding-bottom: 12px; margin-bottom: 18px; }
    .logo { font-size: 15px; font-weight: 700; letter-spacing: -0.4px; color: #2563EB; }
    .logo-sub { font-size: 9px; font-weight: 500; color: #6B6862; text-transform: uppercase; letter-spacing: 0.6px; margin-top: 2px; }
    .report-title { font-size: 16px; font-weight: 700; margin-top: 6px; letter-spacing: -0.3px; }
    .report-subtitle { font-size: 10px; color: #6B6862; margin-top: 2px; }
    .report-meta { text-align: right; font-size: 9.5px; color: #6B6862; }
    .report-meta strong { display: block; font-size: 10.5px; font-weight: 600; color: #1A1816; }
    .tier-section { margin-bottom: 18px; page-break-inside: avoid; }
    .tier-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .tier-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
    .tier-name { font-size: 11.5px; font-weight: 700; }
    .tier-meta { font-size: 9.5px; color: #6B6862; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { border-bottom: 1.5px solid #1A1816; border-top: 1px solid #E7E5E1; }
    th { text-align: left; padding: 5px 6px; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; color: #6B6862; }
    tbody tr { border-bottom: 1px solid #E7E5E1; }
    tbody tr:last-child { border-bottom: none; }
    td { padding: 6px 6px; font-size: 9.5px; vertical-align: middle; }
    td.mono { font-family: "JetBrains Mono", monospace; font-size: 9px; }
    td.muted { color: #6B6862; }
    .report-footer { position: fixed; bottom: 10mm; left: 16mm; right: 16mm; display: flex; justify-content: space-between; font-size: 8.5px; color: #9A968E; border-top: 1px solid #E7E5E1; padding-top: 5px; }
    .map-page { break-before: page; page-break-before: always; padding-top: 4px; }
    .map-page-title { font-size: 13px; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.2px; }
    .map-counters { display: flex; gap: 12px; margin-bottom: 14px; }
    .map-counter { border: 1.5px solid; border-radius: 8px; padding: 8px 14px; display: flex; flex-direction: column; align-items: center; min-width: 72px; }
    .map-counter-n { font-size: 20px; font-weight: 700; line-height: 1; }
    .map-counter-l { font-size: 8.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; margin-top: 3px; opacity: 0.8; }
    .map-svg-wrap { border: 1px solid #E7E5E1; border-radius: 6px; overflow: hidden; }
    .map-legend { display: flex; gap: 16px; margin-top: 10px; }
    .map-legend-item { display: flex; align-items: center; gap: 5px; font-size: 9px; font-weight: 500; color: #6B6862; }
    .map-legend-dot { width: 10px; height: 10px; border-radius: 3px; border: 1.5px solid; display: inline-block; flex-shrink: 0; }
    @media screen {
      body { background: #F4F4F2; padding: 32px; }
      .print-wrap { background: #fff; max-width: 760px; margin: 0 auto; padding: 48px 52px; box-shadow: 0 4px 24px rgba(0,0,0,0.10); border-radius: 4px; }
      .report-footer { position: static; border-top: 1px solid #E7E5E1; padding-top: 8px; margin-top: 24px; }
      .map-page { break-before: unset; page-break-before: unset; padding-top: 32px; border-top: 2px solid #E7E5E1; margin-top: 32px; }
    }
  </style>
</head>
<body>
  <div class="print-wrap">
    <header class="report-header">
      <div>
        <div class="logo">Chiriquí Storage</div>
        <div class="logo-sub">Sistema de Reservas</div>
        <div class="report-title">Reporte de Reservas</div>
        <div class="report-subtitle">${event?.nombre ?? 'Evento'}</div>
      </div>
      <div class="report-meta">
        <span>Generado el</span>
        <strong>${now}</strong>
        <span style="margin-top:4px;display:block;">${total} reserva${total !== 1 ? 's' : ''} en el reporte</span>
      </div>
    </header>
    ${groupSections}
    ${mapSection}
    <footer class="report-footer">
      <span>Chiriquí Storage &mdash; Sistema de Reservas de Stands</span>
      <span>Generado: ${now}</span>
    </footer>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;
}

export function openPrintWindow(event, reservations, stands = []) {
  const html = buildPrintHTML(event, reservations, stands);
  const win  = window.open('', '_blank', 'width=900,height=700');
  if (!win) { alert('Permite las ventanas emergentes para generar el PDF.'); return; }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
