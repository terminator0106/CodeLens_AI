import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { RepoView } from './pages/RepoView';
import { Chat } from './pages/Chat';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { useAuthStore } from './store';
import { api } from './services/api';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  if (isAuthLoading) {
    return null;
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
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

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

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