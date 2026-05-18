// Helpers de generación de PDF compartidos entre Export y Cycles

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

export function buildPrintHTML(event, reservations) {
  const now    = fmtDateTime(new Date().toISOString());
  const total  = reservations.length;
  const groups = groupByTier(reservations);

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
    @media screen {
      body { background: #F4F4F2; padding: 32px; }
      .print-wrap { background: #fff; max-width: 760px; margin: 0 auto; padding: 48px 52px; box-shadow: 0 4px 24px rgba(0,0,0,0.10); border-radius: 4px; }
      .report-footer { position: static; border-top: 1px solid #E7E5E1; padding-top: 8px; margin-top: 24px; }
    }
  </style>
</head>
<body>
  <div class="print-wrap">
    <header class="report-header">
      <div>
        <div class="logo">Standly</div>
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
    <footer class="report-footer">
      <span>Standly &mdash; Sistema de Reservas de Stands</span>
      <span>Generado: ${now}</span>
    </footer>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;
}

export function openPrintWindow(event, reservations) {
  const html = buildPrintHTML(event, reservations);
  const win  = window.open('', '_blank', 'width=900,height=700');
  if (!win) { alert('Permite las ventanas emergentes para generar el PDF.'); return; }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
