import React, { type ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  QrCode, 
  Speaker, 
  HelpCircle, 
  LogOut, 
  FileText,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVpa } from '../context/VpaContext.tsx';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { selectedVpa } = useVpa();
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    { name: 'Transaction Reports', path: '/reports', icon: <FileText size={18} /> },
    { name: 'QR Details', path: '/qr', icon: <QrCode size={18} /> },
    { name: 'Language Update', path: '/soundbox', icon: <Speaker size={18} /> },
    { name: 'Help & Support', path: '/support', icon: <HelpCircle size={18} /> },
  ];

  if (!user) return <>{children}</>;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: 'var(--bg-app)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: 'var(--sidebar-w)', 
        backgroundColor: 'white', 
        display: 'flex', 
        flexDirection: 'column', 
        zIndex: 10,
        boxShadow: '2px 0 8px rgba(0,0,0,0.02)'
      }}>
        {/* Logo Section */}
        <div style={{ 
          height: '48px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          borderBottom: '1px solid #f0f0f0',
          flexShrink: 0
        }}>
          <img 
            src="/pnb_logo.png" 
            alt="PNB Logo" 
            style={{ width: '100px', height: 'auto', objectFit: 'contain' }}
          />
        </div>
        
        <nav style={{ flex: 1, padding: '16px 16px 0', overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {menuItems.map((item) => (
              <li key={item.name} style={{ margin: '2px 14px' }}>
                <NavLink
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: '600',
                    transition: 'all 0.15s ease',
                    color: isActive ? 'white' : '#666',
                    backgroundColor: isActive ? 'var(--primary-pnb)' : 'transparent',
                  })}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div style={{ padding: '16px 14px', borderTop: '1px solid #f0f0f0' }}>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              width: '100%', 
              padding: '12px 16px', 
              borderRadius: '6px', 
              border: 'none', 
              backgroundColor: 'transparent', 
              color: '#666', 
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px'
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ 
          height: '48px', 
          backgroundColor: 'white', 
          borderBottom: '1px solid #f0f0f0',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 32px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          position: 'relative',
          zIndex: 50,
          flexShrink: 0
        }}>
           <div style={{ border: '1px solid #eee', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
             <Menu size={18} color="#666" />
           </div>
           
           <div 
             style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', position: 'relative' }}
             onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
           >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #eee' }}>
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedVpa?.merchant_name || 'MERCHANT')}&background=156DC4&color=fff`} alt="Profile" style={{ width: '100%', height: '100%' }} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#333' }}>{selectedVpa?.merchant_name || 'MERCHANT'}</span>
              
              {isProfileDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  padding: '8px 0',
                  minWidth: '150px',
                  zIndex: 200
                }}>
                  <div 
                    style={{ padding: '10px 16px', fontSize: '12px', color: '#333', cursor: 'pointer', fontWeight: '500' }}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setIsProfileDropdownOpen(false); 
                      setShowProfileModal(true); 
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    View Profile
                  </div>
                  <div 
                    style={{ padding: '10px 16px', fontSize: '12px', color: '#A01E35', cursor: 'pointer', fontWeight: '500' }}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      logout(); 
                      navigate('/login'); 
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Logout
                  </div>
                </div>
              )}
           </div>
        </header>

        {/* Profile Modal */}
        {showProfileModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px' // Guarantees it never touches edges
          }}>
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '6px',
                width: '400px',
                maxWidth: '100%',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
                <h2 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#333' }}>View Profile Details</h2>
              </div>
              
              <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'visible' }}>
                <div style={{ border: '1px solid #eaeaea', borderRadius: '4px' }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #eaeaea', backgroundColor: '#fafafa' }}>
                    <h3 style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#333' }}>Basic Information</h3>
                  </div>
                  <div style={{ padding: '12px' }}>
                     <div style={{ display: 'flex', marginBottom: '12px' }}>
                       <div style={{ flex: 1, fontSize: '10px', color: '#666' }}>Name</div>
                       <div style={{ flex: 1, fontSize: '10px', color: '#333', fontWeight: '500' }}>{selectedVpa?.merchant_name || 'MERCHANT'}</div>
                     </div>
                     <div style={{ display: 'flex' }}>
                       <div style={{ flex: 1, fontSize: '10px', color: '#666' }}>Phone</div>
                       <div style={{ flex: 1, fontSize: '10px', color: '#333', fontWeight: '500' }}>{selectedVpa?.merchant_mobile || 'N/A'}</div>
                     </div>
                  </div>
                </div>

                <div style={{ border: '1px solid #eaeaea', borderRadius: '4px' }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #eaeaea', backgroundColor: '#fafafa' }}>
                    <h3 style={{ margin: 0, fontSize: '11px', fontWeight: '700', color: '#333' }}>Device Information</h3>
                  </div>
                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                     <div style={{ display: 'flex' }}>
                       <div style={{ flex: 1, fontSize: '10px', color: '#666' }}>Device Serial Number</div>
                       <div style={{ flex: 1, fontSize: '10px', color: '#333', fontWeight: '500' }}>{selectedVpa?.serial_number || 'N/A'}</div>
                     </div>
                     <div style={{ display: 'flex' }}>
                       <div style={{ flex: 1, fontSize: '10px', color: '#666' }}>Linked Account Number</div>
                       <div style={{ flex: 1, fontSize: '10px', color: '#333', fontWeight: '500' }}>{selectedVpa?.merchant_account_no || 'N/A'}</div>
                     </div>
                     <div style={{ display: 'flex' }}>
                       <div style={{ flex: 1, fontSize: '10px', color: '#666' }}>UPI ID</div>
                       <div style={{ flex: 1, fontSize: '10px', color: '#333', fontWeight: '500' }}>{selectedVpa?.vpa_id || 'N/A'}</div>
                     </div>
                     <div style={{ display: 'flex' }}>
                       <div style={{ flex: 1, fontSize: '10px', color: '#666' }}>IFSC Code</div>
                       <div style={{ flex: 1, fontSize: '10px', color: '#333', fontWeight: '500' }}>{selectedVpa?.ifsc || 'N/A'}</div>
                     </div>
                     <div style={{ display: 'flex' }}>
                       <div style={{ flex: 1, fontSize: '10px', color: '#666' }}>Device Model Name</div>
                       <div style={{ flex: 1, fontSize: '10px', color: '#333', fontWeight: '500' }}>{'Soundbox'}</div>
                     </div>
                     <div style={{ display: 'flex' }}>
                       <div style={{ flex: 1, fontSize: '10px', color: '#666' }}>Device Mobile Number</div>
                       <div style={{ flex: 1, fontSize: '10px', color: '#333', fontWeight: '500' }}>{selectedVpa?.merchant_mobile || 'N/A'}</div>
                     </div>
                     <div style={{ display: 'flex' }}>
                       <div style={{ flex: 1, fontSize: '10px', color: '#666' }}>Network Type</div>
                       <div style={{ flex: 1, fontSize: '10px', color: '#333', fontWeight: '500' }}>{'N/A'}</div>
                     </div>
                     <div style={{ display: 'flex' }}>
                       <div style={{ flex: 1, fontSize: '10px', color: '#666' }}>Device Status</div>
                       <div style={{ flex: 1, fontSize: '10px', color: '#333', fontWeight: '500' }}>{selectedVpa?.device_status || 'N/A'}</div>
                     </div>
                      <div style={{ display: 'flex' }}>
                        <div style={{ flex: 1, fontSize: '10px', color: '#666' }}>Address</div>
                        <div style={{ flex: 1, fontSize: '10px', color: '#333', fontWeight: '500' }}>{selectedVpa?.merchant_delivery_address || 'N/A'}</div>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <div style={{ flex: 1, fontSize: '10px', color: '#666' }}>City/State</div>
                        <div style={{ flex: 1, fontSize: '10px', color: '#333', fontWeight: '500' }}>{selectedVpa?.city ? `${selectedVpa.city}, ${selectedVpa.state}` : 'N/A'}</div>
                      </div>
                  </div>
                </div>
              </div>
              
              <div style={{ padding: '10px 20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
                <button 
                  style={{
                    padding: '8px 24px',
                    backgroundColor: '#A01E35',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowProfileModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
