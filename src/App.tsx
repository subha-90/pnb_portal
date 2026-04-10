import { type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import Layout from './components/Layout.tsx';
import Login from './pages/Login.tsx';
import RedirectHandler from './pages/RedirectHandler.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Reports from './pages/Reports.tsx';
import Soundbox from './pages/Soundbox.tsx';
import QRCodePage from './pages/QRCodePage.tsx';
import Support from './pages/Support.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #800000', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

import { VpaProvider } from './context/VpaContext.tsx';

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <VpaProvider>
            <Routes>
              {/* ... routes ... */}
              <Route path="/login" element={<Login />} />
              <Route path="/redirected" element={<RedirectHandler />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/reports" element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } />
              
              <Route path="/soundbox" element={
                <ProtectedRoute>
                  <Soundbox />
                </ProtectedRoute>
              } />
              
              <Route path="/qr" element={
                <ProtectedRoute>
                  <QRCodePage />
                </ProtectedRoute>
              } />
              
              <Route path="/support" element={
                <ProtectedRoute>
                  <Support />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </VpaProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}


export default App;
