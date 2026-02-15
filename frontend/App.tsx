import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { RepoView } from './pages/RepoView';
import { Chat } from './pages/Chat';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Products } from './pages/Products';
import { Solutions } from './pages/Solutions';
import { Pricing } from './pages/Pricing';
import { Docs } from './pages/Docs';
import { useAuthStore, useUIStore } from './store';
import { api } from './services/api';
import { AuthModal } from './components/ui/AuthModal';
import { ScrollToTop } from './components/layout/ScrollToTop';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const openAuthModal = useUIStore((state) => state.openAuthModal);
  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated && !hasOpened) {
      openAuthModal('login');
      setHasOpened(true);
    }
  }, [isAuthLoading, isAuthenticated, hasOpened, openAuthModal]);

  if (isAuthLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const setAuthLoading = useAuthStore((state) => state.setAuthLoading);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const user = await api.getMe();
        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    loadMe();
  }, [setUser, setAuthLoading]);

  // Ensure dark mode is always applied
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <AuthModal />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/products" element={<Products />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/docs" element={<Docs />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/repo/:id" element={
          <ProtectedRoute>
            <RepoView />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}