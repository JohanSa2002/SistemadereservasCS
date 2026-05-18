import React, { useState } from 'react';
import { T } from '../../theme/tokens';
import { CSCard, CSButton, CSInput, CSField, Icons, CSBadge } from '../../components/UI';
import { createReservation } from '../../api/api';
import { useIsMobile } from '../../hooks/useIsMobile';

export function ReservationFlow({ lang, stand, onBack }) {
  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    celular: '',
    correo: '',
    metodo_pago: 'efectivo',
  });
  const [pagoTipo, setPagoTipo] = useState('total');
  const [pagoMonto, setPagoMonto] = useState('');

  const t = {
    es: {
      back: 'Volver al mapa',
      step2: 'Paso 2 de 3',
      title: 'Tus Datos',
      subtitle: 'Completa el formulario para solicitar la reserva.',
      name: 'Nombre completo',
      id: 'Cédula',
      phone: 'Celular',
      email: 'Correo electrónico',
      namePlaceholder: 'Ej. María González',
      idPlaceholder: '8-000-0000',
      phonePlaceholder: '+507 6000-0000',
      emailPlaceholder: 'maria@ejemplo.com',
      summary: 'Resumen de Reserva',
      price: 'Precio',
      disclaimer: '* Al enviar la solicitud, el stand quedará marcado como "Pendiente" por 24 horas mientras se valida el pago.',
      paymentMethod: 'Método de pago',
      cash: 'Efectivo',
      paymentType: 'Tipo de pago',
      paymentTotal: 'Pago total',
      paymentAbono: 'Abono',
      paymentAmount: 'Monto a pagar',
      paymentPending: 'Pendiente',
      submit: 'Enviar solicitud',
      successTitle: '¡Solicitud enviada!',
      successMsg: 'Hemos recibido tu solicitud para el stand',
      successNext: 'Un asesor te contactará por WhatsApp para validar tus datos y coordinar el pago.',
      whatsapp: 'Continuar en WhatsApp',
      backToStart: 'Volver al inicio',
    },
    en: {
      back: 'Back to map',
      step2: 'Step 2 of 3',
      title: 'Your Details',
      subtitle: 'Complete the form to request your reservation.',
      name: 'Full name',
      id: 'ID Number',
      phone: 'Phone number',
      email: 'Email address',
      namePlaceholder: 'e.g. John Smith',
      idPlaceholder: '0-000-0000',
      phonePlaceholder: '+1 000-000-0000',
      emailPlaceholder: 'john@example.com',
      summary: 'Reservation Summary',
      price: 'Price',
      disclaimer: '* Once submitted, the stand will be marked as "Pending" for 24 hours while payment is validated.',
      paymentMethod: 'Payment method',
      cash: 'Cash',
      paymentType: 'Payment type',
      paymentTotal: 'Full payment',
      paymentAbono: 'Partial payment',
      paymentAmount: 'Amount to pay',
      paymentPending: 'Remaining',
      submit: 'Send request',
      successTitle: 'Request sent!',
      successMsg: 'We have received your request for stand',
      successNext: 'An advisor will contact you via WhatsApp to validate your details and coordinate payment.',
      whatsapp: 'Continue on WhatsApp',
      backToStart: 'Back to start',
    }
  }[lang];

  function buildWhatsAppURL() {
    const tierNombre = stand.tiers?.nombre ?? '';
    const metodo     = formData.metodo_pago === 'yappi' ? 'Yappi' : t.cash;
    const precio     = stand.tiers?.precio ?? 0;
    const monto      = pagoTipo === 'total' ? precio : Number(pagoMonto);
    const pendiente  = precio - monto;

    const pagoLineaEs = pagoTipo === 'total'
      ? `*Tipo de pago:* Pago total — $${monto} USD`
      : `*Tipo de pago:* Abono — $${monto} USD (pendiente: $${pendiente} USD)`;
    const pagoLineaEn = pagoTipo === 'total'
      ? `*Payment type:* Full payment — $${monto} USD`
      : `*Payment type:* Partial payment — $${monto} USD (remaining: $${pendiente} USD)`;

    const msg = lang === 'es'
      ? `*Nueva Solicitud de Reserva*\n\n` +
        `*Stand:* ${stand.nombre} (${tierNombre})\n` +
        `*Precio total:* $${precio} USD\n` +
        `*Método de pago:* ${metodo}\n` +
        `${pagoLineaEs}\n\n` +
        `*Datos del solicitante:*\n` +
        `- Nombre: ${formData.nombre}\n` +
        `- Cédula: ${formData.cedula}\n` +
        `- Celular: ${formData.celular}\n` +
        `- Correo: ${formData.correo}`
      : `*New Reservation Request*\n\n` +
        `*Stand:* ${stand.nombre} (${tierNombre})\n` +
        `*Total price:* $${precio} USD\n` +
        `*Payment method:* ${metodo}\n` +
        `${pagoLineaEn}\n\n` +
        `*Applicant details:*\n` +
        `- Name: ${formData.nombre}\n` +
        `- ID: ${formData.cedula}\n` +
        `- Phone: ${formData.celular}\n` +
        `- Email: ${formData.correo}`;
    return `https://wa.me/50768094813?text=${encodeURIComponent(msg)}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await createReservation({
        stand_id: stand.id,
        ...formData,
        pago_tipo:  pagoTipo === 'total' ? 'completo' : 'abono',
        pago_monto: pagoTipo === 'total' ? null : (Number(pagoMonto) || null),
      });
      window.open(buildWhatsAppURL(), '_blank');
      setStep('success');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  const isMobile = useIsMobile();

  if (step === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? 16 : 24 }}>
        <CSCard style={{ maxWidth: 440, textAlign: 'center', padding: isMobile ? 24 : 40 }} className="animate-fade-in">
          <div style={{ width: 72, height: 72, borderRadius: 36, background: T.availableSoft, color: T.available, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Icons.Check size={36} />
          </div>
          <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, margin: '0 0 12px 0' }}>{t.successTitle}</h1>
          <p style={{ color: T.textMuted, lineHeight: 1.6, marginBottom: 28, fontSize: isMobile ? 14 : 16 }}>
            {t.successMsg} <strong>{stand.nombre}</strong>. {t.successNext}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <CSButton variant="primary" size="lg" full onClick={() => window.location.reload()}>{t.backToStart}</CSButton>
          </div>
        </CSCard>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: T.surface, padding: isMobile ? '20px 16px' : '40px 24px', overflowY: 'auto' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: 8, color: T.textMuted, fontWeight: 600, cursor: 'pointer', marginBottom: 24, minHeight: 44, padding: '0 4px' }}>
          <Icons.ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
          {t.back}
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 240px', gap: isMobile ? 20 : 32, alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{t.step2}</div>
            <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px 0' }}>{t.title}</h1>
            <p style={{ color: T.textMuted, margin: '0 0 32px 0' }}>{t.subtitle}</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <CSField label={t.name} required>
                <CSInput icon={<Icons.User size={16} />} placeholder={t.namePlaceholder} value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
              </CSField>
              <CSField label={t.id} required>
                <CSInput icon={<Icons.CreditCard size={16} />} placeholder={t.idPlaceholder} value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} required />
              </CSField>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                <CSField label={t.phone} required>
                  <CSInput icon={<Icons.Phone size={16} />} placeholder={t.phonePlaceholder} value={formData.celular} onChange={e => setFormData({...formData, celular: e.target.value})} required />
                </CSField>
                <CSField label={t.email} required>
                  <CSInput icon={<Icons.Mail size={16} />} placeholder={t.emailPlaceholder} type="email" value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} required />
                </CSField>
              </div>
              <CSField label={t.paymentMethod}>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  {['efectivo', 'yappi'].map(method => {
                    const active = formData.metodo_pago === method;
                    const label = method === 'efectivo' ? t.cash : 'Yappi';
                    return (
                      <label key={method} style={{
                        flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 16px', borderRadius: T.r2, cursor: 'pointer',
                        border: `2px solid ${active ? T.accent : T.border}`,
                        background: active ? T.accentSoft : '#fff',
                        transition: 'all 0.15s',
                      }}>
                        <input
                          type="radio"
                          name="metodo_pago"
                          value={method}
                          checked={active}
                          onChange={() => setFormData({ ...formData, metodo_pago: method })}
                          style={{ accentColor: T.accent, width: 16, height: 16 }}
                        />
                        <span style={{ fontWeight: 600, fontSize: 14, color: active ? T.accentDark : T.text }}>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </CSField>

              {/* Tipo de pago */}
              <CSField label={t.paymentType}>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  {[{ val: 'total', label: t.paymentTotal }, { val: 'abono', label: t.paymentAbono }].map(({ val, label }) => {
                    const active = pagoTipo === val;
                    return (
                      <label key={val} style={{
                        flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 16px', borderRadius: T.r2, cursor: 'pointer',
                        border: `2px solid ${active ? T.accent : T.border}`,
                        background: active ? T.accentSoft : '#fff',
                        transition: 'all 0.15s',
                      }}>
                        <input
                          type="radio" name="pagoTipo" value={val}
                          checked={active}
                          onChange={() => {
                            setPagoTipo(val);
                            if (val === 'total') setPagoMonto('');
                          }}
                          style={{ accentColor: T.accent, width: 16, height: 16 }}
                        />
                        <span style={{ fontWeight: 600, fontSize: 14, color: active ? T.accentDark : T.text }}>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </CSField>

              {pagoTipo === 'abono' && (
                <CSField label={t.paymentAmount}>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                      fontWeight: 600, color: T.textMuted, fontSize: 14, pointerEvents: 'none',
                    }}>$</span>
                    <CSInput
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      value={pagoMonto}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                        setPagoMonto(val);
                      }}
                      style={{ paddingLeft: 28 }}
                      required
                    />
                  </div>
                  {Number(pagoMonto) > 0 && (
                    <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>
                      {t.paymentPending}: ${(stand.tiers?.precio ?? 0) - Number(pagoMonto)} USD
                    </div>
                  )}
                </CSField>
              )}

              <div style={{ marginTop: 12 }}>
                <CSButton
                  variant="primary" size="lg" full
                  disabled={loading || (pagoTipo === 'abono' && (!pagoMonto || Number(pagoMonto) <= 0))}
                >
                  {loading ? '...' : t.submit}
                </CSButton>
              </div>
            </form>
          </div>

          <CSCard padding={24} style={{ border: `1px solid ${T.accentBorder}`, background: T.accentSoft + '40' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, marginBottom: 16 }}>{t.summary}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 20, fontWeight: 700 }}>Stand {stand.nombre.split(' ')[1]}</span>
                <CSBadge tier={stand.tier}>{stand.tiers?.nombre}</CSBadge>
              </div>
              <div style={{ padding: '12px 0', borderTop: `1px solid ${T.accentBorder}`, borderBottom: `1px solid ${T.accentBorder}`, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: T.textMuted }}>{t.price}</span>
                <span style={{ fontWeight: 700 }}>${stand.tiers?.precio} USD</span>
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>
                {t.disclaimer}
              </div>
            </div>
          </CSCard>
        </div>
      </div>
    </div>
  );
}
