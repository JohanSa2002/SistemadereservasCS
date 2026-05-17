import React from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../../theme/tokens';
import { CSCard, CSButton, CSLogo } from '../../components/UI';

export function Welcome({ lang, setLang, onStart }) {
  const navigate = useNavigate();
  const content = {
    es: {
      welcome: 'Bienvenido',
      selectLanguage: 'Selecciona tu idioma para continuar',
      start: 'Comenzar reserva',
      admin: 'Acceso Administrador',
      footer: 'Expo Emprende · Chiriquistorage',
    },
    en: {
      welcome: 'Welcome',
      selectLanguage: 'Select your language to continue',
      start: 'Start reservation',
      admin: 'Admin Access',
      footer: 'Expo Emprende · Chiriquistorage',
    }
  };

  const t = content[lang];

  return (
    <div style={{ 
      height: '100vh', 
      background: '#FFFFFF', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <img src="/logo.png" alt="Chiriqui Storage" style={{ height: 160, objectFit: 'contain' }} />
        </div>
        
        <CSCard style={{ background: '#FFFFFF', border: `1px solid ${T.border}`, padding: 40, borderRadius: 32, boxShadow: T.shadow1 }}>
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
        
        <div style={{ marginTop: 32, fontSize: 12, color: T.textSubtle, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
          {t.footer}
        </div>
      </div>
    </div>
  );
}
