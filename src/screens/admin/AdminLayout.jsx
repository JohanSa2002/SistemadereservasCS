import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { T } from '../../theme/tokens';
import { CSLogo, Icons } from '../../components/UI';
import { LayoutDashboard, Map as MapIcon, Layers, Calendar, FileText, LogOut } from 'lucide-react';
import { signOut } from '../../api/api';

export function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Resumen', path: '/admin', icon: LayoutDashboard },
    { id: 'map', label: 'Mapa', path: '/admin/map', icon: MapIcon },
    { id: 'tiers', label: 'Categorías', path: '/admin/tiers', icon: Layers },
    { id: 'cycles', label: 'Eventos', path: '/admin/cycles', icon: Calendar },
    { id: 'export', label: 'Exportar', path: '/admin/export', icon: FileText },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.surface }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: '#fff', borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', padding: 20 }}>
        <div style={{ marginBottom: 32 }}>
          <CSLogo size={18} />
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuItems.map(item => {
            const active = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: T.r2, border: 'none',
                  background: active ? T.accentSoft : 'transparent',
                  color: active ? T.accentDark : T.text,
                  fontWeight: active ? 600 : 500,
                  fontSize: 14, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s'
                }}>
                <Icon size={18} opacity={active ? 1 : 0.6} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
          <div style={{ padding: '0 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Admin User</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>admin@standly.pa</div>
          </div>
          <button
            onClick={() => { navigate('/'); signOut(); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: T.r2, border: 'none',
              background: 'transparent', color: T.reserved, fontWeight: 600,
              fontSize: 14, cursor: 'pointer'
            }}>
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {children}
      </main>
    </div>
  );
}
