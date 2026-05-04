// Admin screens: Login, Dashboard, Admin Map, Tier management, Cycle management, PDF export

function AdminShell({ children, active = 'dashboard', density = 'comfy' }) {
  const items = [
    { id: 'dashboard', label: 'Resumen', icon: '◈' },
    { id: 'map', label: 'Mapa', icon: '▦' },
    { id: 'tiers', label: 'Categorías', icon: '◐' },
    { id: 'cycles', label: 'Ciclos', icon: '◷' },
    { id: 'export', label: 'Exportar', icon: '↓' },
  ];
  return (
    <div className="cs-screen" style={{ width: '100%', height: '100%', display: 'flex', background: T.surface }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#fff', borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', padding: 16, flexShrink: 0 }}>
        <div style={{ padding: '4px 6px 16px' }}><CSLogo size={15} /></div>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.textSubtle, textTransform: 'uppercase', letterSpacing: 0.6, padding: '8px 8px 6px' }}>Administración</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map(i => (
            <div key={i.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: T.r2,
              background: active === i.id ? T.accentSoft : 'transparent',
              color: active === i.id ? T.accentDark : T.text,
              fontSize: 14, fontWeight: active === i.id ? 600 : 500,
              cursor: 'pointer',
            }}>
              <span style={{ width: 18, textAlign: 'center', opacity: 0.7 }}>{i.icon}</span>
              {i.label}
            </div>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: '12px 10px', borderTop: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Admin Demo</div>
          <div style={{ fontSize: 11, color: T.textMuted }}>admin@expo.pa</div>
        </div>
      </aside>
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>{children}</main>
    </div>
  );
}

// LOGIN
function AdminLogin() {
  return (
    <div className="cs-screen" style={{ width: '100%', height: '100%', background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}><CSLogo size={20} /></div>
        <CSCard padding={28}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4 }}>Acceso administrador</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Ingresa con tus credenciales para gestionar el evento.</div>
          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <CSField label="Correo electrónico">
              <CSInput placeholder="admin@expo.pa" size="lg" icon={Icons.mail(14)} value="admin@expo.pa" />
            </CSField>
            <CSField label="Contraseña">
              <CSInput type="password" placeholder="••••••••" size="lg" value="password" />
            </CSField>
          </div>
          <CSButton variant="primary" size="lg" full style={{ marginTop: 20 }}>Ingresar</CSButton>
          <div style={{ fontSize: 12, color: T.textSubtle, textAlign: 'center', marginTop: 14 }}>¿Olvidaste tu contraseña? <span style={{ color: T.accent, fontWeight: 500 }}>Recupérala</span></div>
        </CSCard>
        <div style={{ fontSize: 11, color: T.textSubtle, textAlign: 'center', marginTop: 16 }}>
          Esta área es solo para personal autorizado.
        </div>
      </div>
    </div>
  );
}

// DASHBOARD
function AdminDashboard({ density = 'comfy' }) {
  const pad = density === 'compact' ? 16 : 24;
  const stats = [
    { label: 'Total stands', value: 60, sub: 'Expo Emprende · jun 2026' },
    { label: 'Confirmados', value: 18, sub: '30% del total', color: T.available },
    { label: 'Por confirmar', value: 5, sub: 'Esperando tu acción', color: T.pending },
    { label: 'Disponibles', value: 32, sub: '53% del total', color: T.text },
  ];
  return (
    <AdminShell active="dashboard" density={density}>
      <div style={{ padding: pad, display: 'flex', flexDirection: 'column', gap: pad }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>Resumen</div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, marginTop: 4 }}>Bienvenida, Admin</div>
            <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Aquí puedes ver el estado del evento y atender solicitudes.</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <CSButton variant="secondary" icon={Icons.download(14)}>Exportar PDF</CSButton>
            <CSButton variant="primary" icon={Icons.plus(14)}>Reserva manual</CSButton>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {stats.map(s => (
            <CSCard key={s.label} padding={pad - 4}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
                {s.color && <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />}
                {s.label}
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1, marginTop: 6 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: T.textSubtle, marginTop: 2 }}>{s.sub}</div>
            </CSCard>
          ))}
        </div>

        {/* Pending requests */}
        <CSCard padding={0}>
          <div style={{ padding: `${pad - 6}px ${pad}px`, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>Solicitudes pendientes</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Confirma o rechaza las reservas recibidas.</div>
            </div>
            <CSBadge status="pending" dot>{REQUESTS.length} pendientes</CSBadge>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
                {['Stand','Solicitante','Cédula','Contacto','Recibida','Acciones'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REQUESTS.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i === REQUESTS.length - 1 ? 'none' : `1px solid ${T.border}` }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 6, background: TIERS[r.tier].soft, color: TIERS[r.tier].color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                        {r.stand.replace('S','')}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.stand}</div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>{TIERS[r.tier].name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 500 }}>{r.name}</td>
                  <td style={{ padding: '14px 16px', color: T.textMuted, fontFamily: T.fontMono, fontSize: 12 }}>{r.cedula}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 12 }}>{r.phone}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{r.email}</div>
                  </td>
                  <td style={{ padding: '14px 16px', color: T.textMuted, fontSize: 12 }}>{r.date}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <CSButton variant="success" size="sm" icon={Icons.check(13)}>Confirmar</CSButton>
                      <CSButton variant="danger" size="sm" icon={Icons.x(13)}>Rechazar</CSButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CSCard>
      </div>
    </AdminShell>
  );
}

// ADMIN MAP — adds action menu on stand click
function AdminMap({ density = 'comfy' }) {
  const stand = STANDS.find(s => s.id === 'S07') || STANDS[6];
  const tier = TIERS[stand.tier];
  const status = STATUS[stand.status];
  return (
    <AdminShell active="map" density={density}>
      <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, height: '100%', minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>Vista admin · 60 stands</div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginTop: 4 }}>Mapa del evento</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <CSButton variant="secondary" size="sm" icon={Icons.filter(13)}>Filtrar</CSButton>
              <CSButton variant="secondary" size="sm" icon={Icons.refresh(13)}>Actualizar</CSButton>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <CSStandMap selectedId={stand.id} height="100%" density={density} />
          </div>
          <CSCard padding={14}><CSLegend /></CSCard>
        </div>

        {/* Side panel — admin actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CSCard padding={20}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>{stand.id}</div>
              <CSBadge status={stand.status} dot>{status.label}</CSBadge>
            </div>
            <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>{tier.name} · ${tier.price} USD</div>

            <div style={{ marginTop: 16, padding: 12, background: T.pendingSoft, border: `1px solid ${T.pending}33`, borderRadius: T.r2 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.pending, textTransform: 'uppercase', letterSpacing: 0.4 }}>Solicitud activa</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginTop: 4 }}>María González</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>+507 6123 4567 · maria.g@ejemplo.com</div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <CSButton variant="success" size="md" full icon={Icons.check(14)}>Confirmar solicitud</CSButton>
              <CSButton variant="danger" size="md" full icon={Icons.x(14)}>Rechazar</CSButton>
            </div>
          </CSCard>

          <CSCard padding={20}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 12 }}>Acciones rápidas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <CSButton variant="secondary" full icon={Icons.plus(14)}>Reservar manualmente</CSButton>
              <CSButton variant="ghost" full icon={Icons.refresh(14)}>Liberar stand</CSButton>
            </div>
          </CSCard>
        </div>
      </div>
    </AdminShell>
  );
}

// TIER MANAGEMENT
function AdminTiers({ density = 'comfy' }) {
  const tiers = Object.values(TIERS);
  const counts = { A: STANDS.filter(s => s.tier === 'A').length, B: STANDS.filter(s => s.tier === 'B').length, C: STANDS.filter(s => s.tier === 'C').length };
  return (
    <AdminShell active="tiers" density={density}>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>Configuración</div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginTop: 4 }}>Categorías de precio</div>
            <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Define los tiers, su color y precio. Los cambios aplican al ciclo activo.</div>
          </div>
          <CSButton variant="primary" icon={Icons.plus(14)}>Nueva categoría</CSButton>
        </div>

        <CSCard padding={0}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}>
                {['Color','Nombre','Descripción','Precio (USD)','Stands','Acciones'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tiers.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: i === tiers.length - 1 ? 'none' : `1px solid ${T.border}` }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 6, background: t.color }} />
                      <span style={{ fontFamily: T.fontMono, fontSize: 12, color: T.textMuted }}>{t.color.toUpperCase()}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', border: `1px dashed ${T.borderStrong}`, borderRadius: 6, fontWeight: 600 }}>
                      {t.name} {Icons.edit(12)}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: T.textMuted }}>{t.subtitle}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', border: `1px solid ${T.borderStrong}`, borderRadius: 6, fontWeight: 700, background: '#fff' }}>
                      <span style={{ color: T.textMuted }}>$</span>{t.price}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 18 }}>{counts[t.id]}</span>
                      <span style={{ fontSize: 12, color: T.textMuted }}>stands</span>
                    </div>
                    {/* Mini bar */}
                    <div style={{ marginTop: 4, width: 120, height: 4, background: T.surface2, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${(counts[t.id]/60)*100}%`, height: '100%', background: t.color }} />
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <CSButton variant="ghost" size="sm">Editar stands</CSButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CSCard>
      </div>
    </AdminShell>
  );
}

// CYCLE MANAGEMENT
function AdminCycles({ density = 'comfy' }) {
  const history = [
    { id: 'may26', name: 'Expo Emprende — Mayo', date: '17–19 may 2026', stands: 60, confirmed: 54, revenue: 9750 },
    { id: 'apr26', name: 'Expo Emprende — Abril', date: '12–14 abr 2026', stands: 58, confirmed: 51, revenue: 8990 },
    { id: 'mar26', name: 'Expo Emprende — Marzo', date: '08–10 mar 2026', stands: 60, confirmed: 47, revenue: 8420 },
  ];
  return (
    <AdminShell active="cycles" density={density}>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>Eventos mensuales</div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginTop: 4 }}>Ciclos del evento</div>
        </div>

        {/* Active cycle */}
        <CSCard padding={0} style={{ borderColor: T.accentBorder, background: 'linear-gradient(180deg, #F7FAFF 0%, #fff 60%)' }}>
          <div style={{ padding: 24, display: 'flex', alignItems: 'flex-start', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <CSBadge status="available" dot>Ciclo activo</CSBadge>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4, marginTop: 10 }}>Expo Emprende — Junio 2026</div>
              <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                {Icons.calendar(13)} 14–16 junio 2026 · Centro de Convenciones, David
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: 28, marginTop: 18 }}>
                {[
                  { l: 'Stands', v: '60' },
                  { l: 'Confirmados', v: '18', c: T.available },
                  { l: 'Por confirmar', v: '5', c: T.pending },
                  { l: 'Ingresos esperados', v: '$5,420' },
                ].map(s => (
                  <div key={s.l}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 }}>{s.l}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: s.c || T.text, marginTop: 2 }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 }}>
              <CSButton variant="primary" icon={Icons.plus(14)}>Iniciar nuevo ciclo</CSButton>
              <CSButton variant="secondary">Ver mapa del ciclo</CSButton>
              <div style={{ fontSize: 11, color: T.textSubtle, textAlign: 'center', marginTop: 4, lineHeight: 1.4 }}>
                Iniciar un nuevo ciclo clona el mapa y resetea las reservas.
              </div>
            </div>
          </div>
        </CSCard>

        {/* History */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 10 }}>Historial</div>
          <CSCard padding={0}>
            {history.map((h, i) => (
              <div key={h.id} style={{ padding: '16px 20px', borderBottom: i === history.length - 1 ? 'none' : `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: T.surface2, color: T.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {Icons.calendar(16)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{h.name}</div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>{h.date}</div>
                </div>
                <div style={{ display: 'flex', gap: 32, fontSize: 13 }}>
                  <Stat l="Stands" v={h.stands} />
                  <Stat l="Confirmados" v={h.confirmed} color={T.available} />
                  <Stat l="Ingresos" v={`$${h.revenue.toLocaleString()}`} />
                </div>
                <CSButton variant="ghost" size="sm">Ver reporte</CSButton>
              </div>
            ))}
          </CSCard>
        </div>
      </div>
    </AdminShell>
  );
}

function Stat({ l, v, color }) {
  return (
    <div style={{ minWidth: 80 }}>
      <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>{l}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: color || T.text }}>{v}</div>
    </div>
  );
}

// PDF EXPORT
function AdminExport({ density = 'comfy' }) {
  const groups = [
    { tier: 'A', rows: REQUESTS.filter(r => r.tier === 'A').concat([{ stand: 'S10', name: 'Roberto Vega', cedula: '8-345-6789', phone: '+507 6700 1122', email: 'rvega@email.com' }]) },
    { tier: 'B', rows: REQUESTS.filter(r => r.tier === 'B') },
    { tier: 'C', rows: REQUESTS.filter(r => r.tier === 'C') },
  ];
  return (
    <AdminShell active="export" density={density}>
      <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Filters */}
        <CSCard padding={20} style={{ position: 'sticky', top: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>Opciones de exportación</div>

          <div style={{ marginTop: 16 }}>
            <CSField label="Ciclo">
              <select style={{ width: '100%', height: 44, padding: '0 12px', borderRadius: T.r2, border: `1px solid ${T.borderStrong}`, fontSize: 14, background: '#fff' }}>
                <option>Expo Emprende — Junio 2026</option>
                <option>Expo Emprende — Mayo 2026</option>
              </select>
            </CSField>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Filtrar por estado</div>
            {[
              { id: 'all', label: 'Todos los estados', count: 23, checked: true },
              { id: 'confirmed', label: 'Confirmados', count: 18, status: 'available', checked: true },
              { id: 'pending', label: 'Por confirmar', count: 5, status: 'pending', checked: true },
              { id: 'reserved', label: 'Reservados manualmente', count: 0, status: 'reserved' },
            ].map(o => (
              <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked={o.checked} style={{ accentColor: T.accent, width: 16, height: 16 }} />
                <span style={{ fontSize: 13, flex: 1 }}>{o.label}</span>
                {o.status && <span style={{ width: 8, height: 8, borderRadius: 4, background: STATUS[o.status]?.color }} />}
                <span style={{ fontSize: 12, color: T.textMuted }}>{o.count}</span>
              </label>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Agrupar por</div>
            {[
              { id: 'tier', label: 'Categoría de precio', checked: true },
              { id: 'status', label: 'Estado' },
              { id: 'none', label: 'Sin agrupar' },
            ].map(o => (
              <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px', cursor: 'pointer', fontSize: 13 }}>
                <input type="radio" name="group" defaultChecked={o.checked} style={{ accentColor: T.accent }} />
                {o.label}
              </label>
            ))}
          </div>

          <CSButton variant="primary" size="lg" full icon={Icons.pdf(14)} style={{ marginTop: 18 }}>Descargar PDF</CSButton>
          <div style={{ fontSize: 11, color: T.textSubtle, textAlign: 'center', marginTop: 8 }}>23 reservas en el reporte</div>
        </CSCard>

        {/* Preview */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>Vista previa del reporte</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>Reservas — Junio 2026</div>
            </div>
            <CSBadge>Carta · vertical</CSBadge>
          </div>

          {/* Paper */}
          <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 4, padding: 36, boxShadow: T.shadow2, fontSize: 11, lineHeight: 1.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `2px solid ${T.text}`, paddingBottom: 14 }}>
              <div>
                <CSLogo size={13} mono />
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 8, letterSpacing: -0.3 }}>Reporte de reservas</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>Expo Emprende · 14–16 junio 2026 · Centro de Convenciones</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: T.textMuted }}>Generado</div>
                <div style={{ fontSize: 11, fontWeight: 600 }}>03 may 2026, 10:34</div>
              </div>
            </div>

            {groups.map(g => (
              <div key={g.tier} style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: TIERS[g.tier].color }} />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{TIERS[g.tier].name}</span>
                  <span style={{ fontSize: 11, color: T.textMuted }}>· ${TIERS[g.tier].price} USD · {g.rows.length} reservas</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${T.text}` }}>
                      {['Stand','Nombre','Cédula','Celular','Correo'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '6px 4px', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.3 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((r, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                        <td style={{ padding: '7px 4px', fontWeight: 600 }}>{r.stand}</td>
                        <td style={{ padding: '7px 4px' }}>{r.name}</td>
                        <td style={{ padding: '7px 4px', fontFamily: T.fontMono, fontSize: 10 }}>{r.cedula}</td>
                        <td style={{ padding: '7px 4px', fontFamily: T.fontMono, fontSize: 10 }}>{r.phone}</td>
                        <td style={{ padding: '7px 4px', color: T.textMuted }}>{r.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            <div style={{ marginTop: 24, paddingTop: 12, borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.textMuted }}>
              <span>Standly · Sistema de reservas</span>
              <span>Página 1 de 1</span>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

window.AdminLogin = AdminLogin;
window.AdminDashboard = AdminDashboard;
window.AdminMap = AdminMap;
window.AdminTiers = AdminTiers;
window.AdminCycles = AdminCycles;
window.AdminExport = AdminExport;
