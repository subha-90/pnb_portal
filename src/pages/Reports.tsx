import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { useVpa } from '../context/VpaContext.tsx';
import { apiService, formatDateDDMMYYYY, getTodayDDMMYYYY } from '../services/apiService';

const Reports: React.FC = () => {
  const { selectedVpa } = useVpa();
  const [filterMode, setFilterMode] = useState<'Today' | 'Monthly' | 'Custom Range'>('Today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Input states for filters
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [selectedMonthOpt, setSelectedMonthOpt] = useState('Last 3 Month Report');
  const [errorMsg, setErrorMsg] = useState('');

  const monthOptions = [
    "Last Month's Report",
    "Last 3 Month Report",
    "Last 6 month's Report",
    "Last 12 month's Report"
  ];

  const initialTransactions: any[] = [];
  const [transactions, setTransactions] = useState(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [downloading, setDownloading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(transactions.length / rowsPerPage));
  const currentTableData = transactions.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const getDateRange = () => {
    const today = getTodayDDMMYYYY();
    if (filterMode === 'Today') {
      return { start: today, end: today, mode: 'both' as const };
    }
    if (filterMode === 'Custom Range') {
      return { start: formatDateDDMMYYYY(startDate), end: formatDateDDMMYYYY(endDate), mode: 'excel' as const };
    }
    const monthsMap: Record<string, number> = {
      "Last Month's Report": 1,
      'Last 3 Month Report': 3,
      "Last 6 month's Report": 6,
      "Last 12 month's Report": 12,
    };
    const m = monthsMap[selectedMonthOpt] || 3;
    const past = new Date();
    past.setMonth(past.getMonth() - m);
    const startFormatted = formatDateDDMMYYYY(past.toISOString());
    return { start: startFormatted, end: today, mode: 'excel' as const };
  };

  const handleSubmit = async () => {
    if (!selectedVpa) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const { start, end } = getDateRange();

      // Always use 'both' for table view to show data on UI
      const submitRes = await apiService.submitReportQuery({
        startDate: start,
        endDate: end,
        vpa_id: selectedVpa.vpa_id,
        mode: 'both'
      });

      const rows = submitRes.data?.data;
      if (rows && Array.isArray(rows)) {
        setTransactions(rows.map((r: any, i: number) => ({
          id: i + 1,
          txId: r.Transaction_Id || r.Transaction_ID || '',
          rrn: r.Transaction_Id || r.Transaction_ID || '',
          amount: r.Transaction_Amount?.toString() || '',
          date: r['Date_&_Time'] || r.Date || '',
          status: 'Received'
        })));
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error('Report fetch error:', err);
      setErrorMsg('Failed to fetch report.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedVpa) return;
    setDownloading(true);
    setErrorMsg('');
    try {
      const { start, end } = getDateRange();
      
      // Use 'excel' mode for download
      const submitRes = await apiService.submitReportQuery({
        startDate: start,
        endDate: end,
        vpa_id: selectedVpa.vpa_id,
        mode: 'excel'
      });

      const queryId = submitRes.data?.query_id || submitRes.data?.data?.query_id;
      if (queryId) {
        // Polling Logic for Excel Download
        let attempts = 0;
        const pollStatus = async () => {
          try {
            const statusRes = await apiService.getReportStatus(queryId);
            const resData = statusRes.data;
            const data = resData?.data || resData;

            if (data?.status === 'READY' && data?.signed_url) {
              const a = document.createElement('a');
              a.href = data.signed_url.trim();
              a.download = `report_${queryId}.xlsx`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              return true;
            }

            if (data?.status === 'FAILED') {
              setErrorMsg(data.statusDescription || 'Report generation failed on the server.');
              return true;
            }

            if (attempts > 20) { // Increased timeout (20 * 3s = 60s)
              setErrorMsg('Report generation is taking longer than expected. Please check under Report History or try again later.');
              return true;
            }
            attempts++;
            return false;
          } catch (e: any) {
            console.error('Polling error', e);
            const errorData = e.response?.data;
            if (errorData?.statusDescription) {
              setErrorMsg(errorData.statusDescription);
            }
            return true;
          }
        };

        const intervalId = setInterval(async () => {
          const finished = await pollStatus();
          if (finished) {
            clearInterval(intervalId);
            setDownloading(false);
          }
        }, 3000);
      } else {
        throw new Error('No query ID returned for download');
      }
    } catch (err) {
      console.error('Download error:', err);
      setErrorMsg('Failed to start download.');
      setDownloading(false);
    }
  };


  // Auto-load report on mount or when VPA changes
  useEffect(() => {
    if (selectedVpa) {
      handleSubmit();
    }
  }, [selectedVpa]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 32px', height: '100%', boxSizing: 'border-box' }}>
      
      {/* Page Title */}
      <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1A1A1A' }}>
        Transaction Reports
      </h1>

      {/* Filter Card */}
      <div style={{ backgroundColor: 'white', padding: '16px 20px', borderRadius: '8px', border: '1px solid #eee' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '12px', fontWeight: '600', color: '#666' }}>Select a Report Filter</h3>
        
        {/* Radio Group */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: filterMode === 'Today' ? 0 : '24px' }}>
          {['Today', 'Monthly', 'Custom Range'].map(mode => (
            <label 
              key={mode} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#333', fontWeight: '500' }}
              onClick={() => setFilterMode(mode as any)}
            >
              <div style={{ 
                width: '14px', height: '14px', 
                borderRadius: '50%', 
                border: `2px solid ${filterMode === mode ? '#A01E35' : '#ccc'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {filterMode === mode && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#A01E35' }} />}
              </div>
              {mode}
            </label>
          ))}
        </div>

        {/* Dynamic Inputs based on filter mode */}
        {filterMode === 'Monthly' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>Monthly</span>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ position: 'relative', width: '220px' }}>
                <div 
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    border: '1px solid #ddd', borderRadius: '4px', padding: '10px 12px',
                    fontSize: '13px', color: '#333', cursor: 'pointer', backgroundColor: 'white'
                  }}
                  onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                >
                  {selectedMonthOpt}
                  <ChevronDown size={14} color="#999" />
                </div>
                
                {isMonthDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                    backgroundColor: 'white', border: '1px solid #eee', borderRadius: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100
                  }}>
                    {monthOptions.map(opt => (
                      <div 
                        key={opt}
                        style={{ padding: '10px 12px', fontSize: '12px', cursor: 'pointer', color: '#333' }}
                        onClick={() => { setSelectedMonthOpt(opt); setIsMonthDropdownOpen(false); }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fce8e6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={handleSubmit} style={{
                backgroundColor: '#A01E35', color: 'white', border: 'none', borderRadius: '4px',
                padding: '0 24px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                opacity: loading ? 0.7 : 1
              }}>
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        )}

        {filterMode === 'Custom Range' && (
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>Start Date</span>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px', width: '200px', color: '#666' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>End Date</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px', width: '200px', color: '#666' }} 
              />
            </div>
            <button onClick={handleSubmit} disabled={loading} style={{
              backgroundColor: '#A01E35', color: 'white', border: 'none', borderRadius: '4px',
              padding: '12px 24px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              height: '40px', opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        )}
        {errorMsg && <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#d93025' }}>{errorMsg}</p>}
        {downloading && <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#156DC4', fontWeight: '600' }}>Generating Excel report... and will start downloading soon.</p>}
      </div>

      {/* Main Data Table Card */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        
        {/* Table Toolbar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={14} color="#999" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search here..." 
              style={{
                width: '100%', padding: '10px 10px 10px 36px', borderRadius: '4px',
                border: '1px solid #ddd', fontSize: '12px', outline: 'none'
              }}
            />
          </div>

          <button 
            onClick={handleDownload}
            disabled={downloading}
            style={{
              backgroundColor: '#A01E35', color: 'white', padding: '10px 16px',
              borderRadius: '4px', border: 'none', fontSize: '12px', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '8px', cursor: downloading ? 'not-allowed' : 'pointer',
              opacity: downloading ? 0.7 : 1
            }}
          >
            <Download size={14} /> {downloading ? 'Downloading...' : 'Download'}
          </button>
        </div>

        {/* Table Area */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #eee' }}>
                {['S. No.', 'Transaction ID', 'RRN Number', 'Amount', 'Date', 'Status'].map(col => (
                  <th key={col} style={{ padding: '14px 24px', fontSize: '11px', color: '#666', fontWeight: '700' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {col}
                      <ArrowUpDown size={10} color="#bbb" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentTableData.length > 0 ? (
                currentTableData.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #f9f9f9', backgroundColor: 'white' }}>
                    <td style={{ padding: '18px 24px', fontSize: '12px', color: '#333', fontWeight: '600' }}>{tx.id}</td>
                    <td style={{ padding: '18px 24px', fontSize: '12px', color: '#333' }}>{tx.txId}</td>
                    <td style={{ padding: '18px 24px', fontSize: '12px', color: '#333' }}>{tx.rrn}</td>
                    <td style={{ padding: '18px 24px', fontSize: '12px', color: '#333' }}>{tx.amount}</td>
                    <td style={{ padding: '18px 24px', fontSize: '12px', color: '#333' }}>{tx.date}</td>
                    <td style={{ padding: '18px 24px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '4px', 
                        fontSize: '11px', 
                        fontWeight: '700',
                        backgroundColor: tx.status === 'Received' ? '#e6f4ea' : '#fce8e6',
                        color: tx.status === 'Received' ? '#1e8e3e' : '#d93025'
                      }}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '60px 24px', textAlign: 'center', fontSize: '14px', color: '#999' }}>
                    {loading ? 'Fetching data...' : 'No transactions found for the selected period.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#888', fontWeight: '500' }}>Row per page</span>
              <select 
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', 
                  border: '1px solid #eee', borderRadius: '4px', fontSize: '12px', 
                  color: '#333', cursor: 'pointer', outline: 'none', backgroundColor: 'white' 
                }}
              >
                {[10, 20, 50].map(val => <option key={val} value={val}>{val}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#888', fontWeight: '500' }}>Go to</span>
              <input type="text" value={currentPage} onChange={(e) => setCurrentPage(parseInt(e.target.value) || 1)} style={{ width: '32px', textAlign: 'center', padding: '6px 4px', border: '1px solid #eee', borderRadius: '4px', fontSize: '12px', color: '#A01E35', fontWeight: '600', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', border: '1px solid #eee', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              <ChevronLeft size={14} color="#999" />
            </button>
            <span onClick={() => setCurrentPage(1)} style={{ fontSize: '12px', color: currentPage === 1 ? '#A01E35' : '#333', border: currentPage === 1 ? '1px solid #A01E35' : 'none', padding: currentPage === 1 ? '4px 0' : 0, borderRadius: '4px', width: '28px', textAlign: 'center', cursor: 'pointer' }}>1</span>
            
            {totalPages > 3 && currentPage > 3 && <span style={{ fontSize: '12px', color: '#999', width: '28px', textAlign: 'center' }}>...</span>}
            
            {currentPage > 1 && currentPage < totalPages && (
              <span style={{ fontSize: '12px', color: '#A01E35', width: '28px', textAlign: 'center', border: '1px solid #A01E35', borderRadius: '4px', padding: '4px 0', fontWeight: '600' }}>{currentPage}</span>
            )}
            
            {totalPages > (currentPage + 1) && currentPage > 1 && (
               <span onClick={() => setCurrentPage(currentPage + 1)} style={{ fontSize: '12px', color: '#333', width: '28px', textAlign: 'center', cursor: 'pointer' }}>{currentPage + 1}</span>
            )}

            {totalPages > 3 && (currentPage + 2) < totalPages && <span style={{ fontSize: '12px', color: '#999', width: '28px', textAlign: 'center' }}>...</span>}
            
            {totalPages > 1 && (
              <span onClick={() => setCurrentPage(totalPages)} style={{ fontSize: '12px', color: currentPage === totalPages ? '#A01E35' : '#333', border: currentPage === totalPages ? '1px solid #A01E35' : 'none', padding: currentPage === totalPages ? '4px 0' : 0, borderRadius: '4px', width: '28px', textAlign: 'center', cursor: 'pointer' }}>{totalPages}</span>
            )}

            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', border: '1px solid #eee', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
              <ChevronRight size={14} color="#666" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
