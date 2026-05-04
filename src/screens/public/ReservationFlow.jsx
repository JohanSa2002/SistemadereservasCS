import React, { useState } from 'react';
import { T } from '../../theme/tokens';
import { CSCard, CSButton, CSInput, CSField, Icons, CSBadge } from '../../components/UI';
import { createReservation } from '../../api/api';

export function ReservationFlow({ lang, stand, onBack }) {
  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    celular: '',
    correo: ''
  });

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
      submit: 'Enviar solicitud',
      successTitle: '¡Solicitud enviada!',
      successMsg: 'Hemos recibido tu solicitud para el stand',
      successNext: 'Un asesor te contactará por WhatsApp para validar tus datos y coordinar el pago.',
      whatsapp: 'Continuar en WhatsApp',
      backToStart: 'Volver al inicio'
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
      submit: 'Send request',
      successTitle: 'Request sent!',
      successMsg: 'We have received your request for stand',
      successNext: 'An advisor will contact you via WhatsApp to validate your details and coordinate payment.',
      whatsapp: 'Continue on WhatsApp',
      backToStart: 'Back to start'
    }
  }[lang];

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await createReservation({
        stand_id: stand.id,
        ...formData
      });
      setStep('success');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (step === 'success') {
    return (
      <div style={{ height: '100vh', background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <CSCard style={{ maxWidth: 440, textAlign: 'center', padding: 40 }} className="animate-fade-in">
          <div style={{ width: 80, height: 80, borderRadius: 40, background: T.availableSoft, color: T.available, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Icons.Check size={40} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px 0' }}>{t.successTitle}</h1>
          <p style={{ color: T.textMuted, lineHeight: 1.6, marginBottom: 32 }}>
            {t.successMsg} <strong>{stand.nombre}</strong>. {t.successNext}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <CSButton variant="whatsapp" size="lg" full icon={<Icons.Phone size={18} />}>{t.whatsapp}</CSButton>
            <CSButton variant="ghost" full onClick={() => window.location.reload()}>{t.backToStart}</CSButton>
          </div>
        </CSCard>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', background: T.surface, padding: '40px 24px', overflowY: 'auto' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: 8, color: T.textMuted, fontWeight: 600, cursor: 'pointer', marginBottom: 24 }}>
          <Icons.ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
          {t.back}
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 32, alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{t.step2}</div>
            <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px 0' }}>{t.title}</h1>
            <p style={{ color: T.textMuted, margin: '0 0 32px 0' }}>{t.subtitle}</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <CSField label={t.name} required>
                <CSInput icon={<Icons.User size={16} />} placeholder="Ej. María González" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
              </CSField>
              <CSField label={t.id} required>
                <CSInput icon={<Icons.CreditCard size={16} />} placeholder="8-000-0000" value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} required />
              </CSField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <CSField label={t.phone} required>
                  <CSInput icon={<Icons.Phone size={16} />} placeholder="+507 6000-0000" value={formData.celular} onChange={e => setFormData({...formData, celular: e.target.value})} required />
                </CSField>
                <CSField label={t.email} required>
                  <CSInput icon={<Icons.Mail size={16} />} placeholder="maria@ejemplo.com" type="email" value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} required />
                </CSField>
              </div>
              <div style={{ marginTop: 12 }}>
                <CSButton variant="primary" size="lg" full disabled={loading}>{loading ? '...' : t.submit}</CSButton>
              </div>
            </form>
          </div>

          <CSCard padding={24} style={{ border: `1px solid ${T.accentBorder}`, background: T.accentSoft + '40' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, marginBottom: 16 }}>Resumen de Reserva</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 20, fontWeight: 700 }}>Stand {stand.nombre.split(' ')[1]}</span>
                <CSBadge tier={stand.tier}>{stand.tiers?.nombre}</CSBadge>
              </div>
              <div style={{ padding: '12px 0', borderTop: `1px solid ${T.accentBorder}`, borderBottom: `1px solid ${T.accentBorder}`, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: T.textMuted }}>Precio</span>
                <span style={{ fontWeight: 700 }}>${stand.tiers?.precio} USD</span>
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>
                * Al enviar la solicitud, el stand quedará marcado como "Pendiente" por 24 horas mientras se valida el pago.
              </div>
            </div>
          </CSCard>
        </div>
      </div>
    </div>
  );
}
