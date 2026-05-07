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
      background: 'linear-gradient(135deg, #1A1816 0%, #332F2B 100%)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '40%', background: T.accent, opacity: 0.15, filter: 'blur(100px)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '40%', height: '40%', background: T.tierA, opacity: 0.1, filter: 'blur(100px)', borderRadius: '50%' }} />

      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <CSLogo size={32} color="#fff" />
        </div>
        
        <CSCard style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: 40, borderRadius: 32 }}>
          <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 700, margin: '0 0 8px 0', letterSpacing: -1 }}>{t.welcome}</h1>
          <p style={{ color: '#9A968E', fontSize: 16, margin: '0 0 32px 0', lineHeight: 1.5 }}>{t.selectLanguage}</p>

          <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
            <button 
              onClick={() => setLang('es')}
              style={{ 
                flex: 1, padding: '16px', borderRadius: 16, border: `2px solid ${lang === 'es' ? T.accent : 'rgba(255,255,255,0.1)'}`,
                background: lang === 'es' ? T.accentSoft + '10' : 'transparent', color: lang === 'es' ? '#fff' : '#9A968E',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
              }}>
              Español
            </button>
            <button 
              onClick={() => setLang('en')}
              style={{ 
                flex: 1, padding: '16px', borderRadius: 16, border: `2px solid ${lang === 'en' ? T.accent : 'rgba(255,255,255,0.1)'}`,
                background: lang === 'en' ? T.accentSoft + '10' : 'transparent', color: lang === 'en' ? '#fff' : '#9A968E',
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
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, color: 'rgba(255,255,255,0.4)', fontSize: 13,
              fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: T.font,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            {t.admin}
          </button>
        </CSCard>
        
        <div style={{ marginTop: 32, fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
          {t.footer}
        </div>
      </div>
    </div>
  );
}
