// Public-facing screens: Map (mobile + desktop), Stand detail modal, Reservation form, Confirmation

function PublicHeader({ desktop = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: desktop ? '14px 32px' : '14px 16px',
      borderBottom: `1px solid ${T.border}`, background: '#fff',
    }}>
      <CSLogo size={desktop ? 17 : 15} />
      {desktop ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ fontSize: 13, color: T.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
            {Icons.calendar(14)} Expo Emprende · 14–16 jun
          </span>
          <CSBadge status="available" dot>32 stands disponibles</CSBadge>
        </div>
      ) : (
        <CSBadge status="available" dot style={{ fontSize: 11 }}>32 disp.</CSBadge>
      )}
    </div>
  );
}

// MAP SCREEN — Mobile (inside iOS frame)
function PublicMapMobile({ density = 'comfy' }) {
  const [selected, setSelected] = React.useState(null);
  return (
    <div className="cs-screen" style={{ height: '100%', background: T.surface, display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />
      {/* Title + instruction */}
      <div style={{ padding: '16px 16px 12px' }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4, color: T.text }}>Reserva tu stand</div>
        <div style={{ fontSize: 14, color: T.textMuted, marginTop: 4 }}>Expo Emprende — Centro de Convenciones</div>
        <div style={{
          marginTop: 12, padding: '10px 12px', background: T.accentSoft,
          border: `1px solid ${T.accentBorder}`, borderRadius: T.r2,
          fontSize: 13, color: T.accentDark, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: T.available, flexShrink: 0 }} />
          Toca un stand verde para reservarlo
        </div>
      </div>
      {/* Map */}
      <div style={{ padding: '0 16px', flex: 1, display: 'flex' }}>
        <CSStandMap onSelect={setSelected} selectedId={selected?.id} height={280} showHover={false} density={density} />
      </div>
      {/* Legend */}
      <div style={{ padding: '14px 16px 90px', background: '#fff', borderTop: `1px solid ${T.border}`, marginTop: 12 }}>
        <CSLegend compact={false} />
      </div>
    </div>
  );
}

// MAP SCREEN — Desktop
function PublicMapDesktop({ density = 'comfy' }) {
  const [selected, setSelected] = React.useState(STANDS.find(s => s.status === 'available'));
  return (
    <div className="cs-screen" style={{ width: '100%', height: '100%', background: T.surface, display: 'flex', flexDirection: 'column' }}>
      <PublicHeader desktop />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', gap: 0, minHeight: 0 }}>
        {/* Map area */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>Reserva tu stand</div>
            <div style={{ fontSize: 14, color: T.textMuted, marginTop: 4 }}>
              Toca un stand <span style={{ color: T.available, fontWeight: 600 }}>verde</span> para ver detalles y reservarlo.
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <CSStandMap onSelect={setSelected} selectedId={selected?.id} height="100%" density={density} />
          </div>
          <CSCard padding={density === 'compact' ? 12 : 16}>
            <CSLegend />
          </CSCard>
        </div>
        {/* Side panel */}
        <div style={{ borderLeft: `1px solid ${T.border}`, background: '#fff', padding: 24, overflowY: 'auto' }}>
          {selected ? <StandDetailPanel stand={selected} /> : <EmptyDetailPanel />}
        </div>
      </div>
    </div>
  );
}

function EmptyDetailPanel() {
  return (
    <div style={{ padding: '60px 0', textAlign: 'center', color: T.textMuted }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: T.surface2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: T.textSubtle }}>
        {Icons.pin(24)}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 4 }}>Selecciona un stand</div>
      <div style={{ fontSize: 13, lineHeight: 1.5, maxWidth: 240, margin: '0 auto' }}>Toca cualquier stand del mapa para ver detalles y reservarlo.</div>
    </div>
  );
}

function StandDetailPanel({ stand, onReserve }) {
  const tier = TIERS[stand.tier]; const status = STATUS[stand.status];
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>Detalle del stand</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.6 }}>{stand.id}</div>
        <CSBadge status={stand.status} dot>{status.label}</CSBadge>
      </div>
      <div style={{ fontSize: 14, color: T.textMuted, marginTop: 4 }}>{stand.name}</div>

      <div style={{ marginTop: 20, padding: 16, background: T.surface, borderRadius: T.r2, border: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: tier.color }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{tier.name}</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>{tier.subtitle}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 14 }}>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6 }}>${tier.price}</span>
          <span style={{ fontSize: 13, color: T.textMuted }}>USD · todo el evento</span>
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <DetailRow label="Ubicación" value={`Fila ${stand.row + 1}, Columna ${stand.col + 1}`} />
        <DetailRow label="Tamaño" value="2 m × 2 m" />
        <DetailRow label="Incluye" value="Mesa, 2 sillas, electricidad" />
      </div>

      <div style={{ marginTop: 24 }}>
        <CSButton variant={stand.status === 'available' ? 'primary' : 'secondary'} size="lg" full disabled={stand.status !== 'available'} onClick={onReserve}>
          {stand.status === 'available' ? 'Reservar este stand' : status.label}
        </CSButton>
        {stand.status === 'available' && (
          <div style={{ fontSize: 12, color: T.textMuted, textAlign: 'center', marginTop: 10 }}>
            La reserva se confirma por WhatsApp en menos de 24 h.
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontSize: 13, color: T.textMuted }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{value}</span>
    </div>
  );
}

// STAND DETAIL — mobile bottom sheet style
function PublicStandDetailMobile() {
  const stand = STANDS.find(s => s.id === 'S07') || STANDS[6];
  return (
    <div className="cs-screen" style={{ height: '100%', background: 'rgba(20,18,16,0.4)', position: 'relative' }}>
      {/* dimmed map behind */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.45 }}>
        <PublicMapMobile />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,18,16,0.55)' }} />
      {/* sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: '12px 20px 32px', maxHeight: '70%', overflowY: 'auto',
        boxShadow: '0 -8px 30px rgba(0,0,0,0.18)',
      }}>
        <div style={{ width: 40, height: 4, background: T.borderStrong, borderRadius: 2, margin: '0 auto 16px' }} />
        <StandDetailPanel stand={stand} />
      </div>
    </div>
  );
}

// RESERVATION FORM — Mobile
function PublicFormMobile({ variant = 'a' }) {
  const stand = STANDS.find(s => s.id === 'S07') || STANDS[6];
  const tier = TIERS[stand.tier];
  return (
    <div className="cs-screen" style={{ height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />
      <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{ border: 'none', background: 'transparent', padding: 0, color: T.text, fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3l-4 4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Volver al mapa
        </button>
      </div>
      <div style={{ padding: '0 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>Paso 2 de 3</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4, marginTop: 4 }}>Tus datos</div>
        <div style={{ fontSize: 14, color: T.textMuted, marginTop: 4, lineHeight: 1.5 }}>
          Completa los siguientes datos para apartar el stand <strong style={{ color: T.text }}>{stand.id}</strong>.
        </div>
        {/* Stand summary */}
        <div style={{ marginTop: 16, padding: 14, background: T.surface, borderRadius: T.r2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: tier.soft, color: tier.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
            {stand.id.replace('S','')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Stand {stand.id} · {tier.name}</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>{tier.subtitle}</div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>${tier.price}</div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CSField label="Nombre completo" required>
            <CSInput placeholder="Ej. María González" size="lg" icon={Icons.user(14)} value="María González" />
          </CSField>
          <CSField label="Cédula" required hint="Tu número de identificación personal.">
            <CSInput placeholder="0-000-0000" size="lg" icon={Icons.card(14)} value="8-901-2345" />
          </CSField>
          <CSField label="Número de celular" required hint="Te contactaremos por WhatsApp.">
            <CSInput placeholder="+507 0000 0000" size="lg" icon={Icons.phone(14)} value="+507 6123 4567" type="tel" />
          </CSField>
          <CSField label="Correo electrónico" required>
            <CSInput placeholder="tu@correo.com" size="lg" icon={Icons.mail(14)} value="maria.g@ejemplo.com" type="email" />
          </CSField>
        </div>
      </div>
      {/* Sticky footer */}
      <div style={{ marginTop: 'auto', padding: '16px 20px 32px', borderTop: `1px solid ${T.border}`, background: '#fff' }}>
        <CSButton variant="primary" size="lg" full>Enviar reserva</CSButton>
        <div style={{ fontSize: 11, color: T.textSubtle, textAlign: 'center', marginTop: 10, lineHeight: 1.4 }}>
          Al enviar serás redirigido a WhatsApp para confirmar.
        </div>
      </div>
    </div>
  );
}

// FORM Variant B — single-card layout for desktop
function PublicFormDesktop() {
  const stand = STANDS.find(s => s.id === 'S07') || STANDS[6];
  const tier = TIERS[stand.tier];
  return (
    <div className="cs-screen" style={{ width: '100%', height: '100%', background: T.surface, padding: 32, overflow: 'auto' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <button style={{ border: 'none', background: 'transparent', padding: 0, color: T.text, fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3l-4 4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Volver al mapa
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.textMuted, marginBottom: 8 }}>
          <span style={{ fontWeight: 600, color: T.accent }}>1. Selección</span>
          <span style={{ color: T.textSubtle }}>{'›'}</span>
          <span style={{ fontWeight: 600, color: T.text }}>2. Tus datos</span>
          <span style={{ color: T.textSubtle }}>{'›'}</span>
          <span>3. Confirmación</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6 }}>Completa tu reserva</div>

        <CSCard padding={0} style={{ marginTop: 24, overflow: 'hidden' }}>
          {/* Selected stand banner */}
          <div style={{ padding: 20, borderBottom: `1px solid ${T.border}`, background: T.surface, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 10, background: tier.soft, color: tier.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, border: `2px solid ${tier.color}` }}>
              {stand.id.replace('S','')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Stand {stand.id}</div>
              <div style={{ fontSize: 13, color: T.textMuted, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CSBadge tier={stand.tier} dot>{tier.name}</CSBadge>
                <span>·</span>
                <span>Fila {stand.row + 1}, Col {stand.col + 1}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>${tier.price}</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>USD</div>
            </div>
          </div>
          {/* Form */}
          <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <CSField label="Nombre completo" required>
              <CSInput placeholder="Ej. María González" size="lg" icon={Icons.user(14)} value="María González" />
            </CSField>
            <CSField label="Cédula" required>
              <CSInput placeholder="0-000-0000" size="lg" icon={Icons.card(14)} value="8-901-2345" />
            </CSField>
            <CSField label="Número de celular" required hint="Te contactaremos por WhatsApp.">
              <CSInput placeholder="+507 0000 0000" size="lg" icon={Icons.phone(14)} value="+507 6123 4567" type="tel" />
            </CSField>
            <CSField label="Correo electrónico" required>
              <CSInput placeholder="tu@correo.com" size="lg" icon={Icons.mail(14)} value="maria.g@ejemplo.com" type="email" />
            </CSField>
          </div>
          <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.border}`, background: T.surface, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: T.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
              {Icons.shield(14)} Tus datos solo se usan para confirmar la reserva.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <CSButton variant="ghost">Cancelar</CSButton>
              <CSButton variant="primary" size="lg" icon={Icons.arrowRight(14)} style={{ flexDirection: 'row-reverse' }}>Enviar reserva</CSButton>
            </div>
          </div>
        </CSCard>
      </div>
    </div>
  );
}

// Confirmation modal -> WhatsApp
function PublicConfirmationMobile() {
  const stand = STANDS.find(s => s.id === 'S07') || STANDS[6];
  const tier = TIERS[stand.tier];
  return (
    <div className="cs-screen" style={{ height: '100%', background: 'rgba(20,18,16,0.5)', position: 'relative', display: 'flex', alignItems: 'center', padding: 20 }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '32px 24px 24px',
        width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: STATUS.available.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: STATUS.available.color }}>
          {Icons.check(28)}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4, textAlign: 'center', marginTop: 16 }}>¡Solicitud recibida!</div>
        <div style={{ fontSize: 14, color: T.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>
          Tu reserva del stand <strong style={{ color: T.text }}>{stand.id}</strong> está <strong style={{ color: T.pending }}>por confirmar</strong>.
          Te contactaremos por WhatsApp para finalizar.
        </div>

        <div style={{ marginTop: 20, padding: 14, background: T.surface, borderRadius: T.r2, border: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span style={{ color: T.textMuted }}>Stand</span><span style={{ fontWeight: 600 }}>{stand.id} · {tier.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span style={{ color: T.textMuted }}>Solicitante</span><span style={{ fontWeight: 600 }}>María González</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: T.textMuted }}>Total a pagar</span><span style={{ fontWeight: 700 }}>${tier.price} USD</span>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <CSButton variant="whatsapp" size="lg" full icon={Icons.whatsapp(18)}>Continuar en WhatsApp</CSButton>
          <CSButton variant="ghost" full style={{ marginTop: 8 }}>Volver al mapa</CSButton>
        </div>
      </div>
    </div>
  );
}

window.PublicMapMobile = PublicMapMobile;
window.PublicMapDesktop = PublicMapDesktop;
window.PublicStandDetailMobile = PublicStandDetailMobile;
window.PublicFormMobile = PublicFormMobile;
window.PublicFormDesktop = PublicFormDesktop;
window.PublicConfirmationMobile = PublicConfirmationMobile;
