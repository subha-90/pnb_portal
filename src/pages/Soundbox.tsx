import React, { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useVpa } from '../context/VpaContext.tsx';
import { apiService } from '../services/apiService';
import { AlertCircle } from 'lucide-react';

const Soundbox: React.FC = () => {
  const { selectedVpa, loading: vpaGlobalLoading } = useVpa();
  const [languages, setLanguages] = useState<string[]>([]);
  const [currentLang, setCurrentLang] = useState<string>('Loading...');
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [langLoading, setLangLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // Step 1: Get current language status on enter
  useEffect(() => {
    const checkStatus = async () => {
      if (!selectedVpa?.terminal_id) return;
      try {
        const res = await apiService.getCurrentLanguage(selectedVpa.terminal_id || '');
        const langData = res.data?.data;
        if (typeof langData === 'string') {
          setCurrentLang(langData);
        } else if (langData?.language) {
          setCurrentLang(langData.language);
        }
      } catch (err) {
        console.error('Failed to check language status:', err);
      }
    };
    checkStatus();
  }, [selectedVpa]);

  // Step 2: Fetch all languages only when dropdown is opened
  const toggleDropdown = async () => {
    const nextState = !isDropdownOpen;
    setIsDropdownOpen(nextState);

    if (nextState && languages.length <= 11) { // If only defaults exist
      setLangLoading(true);
      try {
        const res = await apiService.fetchLanguages();
        if (res.data?.data && Array.isArray(res.data.data)) {
          setLanguages(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch languages:', err);
      } finally {
        setLangLoading(false);
      }
    }
  };

  const handleUpdate = async () => {
    if (!selectedLang || !selectedVpa?.terminal_id) return;
    setLoading(true);
    try {
      const res = await apiService.updateLanguage({ 
        tid: selectedVpa.terminal_id || '', 
        update_language: selectedLang 
      });
      
      if (res.data?.status === 'SUCCESS' || res.data?.statusCode === 200 || res.data?.result === 'success' || res.data?.responseCode === '01') {
        setShowSuccessModal(true);
      } else {
        setErrorModal({ 
          show: true, 
          message: res.data?.message || 'Failed to update language. Please try again later.' 
        });
      }
    } catch (err: any) {
      console.error('Update Error:', err);
      setErrorModal({ 
        show: true, 
        message: err.response?.data?.message || 'A network error occurred while updating language.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (vpaGlobalLoading && !selectedVpa) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading VPA details...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', backgroundColor: '#f8f9fa', padding: '24px 32px' }}>
      
      {/* Page Title */}
      <h1 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '800', color: '#1A1A1A' }}>
        Language Update
      </h1>

      {/* Form Card */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eee', padding: '24px' }}>
        
        {/* Responsive Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          
          {/* VPA ID */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#888' }}>VPA ID</label>
            <div style={{ height: '40px', backgroundColor: '#f5f5f5', borderRadius: '4px', border: '1px solid #eee', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '13px', color: '#333' }}>
              {selectedVpa?.vpa_id || 'N/A'}
            </div>
          </div>

          {/* Device Serial Number */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#888' }}>Device Serial Number</label>
            <div style={{ height: '40px', backgroundColor: '#f5f5f5', borderRadius: '4px', border: '1px solid #eee', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '13px', color: '#333' }}>
              {selectedVpa?.serial_number || 'N/A'}
            </div>
          </div>

          {/* Current Language */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#888' }}>Current Language</label>
            <div style={{ height: '40px', backgroundColor: '#f5f5f5', borderRadius: '4px', border: '1px solid #eee', display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '13px', color: '#333' }}>
              {currentLang}
            </div>
          </div>

          {/* Language Update Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#888' }}>Language Update</label>
            <div 
              onClick={toggleDropdown}
              style={{ height: '40px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', fontSize: '13px', color: selectedLang ? '#333' : '#999', cursor: 'pointer' }}
            >
              {langLoading ? 'Loading...' : (selectedLang || 'Select Language Update')}
              <ChevronDown size={14} color="#666" />
            </div>

            {/* Custom Dropdown Menu */}
            {isDropdownOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: 'white', border: '1px solid #eee', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 10, padding: '8px 0', maxHeight: '250px', overflowY: 'auto' }}>
                {languages.map(lang => (
                  <div 
                    key={lang}
                    onClick={() => { setSelectedLang(lang); setIsDropdownOpen(false); }}
                    style={{ padding: '10px 16px', fontSize: '13px', color: '#333', cursor: 'pointer', backgroundColor: selectedLang === lang ? '#fdf2f4' : 'transparent', fontWeight: selectedLang === lang ? '600' : '400' }}
                  >
                    {lang}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center' }}>
          <button style={{ backgroundColor: 'transparent', border: 'none', color: '#A01E35', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
            Cancel
          </button>
          <button 
            onClick={handleUpdate}
            disabled={!selectedLang || loading}
            style={{ backgroundColor: '#A01E35', color: 'white', border: 'none', borderRadius: '4px', padding: '10px 24px', fontSize: '13px', fontWeight: '700', cursor: (selectedLang && !loading) ? 'pointer' : 'not-allowed', opacity: (selectedLang && !loading) ? 1 : 0.6 }}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '32px', width: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            
            <h2 style={{ margin: '0 0 24px 0', fontSize: '14px', fontWeight: '700', color: '#333', textAlign: 'center', lineHeight: '1.5' }}>
              Language update request<br/>Initiated Successfully
            </h2>

            {/* Huge Green Checkmark */}
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e6f7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', border: '8px solid #c2edce' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#34c759', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={28} color="white" strokeWidth={4} />
              </div>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => { setShowSuccessModal(false); setSelectedLang(null); }}
              style={{ width: '100%', backgroundColor: '#A01E35', color: 'white', border: 'none', borderRadius: '4px', padding: '12px 0', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Error Modal */}
      {errorModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '32px', width: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: '#A01E35' }}>Update Failed</h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#666', textAlign: 'center', lineHeight: '1.5' }}>
              {errorModal.message}
            </p>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <AlertCircle size={32} color="#A01E35" />
            </div>
            <button 
              onClick={() => setErrorModal({ show: false, message: '' })}
              style={{ width: '100%', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', padding: '12px 0', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
            >
              Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Soundbox;
