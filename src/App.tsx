// =================================================================
// FILE: src/App.tsx (Final Version)
// =================================================================
// This is the complete, final version with routing and auth logic.

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashBoardPage';
import Spinner from './components/common/Spinner';

function App() {
  const { user, loading } = useAuth();

  // Show a loading spinner while Firebase checks the auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Spinner />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* If the user is not logged in, show the AuthPage. Otherwise, redirect to the dashboard. */}
        <Route 
          path="/auth" 
          element={!user ? <AuthPage /> : <Navigate to="/dashboard" />} 
        />
        
        {/* If the user is logged in, show the DashboardPage. Otherwise, redirect to the auth page. */}
        <Route 
          path="/dashboard" 
          element={user ? <DashboardPage /> : <Navigate to="/auth" />} 
        />
        
        {/* Any other path will redirect to the correct page based on auth state. */}
        <Route 
          path="*" 
          element={<Navigate to={user ? "/dashboard" : "/auth"} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
