import axios from 'axios';
import { userManager } from './authService';

// Use local proxies to solve CORS during development
const STAGE_API_BASE = '/api-proxy';
const STAGE_AUTH_API_BASE = '/auth-proxy';
const CBOI_UAT_BASE = '/cboi-proxy';
const ELASTIC_API_BASE = 'https://services.txninfra.com'; // No proxy yet as no CORS issue reported
const ENCR_BASE = '/encr-proxy';
const ENCR_KEY = 'a6T8tOCYiSzDTrcqPvCbJfy0wSQOVcfaevH0gtwCtoU=';

// helper for encryption
const apiEncr = axios.create({ baseURL: ENCR_BASE });
async function encryptData(data: any): Promise<string> {
  try {
    const res = await apiEncr.post('/encr', data, { headers: { Key: ENCR_KEY } });
    // The service returns an object like { RequestData: "..." } or { ResponseData: "..." }
    const ciphertext = res.data?.RequestData || res.data?.ResponseData || res.data;
    if (typeof ciphertext !== 'string') {
      console.warn('[apiService] Encryption returned non-string data:', res.data);
    }
    return ciphertext;
  } catch (err) {
    console.error('[apiService] Encryption failed:', err);
    throw err;
  }
}

async function decryptData(encrypted: string): Promise<any> {
  try {
    const res = await apiEncr.post('/decr', { req: encrypted }, { headers: { Key: ENCR_KEY } });
    return res.data;
  } catch (err) {
    console.error('[apiService] Decryption failed:', err);
    throw err;
  }
}

// Helper to get Bearer token — uses access_token from OIDC session
async function getAuthToken() {
  const user = await userManager.getUser();
  const token = user?.access_token || '';
  // Debug: log token status (remove before production)
  console.debug('[apiService] token present:', token);
  return token;
}

// Helper: format date as DD/MM/YYYY (required by Reports API)
export function formatDateDDMMYYYY(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Helper: get today as DD/MM/YYYY
export function getTodayDDMMYYYY(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Interceptor to add auth and pass_key
const createApiInstance = (baseURL: string) => {
  const instance = axios.create({ baseURL });
  instance.interceptors.request.use(async (config) => {
    const token = await getAuthToken();
    config.headers.Authorization = `Bearer ${token}`;
    // Correct pass key from docs
    config.headers['pass_key'] = 'QC62FQKXT2DQTO43LMWH5A44UKVPQ7LK5Y6HVHRQ3XTIKLDTB6HA';
    return config;
  });

  // Log error responses to help debug 400/401 issues
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        console.error(`[apiService] Error ${error.response.status} from ${error.config.url}:`, error.response.data);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const apiStage = createApiInstance(STAGE_API_BASE);
const apiAuth = createApiInstance(STAGE_AUTH_API_BASE);

// Interceptor to decrypt apiAuth responses if they are encrypted
apiAuth.interceptors.response.use(async (response) => {
  // If response has { data: "ciphertext" }, { Data: "ciphertext" }, or { ResponseData: "ciphertext" }
  const encData = response.data?.data || response.data?.Data || response.data?.ResponseData;
  if (typeof encData === 'string' && encData.length > 20) {
    try {
      const decrypted = await decryptData(encData);
      // Replace the entire response.data with the decrypted object
      // This ensures res.data is the actual payload (e.g., { data: [...], status: 0 })
      response.data = decrypted;
      console.debug('[apiService] Decrypted response:', decrypted);
    } catch (err) {
      console.error('[apiService] Auto-decryption failed:', err);
    }
  }
  return response;
});
const apiCBOI = createApiInstance(CBOI_UAT_BASE);
const apiElastic = createApiInstance(ELASTIC_API_BASE);

export const apiService = {
  // ─── SDUI APIs ────────────────────────────────────────────────────────────
  fetchSDUI: (user_name: string) =>
    apiStage.post('/pnb/sdui/fetch', { user_name }),

  fetchSelectiveSDUI: (screen: string, user_name: string) =>
    apiStage.post('/pnb/sdui/fetch_selective', { user_name, required_screen: screen }),

  fetchElasticForm: (params: any) =>
    apiElastic.post('/isu/elastic/fetch', params),

  // ─── User & Device APIs ─────────────────────────────────────────────────────
  // Returns: merchant_name, vpa_id, serial_number, qr_string, terminal_id, etc.
  fetchUserById: async (params: {
    vpa_id?: string;
    serial_number?: string;
    account_number?: string;
    mobile_number?: string;
    user_name?: string;
  }) => {
    const user = await userManager.getUser();
    const current_user_name = params.user_name || user?.profile?.preferred_username;
    if (!current_user_name) throw new Error('User identity is missing');
    
    const encrypted = await encryptData({ ...params, user_name: current_user_name });
    return apiAuth.post('/pnb/fetch/fetchById', { RequestData: encrypted });
  },

  getDeviceStatus: (deviceSno: string) =>
    apiStage.get(`/pnb/TMS/soundbox/getDeviceStatus?deviceSno=${deviceSno.padStart(14, '0')}`),

  // ─── Reports APIs ──────────────────────────────────────────────────────────
  // Mode: "both" (Today), "excel" (Monthly/Range)
  submitReportQuery: (data: {
    startDate: string;  // DD/MM/YYYY
    endDate: string;    // DD/MM/YYYY
    vpa_id: string;
    mode: 'both' | 'excel' | 'stream';
  }) =>
    apiStage.post('/pnb/sb/reports/querysubmit_user', data),

  getReportStatus: (queryId: string) =>
    apiStage.get(`/pnb/sb/reports/get_report_status/${queryId}`),

  // ─── Soundbox / Language APIs ──────────────────────────────────────────────
  fetchLanguages: () =>
    apiAuth.get('/pnb/isu_soundbox/lang/fetch_language'),

  // Fetch Current Language (from Node Docs line 880)
  getCurrentLanguage: (tid: string) =>
    apiAuth.get(`/pnb/isu_soundbox/user_api/current_language/${tid}`),

  // Step 3 update (Payload fixed: language -> update_language)
  updateLanguage: async (data: { tid: string; update_language: string }) => {
    const encrypted = await encryptData(data);
    return apiAuth.post('/pnb/isu_soundbox/lang/update_language', { RequestData: encrypted });
  },

  // ─── QR APIs ───────────────────────────────────────────────────────────────
  // Step 2: Convert to Base64 (Payload fixed: qrString -> qr_string)
  generateQRBase64: async (qr_string: string) => {
    const user = await userManager.getUser();
    const user_name = user?.profile?.preferred_username;
    if (!user_name) throw new Error('User identity is missing');
    const encrypted = await encryptData({ qr_string, qrString: qr_string, user_name });
    return apiAuth.post('/pnb/merchant/qr_convert_to_base64', { RequestData: encrypted });
  },

  // Dynamic QR String Generation
  generateDynamicQrString: (params: any) =>
    apiCBOI.post('/CBOI/merchant/get-qr-string', params),

  // ─── Help & Support APIs ───────────────────────────────────────────────────
  createTicket: async (data: any) => {
    const encrypted = await encryptData(data);
    return apiAuth.post('/pnb/helpandsupport/createTicket', { RequestData: encrypted });
  },

  viewAllTickets: async (user_name: string) => {
    const encrypted = await encryptData({ user_name });
    return apiAuth.post('/pnb/helpandsupport/viewAllTickets', { RequestData: encrypted });
  },

  viewTicketById: async (ticket_id: number) => {
    const encrypted = await encryptData({ ticket_id });
    return apiAuth.post('/pnb/helpandsupport/viewTicket', { RequestData: encrypted });
  },

  uploadFile: (formData: FormData) =>
    apiAuth.post('/pnb/helpandsupport/uploadfile', formData),

  deleteFile: (file_id: string) =>
    apiAuth.post('/pnb/helpandsupport/deletefile', { file_id }),

  rateUs: (data: any) =>
    apiAuth.post('/pnb/helpandsupport/rateUs', data),

  createComment: async (data: any) => {
    const encrypted = await encryptData(data);
    return apiAuth.post('/pnb/helpandsupport/createComment', { RequestData: encrypted });
  },

  showComment: async (ticket_id: number) => {
    const encrypted = await encryptData({ ticket_id });
    return apiAuth.post('/pnb/helpandsupport/showComment', { RequestData: encrypted });
  },

  closeStatus: async (ticket_id: number) => {
    const encrypted = await encryptData({ ticket_id });
    return apiAuth.post('/pnb/helpandsupport/closeStatus', { RequestData: encrypted });
  },

  reOpenStatus: async (ticket_id: number) => {
    const encrypted = await encryptData({ ticket_id });
    return apiAuth.post('/pnb/helpandsupport/reopenStatus', { RequestData: encrypted });
  },

  filterTickets: (filters: any) =>
    apiAuth.post('/pnb/helpandsupport/filterTickets', filters),

  downloadAllTickets: () =>
    apiAuth.post('/pnb/helpandsupport/download', {}),

  downloadTicketById: (ticket_id: number) =>
    apiAuth.post('/pnb/helpandsupport/downloadByID', { ticket_id }),
};

