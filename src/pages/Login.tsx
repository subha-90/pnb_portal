import React from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();

  return (
    <div 
      style={{ 
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa'
      }}
    >
      <div 
        style={{ 
          backgroundColor: 'white',
          padding: '48px',
          borderRadius: '12px',
          border: '1px solid #eee',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        <img 
          src="/pnb_logo.png" 
          alt="PNB Logo" 
          style={{ width: '180px', height: 'auto', marginBottom: '32px' }} 
        />
        
        <h1 style={{ color: '#1A1A1A', fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
          Merchant Portal
        </h1>
        
        <p style={{ color: '#666', marginBottom: '40px', fontSize: '13px', lineHeight: 1.5 }}>
          Login to manage your business transactions and Soundbox alerts.
        </p>

        <button
          onClick={() => login()}
          style={{ 
            width: '100%', 
            backgroundColor: '#A01E35', 
            color: 'white',
            fontSize: '14px',
            fontWeight: '700',
            padding: '14px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <LogIn size={18} />
          Sign in with PNB Admin
        </button>

        <p style={{ marginTop: '32px', color: '#999', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Punjab National Bank
        </p>
      </div>
    </div>
  );
};

export default Login;
