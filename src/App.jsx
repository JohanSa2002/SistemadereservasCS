import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getSession, onAuthStateChange, signOut, clearLocalSession } from './api/api';

// Admin Screens
import { AdminLayout } from './screens/admin/AdminLayout';
import { Dashboard } from './screens/admin/Dashboard';
import { AdminMap } from './screens/admin/AdminMap';
import { Tiers } from './screens/admin/Tiers';
import { Cycles } from './screens/admin/Cycles';
import { Export } from './screens/admin/Export';
import { Login } from './screens/admin/Login';

// Public Screens
import { Welcome } from './screens/public/Welcome';
import { PublicMap } from './screens/public/PublicMap';
import { ReservationFlow } from './screens/public/ReservationFlow';

const ADMIN_CHANNEL_NAME = 'standly_admin_session';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('es');
  const [publicStep, setPublicStep] = useState('welcome'); // 'welcome' | 'map' | 'form'
  const [selectedStand, setSelectedStand] = useState(null);
  const sessionRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    getSession().then(async ({ session }) => {
      const tabActive = sessionStorage.getItem('admin_tab_active');
      if (session && !tabActive) {
        // Stale session from a closed tab: clear only local storage (no network call)
        // so SIGNED_OUT fires synchronously before the login page is shown,
        // preventing a race with any subsequent signIn.
        await clearLocalSession();
        sessionRef.current = null;
        setSession(null);
      } else {
        sessionRef.current = session;
        setSession(session);
      }
      setLoading(false);
    });

    const { subscription } = onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_IN') {
        // Use the same channel object so the sender is excluded from receiving it
        channelRef.current?.postMessage('NEW_LOGIN');
      }
      sessionRef.current = session;
      setSession(session);
    });

    // Kick out this tab if another tab logs in
    channelRef.current = new BroadcastChannel(ADMIN_CHANNEL_NAME);
    channelRef.current.onmessage = (e) => {
      if (e.data === 'NEW_LOGIN' && sessionRef.current) {
        sessionStorage.removeItem('admin_tab_active');
        signOut();
      }
    };

    return () => {
      subscription.unsubscribe();
      channelRef.current?.close();
    };
  }, []);

  if (loading) return null;

  const PublicView = () => {
    if (publicStep === 'welcome') {
      return <Welcome lang={lang} setLang={setLang} onStart={() => setPublicStep('map')} />;
    }
    if (publicStep === 'map') {
      return <PublicMap lang={lang} onSelectStand={(stand) => { setSelectedStand(stand); setPublicStep('form'); }} onBack={() => setPublicStep('welcome')} />;
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
        <Route path="/admin/cycles" element={session ? <AdminLayout><Cycles /></AdminLayout> : <Navigate to="/admin/login" />} />
        <Route path="/admin/export" element={session ? <AdminLayout><Export /></AdminLayout> : <Navigate to="/admin/login" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
