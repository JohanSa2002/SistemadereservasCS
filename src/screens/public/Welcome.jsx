import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../../theme/tokens';
import { CSCard, CSButton, CSLogo } from '../../components/UI';
import { getActiveEvent } from '../../api/api';
import { useIsMobile } from '../../hooks/useIsMobile';

export function Welcome({ lang, setLang, onStart }) {
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    getActiveEvent().then(setEvent).catch(() => {});
  }, []);

  function fmtExpiracion(ev) {
    if (!ev?.fecha) return null;
    const fecha = new Date(ev.fecha + 'T00:00:00').toLocaleDateString(lang === 'es' ? 'es-PA' : 'en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
    const hora = ev.hora_expiracion ? ev.hora_expiracion.slice(0, 5) : null;
    return hora ? `${fecha} · ${hora}` : fecha;
  }

  const content = {
    es: {
      welcome: 'Bienvenido',
      selectLanguage: 'Selecciona tu idioma para continuar',
      start: 'Comenzar reserva',
      admin: 'Acceso Administrador',
      footer: 'Expo Emprende · Chiriquistorage',
      eventLabel: 'Evento activo',
      expires: 'Expira',
      rulesTitle: 'Reglas para vendedores',
      rules: [
        'Recomendamos reservar y pagar por adelantado en Chiriquí Storage.',
        'Pagar por adelantado facilita el flujo de tráfico en la entrada el día del mercado.',
        'Vendedores pueden ingresar de 7:30 a.m. a 9:30 a.m. para organizar. Las ventas al público son de 9:30 a.m. a 1:00 p.m.',
        'Si llega después de las 9:30 a.m., nos reservamos el derecho de revender su espacio o mesa. Al llegar, el encargado de la puerta lo asistirá; si no ha pagado, páguelo en la puerta y recibirá un recibo.',
        'Después de descargar su vehículo, estacione en el amplio patio este detrás de la propiedad o detrás del invernadero.',
        'No está permitido el expendio ni el consumo de licor y cigarrillos en las instalaciones.',
        'Este evento es con lluvia o sol; no se realizan reembolsos ni acumulaciones de un mes a otro.',
      ],
      rulesHighlight: '¡LO MÁS IMPORTANTE! ¡DIVIÉRTASE! Todos disfrutan de este evento comunitario y nos esforzamos por brindar un ambiente seguro y limpio para que usted pueda promocionar sus productos y servicios.',
    },
    en: {
      welcome: 'Welcome',
      selectLanguage: 'Select your language to continue',
      start: 'Start reservation',
      admin: 'Admin Access',
      footer: 'Expo Emprende · Chiriquistorage',
      eventLabel: 'Active event',
      expires: 'Expires',
      rulesTitle: 'Vendor Rules',
      rules: [
        'We recommend reserving and paying in advance at Chiriquí Storage.',
        'Paying in advance helps facilitate traffic flow at the entrance on market day.',
        'Vendors may enter from 7:30 a.m. to 9:30 a.m. to set up. Sales to the public are from 9:30 a.m. to 1:00 p.m.',
        'If you arrive after 9:30 a.m., we reserve the right to resell your space or table. Upon arrival, the door attendant will assist you; if you have not paid, please pay at the door and you will receive a receipt.',
        'After unloading your vehicle, please park in the large east patio behind the property or behind the greenhouse.',
        'The sale or consumption of alcohol and cigarettes on the premises is not permitted.',
        'This event takes place rain or shine; no refunds or rollovers from one month to the next.',
      ],
      rulesHighlight: 'MOST IMPORTANTLY — HAVE FUN! Everyone enjoys this community event and we strive to provide a safe and clean environment for you to promote your products and services.',
    }
  };

  const isMobile = useIsMobile();
  const t = content[lang];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? 16 : 40,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        width: '100%',
        maxWidth: isMobile ? 440 : 920,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 24 : 32,
        alignItems: isMobile ? 'stretch' : 'flex-start',
        zIndex: 1,
      }}>
        {/* Columna izquierda: card de bienvenida */}
        <div style={{ width: isMobile ? '100%' : 400, flexShrink: 0, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: isMobile ? 12 : 20 }}>
            <img src="/logo.png" alt="Chiriqui Storage" style={{ height: isMobile ? 100 : 160, objectFit: 'contain' }} />
          </div>

          <CSCard style={{ background: '#FFFFFF', border: `1px solid ${T.border}`, padding: isMobile ? 20 : 40, borderRadius: 32, boxShadow: T.shadow1 }}>
            <h1 style={{ color: T.text, fontSize: 32, fontWeight: 700, margin: '0 0 8px 0', letterSpacing: -1 }}>{t.welcome}</h1>
            <p style={{ color: T.textMuted, fontSize: 16, margin: '0 0 32px 0', lineHeight: 1.5 }}>{t.selectLanguage}</p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
              <button
                onClick={() => setLang('es')}
                style={{
                  flex: 1, padding: '16px', borderRadius: 16, border: `2px solid ${lang === 'es' ? T.accent : T.border}`,
                  background: lang === 'es' ? T.accentSoft + '30' : '#FFFFFF', color: lang === 'es' ? T.accentDark : T.textMuted,
                  fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}>
                Español
              </button>
              <button
                onClick={() => setLang('en')}
                style={{
                  flex: 1, padding: '16px', borderRadius: 16, border: `2px solid ${lang === 'en' ? T.accent : T.border}`,
                  background: lang === 'en' ? T.accentSoft + '30' : '#FFFFFF', color: lang === 'en' ? T.accentDark : T.textMuted,
                  fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}>
                English
              </button>
            </div>

            <CSButton variant="primary" size="lg" full onClick={onStart} style={{ height: 60, fontSize: 18, borderRadius: 18 }}>
              {t.start}
            </CSButton>

            <button
              onClick={() => navigate('/admin/login', { replace: true })}
              style={{
                marginTop: 12, width: '100%', padding: '12px',
                background: 'transparent', border: `1px solid ${T.border}`,
                borderRadius: 14, color: T.textMuted, fontSize: 13,
                fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: T.font,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accentDark; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
            >
              {t.admin}
            </button>
          </CSCard>

          <div style={{ marginTop: 24, fontSize: 12, color: T.textSubtle, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
            {t.footer}
          </div>
        </div>

        {/* Columna derecha: reglamento */}
        <div style={{ flex: 1 }}>
          <CSCard style={{ background: '#FFFFFF', border: `1px solid ${T.border}`, padding: isMobile ? 20 : 32, borderRadius: 32, boxShadow: T.shadow1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              📋 {t.rulesTitle}
            </h2>
            <ol style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {t.rules.map((rule, i) => (
                <li key={i} style={{ fontSize: 13.5, lineHeight: 1.6, color: T.textMuted }}>
                  {rule}
                </li>
              ))}
            </ol>
            <div style={{
              marginTop: 20,
              padding: '14px 16px',
              borderRadius: 14,
              background: T.accentSoft,
              border: `1.5px solid ${T.accentBorder}`,
              fontSize: 13.5,
              fontWeight: 600,
              color: T.accentDark,
              lineHeight: 1.6,
            }}>
              ⭐ {t.rulesHighlight}
            </div>
          </CSCard>
        </div>
      </div>
    </div>
  );
}
