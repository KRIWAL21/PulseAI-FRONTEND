/**
 * App.tsx — Application root
 *
 * PROVIDER HIERARCHY (outermost first):
 * 1. ErrorBoundary    → Catches any React crash tree-wide
 * 2. ToastProvider    → Global notification system available everywhere
 * 3. AuthProvider     → Firebase auth state
 * 4. ChatProvider     → Chat state (depends on AuthProvider for user.uid)
 * 5. Router + Routes  → Page routing
 *
 * WHY THIS ORDER?
 * - ChatProvider uses useAuth(), so AuthProvider must wrap it
 * - ToastProvider must wrap everything so any component can call useToast()
 * - ErrorBoundary wraps everything so it can catch errors from any provider
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashBoardPage';
import Spinner from './components/common/Spinner';
import Toast from './components/common/Toast';

function AppRoutes() {
  const { user, isLoading } = useAuth();

  // Wait until auth is resolved before routing to avoid flicker
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: '1rem',
          background: 'var(--bg-base)',
        }}
      >
        <Spinner size={36} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Loading PulseAI...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Toast overlay — rendered at app root so it appears above everything */}
      <Toast />

      <Routes>
        <Route
          path="/auth"
          element={!user ? <AuthPage /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/dashboard"
          element={user ? <DashboardPage /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="*"
          element={<Navigate to={user ? '/dashboard' : '/auth'} replace />}
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
