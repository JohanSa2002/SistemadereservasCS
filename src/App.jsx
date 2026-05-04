import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getSession, onAuthStateChange } from './api/api';

// Admin Screens
import { AdminLayout } from './screens/admin/AdminLayout';
import { Dashboard } from './screens/admin/Dashboard';
import { AdminMap } from './screens/admin/AdminMap';
import { Tiers } from './screens/admin/Tiers';
import { Login } from './screens/admin/Login';

// Public Screens
import { Welcome } from './screens/public/Welcome';
import { PublicMap } from './screens/public/PublicMap';
import { ReservationFlow } from './screens/public/ReservationFlow';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('es');
  const [publicStep, setPublicStep] = useState('welcome'); // 'welcome' | 'map' | 'form'
  const [selectedStand, setSelectedStand] = useState(null);

  useEffect(() => {
    getSession().then(({ session }) => {
      setSession(session);
      setLoading(false);
    });

    const { subscription } = onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  const PublicView = () => {
    if (publicStep === 'welcome') {
      return <Welcome lang={lang} setLang={setLang} onStart={() => setPublicStep('map')} />;
    }
    if (publicStep === 'map') {
      return <PublicMap lang={lang} onSelectStand={(stand) => { setSelectedStand(stand); setPublicStep('form'); }} />;
    }
    if (publicStep === 'form') {
      return <ReservationFlow lang={lang} stand={selectedStand} onBack={() => setPublicStep('map')} />;
    }
    return null;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicView />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={!session ? <Login onLogin={() => {}} /> : <Navigate to="/admin" />} />
        
        <Route path="/admin" element={session ? <AdminLayout><Dashboard /></AdminLayout> : <Navigate to="/admin/login" />} />
        <Route path="/admin/map" element={session ? <AdminLayout><AdminMap /></AdminLayout> : <Navigate to="/admin/login" />} />
        <Route path="/admin/tiers" element={session ? <AdminLayout><Tiers /></AdminLayout> : <Navigate to="/admin/login" />} />
        <Route path="/admin/cycles" element={session ? <AdminLayout><div style={{padding:32}}><h1>Ciclos</h1><p>Próximamente...</p></div></AdminLayout> : <Navigate to="/admin/login" />} />
        <Route path="/admin/export" element={session ? <AdminLayout><div style={{padding:32}}><h1>Exportar</h1><p>Próximamente...</p></div></AdminLayout> : <Navigate to="/admin/login" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
