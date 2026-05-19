import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../../theme/tokens';
import { CSCard, CSButton, CSInput, CSField, Icons, CSLogo } from '../../components/UI';
import { signIn } from '../../api/api';

export function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      // Mark this tab as the active admin session
      sessionStorage.setItem('admin_tab_active', '1');
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.surface2 }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32, position: 'relative' }}>
          <button onClick={() => navigate('/', { replace: true })} style={{
            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: 'none', color: T.textMuted,
            fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: T.font,
            padding: '4px 8px', borderRadius: T.r1,
          }}>
            <Icons.ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
            Volver
          </button>
          <img src="/logo.png" alt="Logo" style={{ height: 64, objectFit: 'contain' }} />
        </div>
        
        <CSCard padding={32}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: -0.5 }}>Iniciar Sesión</h1>
          <p style={{ color: T.textMuted, fontSize: 14, marginBottom: 24 }}>Acceso exclusivo para administradores.</p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <CSField label="Correo electrónico" error={error}>
              <CSInput 
                type="email" 
                placeholder="admin@ejemplo.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                required
              />
            </CSField>
            
            <CSField label="Contraseña">
              <CSInput 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                required
              />
            </CSField>

            <CSButton variant="primary" full size="lg" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar al Panel'}
            </CSButton>
          </form>
        </CSCard>
        
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: T.textSubtle }}>
          &copy; 2026 Chiriquí Storage — Gestión de Reservas
        </p>
      </div>
    </div>
  );
}
