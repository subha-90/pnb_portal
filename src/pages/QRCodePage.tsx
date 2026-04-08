import React, { useState, useEffect } from 'react';
import { 
  User,
  Check
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { useVpa } from '../context/VpaContext.tsx';

const QRCodePage: React.FC = () => {
  const { selectedVpa, loading: vpaLoading } = useVpa();
  
  if (vpaLoading && !selectedVpa) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
        <p style={{ fontSize: '14px', color: '#666' }}>Loading QR Details...</p>
      </div>
    );
  }
  const [qrType, setQrType] = useState<'Static' | 'Dynamic'>('Static');
  const [amount, setAmount] = useState('');
  const [isDynamicGenerated, setIsDynamicGenerated] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [merchantName, setMerchantName] = useState('MERCHANT');
  const [staticQrString, setStaticQrString] = useState('');
  const [dynamicQrString, setDynamicQrString] = useState<string | null>(null);

  useEffect(() => {
    if (selectedVpa) {
      setUpiId(selectedVpa.vpa_id || '');
      setMerchantName(selectedVpa.merchant_name || 'MERCHANT');
      setStaticQrString(selectedVpa.qr_string || '');
    }
  }, [selectedVpa]);

  // Step 2: Generate QR base64 once we have the qr_string
  useEffect(() => {
    if (!staticQrString) return;

    const qrString = qrType === 'Dynamic' && isDynamicGenerated && dynamicQrString
      ? dynamicQrString
      : staticQrString;

    const fetchQR = async () => {
      try {
        const res = await apiService.generateQRBase64(qrString);
        if (res.data?.base64Image) {
          setQrBase64(res.data.base64Image);
        }
      } catch (err) {
        console.error('QR Fetch Error:', err);
      }
    };
    fetchQR();
  }, [staticQrString, isDynamicGenerated, dynamicQrString]);

  const handleGenerateDynamic = async () => {
    if (!amount || !selectedVpa) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiService.generateDynamicQrString({
        vpa_id: upiId,
        txnAmount: amount,
        serialNo: selectedVpa.serial_number || selectedVpa.terminal_id,
        merchant_name: merchantName
      });
      
      if (res.data?.qrString) {
        setDynamicQrString(res.data.qrString);
        setIsDynamicGenerated(true);
      } else {
        setErrorMsg(res.data?.message || 'Failed to generate dynamic QR. Please try again.');
      }
    } catch (err: any) {
      console.error('Dynamic QR Error:', err);
      setErrorMsg(err.response?.data?.message || 'A network error occurred while generating the QR.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', backgroundColor: '#f8f9fa', overflowY: 'auto' }}>
      
      {/* Top Banner & Filter Card Area */}
      <div style={{ padding: '24px 32px 16px 32px' }}>
        <h1 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: '#1A1A1A' }}>
          QR Details
        </h1>

        {/* Filter Card */}
        <div style={{ backgroundColor: 'white', padding: '16px 24px', borderRadius: '8px', border: '1px solid #eee' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', fontWeight: '600', color: '#666' }}>
            Select The Type of QR
          </p>
          
          <div style={{ display: 'flex', gap: '24px', marginBottom: qrType === 'Dynamic' ? '24px' : '0' }}>
            {['Static', 'Dynamic'].map(type => (
              <label 
                key={type} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#333', fontWeight: '500' }}
                onClick={() => {
                  setQrType(type as any);
                  if (type === 'Static') setIsDynamicGenerated(false);
                }}
              >
                <div style={{ 
                  width: '14px', height: '14px', 
                  borderRadius: '50%', 
                  border: `2px solid ${qrType === type ? '#A01E35' : '#ccc'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {qrType === type && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#A01E35' }} />}
                </div>
                {type}
              </label>
            ))}
          </div>

          {qrType === 'Dynamic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>
                Enter an amount to instantly generate your dynamic QR code
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>Amount to be collected</span>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <input 
                    type="number" 
                    placeholder="Enter the amount to be collected"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ 
                      padding: '10px 12px', borderRadius: '4px', border: '1px solid #ddd', 
                      fontSize: '13px', width: '300px', color: '#333' 
                    }} 
                  />
                  <button 
                    onClick={handleGenerateDynamic}
                    disabled={loading}
                    style={{
                      backgroundColor: '#A01E35', color: 'white', border: 'none', borderRadius: '4px',
                      padding: '0 24px', fontSize: '12px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? 'Generating...' : 'Generate QR'}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <p style={{ margin: 0, fontSize: '12px', color: '#A01E35', fontWeight: '600' }}>
                  {errorMsg}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Standee Centered Area - Hidden during ungenereted Dynamic mode */}
      {!(qrType === 'Dynamic' && !isDynamicGenerated) && (
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          padding: '0 32px 32px 32px',
          minHeight: 0
        }}>
          {/* Full-width White Card Background */}
          <div style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #eee',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '24px',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px' // tighter gap for all elements
            }}>
            {qrType === 'Dynamic' && isDynamicGenerated && (
               <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                 <p style={{ margin: 0, fontSize: '11px', color: '#444', fontWeight: '600' }}>Amount to be Collected</p>
                 <p style={{ margin: '2px 0 0 0', fontSize: '18px', color: '#A01E35', fontWeight: '800' }}>₹ {amount}</p>
               </div>
            )}

            {/* Heading Logo Zone */}
            {!(qrType === 'Dynamic' && isDynamicGenerated) && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
                <img 
                  src="/pnb_logo.png" 
                  alt="PNB Logo" 
                  style={{ width: '90px', height: 'auto', objectFit: 'contain' }}
                />
                <p style={{ fontSize: '9px', fontWeight: '700', color: '#555', marginTop: '4px', margin: 0 }}>
                  UPI ID : {upiId}
                </p>
              </div>
            )}

            {/* Merchant Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', marginTop: '8px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={12} color="#888" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#333' }}>{merchantName}</span>
            </div>

            {/* QR Image */}
            {qrBase64 ? (
              <img 
                src={`data:image/png;base64,${qrBase64}`} 
                alt="QR Code" 
                style={{ width: '160px', height: '160px', backgroundColor: 'white', padding: '8px', borderRadius: '8px' }}
              />
            ) : (
              <div style={{ width: '160px', height: '160px', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px' }}>
                Loading...
              </div>
            )}

            <p style={{ fontSize: '10px', fontWeight: '700', color: '#444', margin: '4px 0 16px 0' }}>
              UPI ID : {upiId}
            </p>

            {/* Dynamic state triggers differently here */}
            {qrType === 'Dynamic' && isDynamicGenerated ? (
               <p style={{ fontSize: '12px', color: '#A01E35', fontWeight: '600', margin: '0 0 16px 0' }}>
                 Valid till 1:29
               </p>
            ) : (
               <button style={{
                 backgroundColor: '#A01E35', color: 'white', padding: '10px 24px',
                 borderRadius: '4px', border: 'none', fontSize: '11px', fontWeight: '700',
                 cursor: 'pointer', marginBottom: '16px'
               }}>
                 Download QR Code
               </button>
            )}

            {/* Footer Logo Prototype */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '7px', fontWeight: '800', color: '#888', letterSpacing: '1px' }}>POWERED BY</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                <span style={{ fontSize: '18px', fontWeight: '900', color: '#666', fontStyle: 'italic', letterSpacing: '-1px' }}>UPI</span>
                <div style={{ width: '0', height: '0', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid #1e8e3e' }} />
              </div>
              <span style={{ fontSize: '4px', color: '#999', marginTop: '2px' }}>UNIFIED PAYMENTS INTERFACE</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '8px', width: '400px', maxWidth: '90%',
            padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '800', color: '#1A1A1A' }}>
              Payment Successful!
            </h2>
            
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e6f4ea',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
              border: '6px solid #bce6c9'
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#2dd36f',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Check size={36} color="white" strokeWidth={3} />
              </div>
            </div>
            
            <p style={{ margin: '0 0 32px 0', fontSize: '13px', color: '#666', textAlign: 'center' }}>
              Your transaction has been completed successfully.
            </p>
            
            <button 
              onClick={() => {
                setShowSuccessModal(false);
                setIsDynamicGenerated(false);
                setAmount('');
              }}
              style={{
                width: '100%', padding: '12px', backgroundColor: '#A01E35',
                color: 'white', border: 'none', borderRadius: '6px',
                fontSize: '13px', fontWeight: '700', cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default QRCodePage;
