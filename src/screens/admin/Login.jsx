import React, { useState } from 'react';
import { T } from '../theme/tokens';
import { CSCard, CSButton, CSInput, CSField, Icons, CSLogo } from '../components/UI';
import { signIn } from '../api/api';

export function Login({ onLogin }) {
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <CSLogo size={24} />
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
          &copy; 2026 Standly — Gestión de Reservas
        </p>
      </div>
    </div>
  );
}
