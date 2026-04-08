import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  ChevronDown,
  CircleDot
} from 'lucide-react';
import { useVpa } from '../context/VpaContext.tsx';
import { apiService } from '../services/apiService.ts';

const Dashboard: React.FC = () => {
  const { vpaList, selectedVpa, setSelectedVpa, loading: vpaGlobalLoading, refreshVpas } = useVpa();
  const [deviceStatus, setDeviceStatus] = useState<{ online: boolean; loading: boolean }>({ online: false, loading: false });
  const [showVpaModal, setShowVpaModal] = useState(false);
  const [modalSelectedVpaId, setModalSelectedVpaId] = useState('');
  
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('Today');

  // Fetch VPAs on mount as per Documentation flow
  useEffect(() => {
    refreshVpas();
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      // Use serial_number (14 digits) for getDeviceStatus
      if (!selectedVpa?.serial_number) return;
      setDeviceStatus(prev => ({ ...prev, loading: true }));
      try {
        const res = await apiService.getDeviceStatus(selectedVpa.serial_number);
        // API returns detailed object, check for 'ONLINE' status or responseCode
        const isOnline = res.data?.data?.status === 'ONLINE' || 
                         res.data?.status === 'SUCCESS' || 
                         res.data?.responseCode === '00';
        setDeviceStatus({ online: isOnline, loading: false });
      } catch (err) {
        console.error('Device Status Error:', err);
        setDeviceStatus({ online: false, loading: false });
      }
    };
    fetchStatus();
  }, [selectedVpa]);

  // Sync modal state when selectedVpa changes
  useEffect(() => {
    if (selectedVpa) {
      setModalSelectedVpaId(selectedVpa.vpa_id);
    }
  }, [selectedVpa]);

  if (vpaGlobalLoading && !selectedVpa) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Loading your data...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: '#f8f9fa' }}>
      {/* Top Seamless White Section */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '32px 32px 24px 32px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1A1A1A' }}>
            Dashboard
          </h1>
        
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              {/* VPA Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>VPA ID :</span>
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '6px 12px', 
                    backgroundColor: 'white', 
                    border: '1px solid #E6E6E6', 
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#333'
                  }}
                  onClick={() => setShowVpaModal(true)}
                >
                  <span>{selectedVpa?.vpa_id || 'Select VPA'}</span> <ChevronDown size={14} color="#999" />
                </div>
              </div>

              {/* Soundbox Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>Soundbox Status :</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: deviceStatus.loading ? '#ccc' : (deviceStatus.online ? '#22C55E' : '#888') 
                  }} />
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '700', 
                    color: deviceStatus.loading ? '#ccc' : (deviceStatus.online ? '#22C55E' : '#888') 
                  }}>
                    {deviceStatus.loading ? 'Checking...' : (deviceStatus.online ? 'Online' : 'Offline')}
                  </span>
                </div>
              </div>
            </div>
            
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '6px 12px', 
                  backgroundColor: 'white', 
                  border: '1px solid #E6E6E6', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#333',
                  cursor: 'pointer',
                  minWidth: '100px',
                  justifyContent: 'space-between'
                }}
              >
                <span>{selectedDate}</span> <ChevronDown size={14} color="#999" />
              </button>
              
              {isDateDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: 'white',
                  border: '1px solid #E6E6E6',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  zIndex: 100,
                  width: '140px',
                  padding: '4px 0',
                  overflow: 'hidden'
                }}>
                  {['Today', 'Yesterday'].map((dateOpt) => (
                    <div 
                      key={dateOpt}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        fontSize: '12px',
                        color: '#333',
                        cursor: 'pointer',
                        backgroundColor: selectedDate === dateOpt ? '#EAF3FA' : 'transparent',
                      }}
                      onClick={() => {
                        setSelectedDate(dateOpt);
                        setIsDateDropdownOpen(false);
                      }}
                    >
                      <div style={{ 
                        width: '14px', height: '14px', 
                        borderRadius: '50%', 
                        border: `2px solid ${selectedDate === dateOpt ? '#A01E35' : '#ccc'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {selectedDate === dateOpt && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#A01E35' }} />}
                      </div>
                      {dateOpt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Summary Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              border: '1px solid #eaeaea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '6px', 
                  backgroundColor: '#F0F3FF', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#156DC4'
                }}>
                  <ArrowLeftRight size={16} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#444' }}>Total No Of Transaction</span>
              </div>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#1A1A1A' }}>0</span>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              border: '1px solid #eaeaea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '6px', 
                  backgroundColor: '#FFF0F0', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#A01E35'
                }}>
                  <CircleDot size={16} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#444' }}>Total Amount</span>
              </div>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#1A1A1A' }}>₹ 0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '32px' }}>
        {/* You can add transaction tables or charts here later */}
      </div>

      {/* Select VPA Modal */}
      {showVpaModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '420px',
            maxWidth: '90%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#333' }}>Select VPA</h2>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '13px', color: '#666', margin: '0 0 16px 0' }}>Select a VPA to Proceed</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                {vpaList.map((vpa, idx) => (
                  <label 
                    key={idx} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      border: '1px solid #eee',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      borderColor: modalSelectedVpaId === vpa.vpa_id ? '#A01E35' : '#eee'
                    }}
                    onClick={() => setModalSelectedVpaId(vpa.vpa_id)}
                  >
                    <div style={{ 
                      width: '18px', height: '18px', 
                      borderRadius: '50%', 
                      border: `2px solid ${modalSelectedVpaId === vpa.vpa_id ? '#A01E35' : '#ccc'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {modalSelectedVpaId === vpa.vpa_id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#A01E35' }} />}
                    </div>
                    <span style={{ fontSize: '13px', color: '#333' }}>{vpa.vpa_id}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f0f0f0' }}>
              <button 
                onClick={() => setShowVpaModal(false)}
                style={{
                  padding: '8px 20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#666',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
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
                onClick={() => {
                  const newSelected = vpaList.find(v => v.vpa_id === modalSelectedVpaId);
                  if (newSelected) setSelectedVpa(newSelected);
                  setShowVpaModal(false);
                }}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
