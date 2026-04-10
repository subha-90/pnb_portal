import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiService } from '../services/apiService';
// import { userManager } from '../services/authService';
import { useAuth } from './AuthContext';

interface VpaDetails {
  vpa_id: string;
  merchant_name: string;
  qr_string: string;
  serial_number: string;
  terminal_id?: string;
  merchant_account_no?: string;
  merchant_mobile?: string;
  merchant_email?: string;
  ifsc?: string;
  device_status?: string;
  mcc?: string;
  city?: string;
  state?: string;
  merchant_delivery_address?: string;
}

interface VpaContextType {
  vpaList: VpaDetails[];
  selectedVpa: VpaDetails | null;
  setSelectedVpa: (vpa: VpaDetails) => void;
  loading: boolean;
  error: string | null;
  refreshVpas: () => Promise<void>;
}

const VpaContext = createContext<VpaContextType | undefined>(undefined);

export const VpaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vpaList, setVpaList] = useState<VpaDetails[]>([]);
  const [selectedVpa, setSelectedVpaState] = useState<VpaDetails | null>(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVpas = async (force: boolean = false) => {
    if (!user) {
      setLoading(false);
      return;
    }
    if (!force && vpaList.length > 0) return; 
    setLoading(true);
    setError(null);
    try {
      const userName = user?.profile?.preferred_username || 'PNBADMIN';
      
      const res = await apiService.fetchUserById({ user_name: userName });
      console.log('[VpaContext] API Response:', res.data);
      const { data: dataArr, status, message } = res.data || {};
      
      if (status === 0 && dataArr && Array.isArray(dataArr)) {
        const mappedVpas = dataArr.map((item: any) => ({
          ...item,
          // Map serial_number to terminal_id if tid is missing as per instructions
          terminal_id: item.terminal_id || item.serial_number
        }));
        
        setVpaList(mappedVpas);
        if (!selectedVpa && mappedVpas.length > 0) {
          setSelectedVpaState(mappedVpas[0]);
        }
      } else {
        throw new Error(message || 'No VPAs found for this user');
      }
    } catch (err: any) {
      console.error('Failed to fetch VPA list:', err);
      setError(err.message || 'Failed to load VPAs');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (user) {
      fetchVpas();
    } else {
      setVpaList([]);
      setSelectedVpaState(null);
    }
  }, [user]);

  const setSelectedVpa = (vpa: VpaDetails) => {
    setSelectedVpaState(vpa);
  };

  return (
    <VpaContext.Provider value={{ 
      vpaList, 
      selectedVpa, 
      setSelectedVpa, 
      loading, 
      error,
      refreshVpas: () => fetchVpas(true) 
    }}>
      {children}
    </VpaContext.Provider>
  );
};

export const useVpa = () => {
  const context = useContext(VpaContext);
  if (context === undefined) {
    throw new Error('useVpa must be used within a VpaProvider');
  }
  return context;
};
