import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userManager } from '../services/authService';

const RedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const callbackProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (callbackProcessed.current) return;

    userManager.getUser().then(user => {
      if (user) {
        // User already authenticated (likely from a previous successful callback)
        navigate('/', { replace: true });
        return;
      }

      callbackProcessed.current = true;
      userManager.signinCallback()
        .then(() => {
          navigate('/', { replace: true });
        })
        .catch((err) => {
          console.error('Error handling redirect', err);
          // If we're already logged in, navigate to home even on callback error
          userManager.getUser().then(u => {
            if (u) navigate('/', { replace: true });
            else navigate('/login', { replace: true });
          });
        });
    });
  }, [navigate]);

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
      <div style={{ textAlign: 'center' }}>
        <img 
          src="https://tcyhqzciwptrulwbkuoy.supabase.co/storage/v1/object/public/SDUI_IMAGE/topbar_logo.png" 
          alt="PNB Logo" 
          style={{ height: '80px', marginBottom: '32px' }} 
        />
        <h2 style={{ color: '#800000', fontSize: '2rem', fontWeight: '800', margin: 0 }}>Processing Login</h2>
        <p style={{ color: '#6c757d', marginTop: '12px', fontSize: '16px' }}>Please wait while we secure your session...</p>
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '4px solid #f3f3f3', 
            borderTop: '4px solid #800000', 
            borderRadius: '50%', 
            animation: 'spin 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite' 
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default RedirectHandler;
