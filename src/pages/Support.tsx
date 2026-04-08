import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  MessageSquare,
  Search,
  LifeBuoy,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Send,
  Download
} from 'lucide-react';
import { apiService } from '../services/apiService';

const Support: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', body: '', category: 'Technical' });
  const [submitting, setSubmitting] = useState(false);

  // Detail View State
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await apiService.viewAllTickets();
      if (res.data?.data) {
        setTickets(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiService.createTicket({
        subject: newTicket.subject,
        body: newTicket.body,
        ticket_form_id: 12345,
        custom_fields: []
      });
      setIsModalOpen(false);
      setNewTicket({ subject: '', body: '', category: 'Technical' });
      fetchTickets();
    } catch (err) {
      console.error('Create Ticket Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchTicketDetails = async (ticketId: number) => {
    setLoadingDetails(true);
    try {
      const [detailsRes, commentsRes] = await Promise.all([
        apiService.viewTicketById(ticketId),
        apiService.showComment(ticketId)
      ]);
      
      if (detailsRes.data?.data) setSelectedTicket(detailsRes.data.data);
      if (commentsRes.data?.data) setComments(commentsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment || !selectedTicket) return;
    try {
      await apiService.createComment({
        ticket_id: selectedTicket.id,
        body: newComment
      });
      setNewComment('');
      fetchTicketDetails(selectedTicket.id);
    } catch (err) {
      console.error('Comment Error:', err);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedTicket) return;
    try {
      if (selectedTicket.status === 'solved') {
        await apiService.reOpenStatus(selectedTicket.id);
      } else {
        await apiService.closeStatus(selectedTicket.id);
      }
      fetchTicketDetails(selectedTicket.id);
    } catch (err) {
      console.error('Status Error:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'open': return <Clock size={14} color="#f59e0b" />;
      case 'solved': return <CheckCircle2 size={14} color="#10b981" />;
      default: return <AlertCircle size={14} color="#ef4444" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'open': return '#fff7ed';
      case 'solved': return '#ecfdf5';
      default: return '#fef2f2';
    }
  };

  if (loadingDetails) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
        <p>Loading ticket details...</p>
      </div>
    );
  }

  if (selectedTicket) {
    return (
      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', boxSizing: 'border-box' }}>
        <button 
          onClick={() => { setSelectedTicket(null); fetchTickets(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '13px', fontWeight: '600', width: 'fit-content' }}
        >
          <ChevronLeft size={16} /> Back to Tickets
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '24px', flex: 1, minHeight: 0 }}>
          {/* Ticket Details & Comments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
            <div style={{ backgroundColor: 'white', border: '1px solid #eee', borderRadius: '8px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1A1A1A' }}>{selectedTicket.subject}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', backgroundColor: getStatusColor(selectedTicket.status) }}>
                  {getStatusIcon(selectedTicket.status)}
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#333', textTransform: 'capitalize' }}>{selectedTicket.status}</span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#444', lineHeight: 1.6 }}>{selectedTicket.description || selectedTicket.body}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#333' }}>Communication History</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {comments.map((comment, i) => (
                  <div key={i} style={{ backgroundColor: comment.author_id === 0 ? '#f8f9fa' : 'white', border: '1px solid #eee', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#333' }}>{comment.author_name || (comment.author_id === 0 ? 'Support Agent' : 'You')}</span>
                      <span style={{ fontSize: '11px', color: '#aaa' }}>{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#555', lineHeight: 1.5 }}>{comment.body}</p>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== 'solved' && (
                <form onSubmit={handleAddComment} style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                  <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a reply..."
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
                  />
                  <button style={{ backgroundColor: '#A01E35', color: 'white', border: 'none', borderRadius: '6px', padding: '0 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Send size={18} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Ticket Stats Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ backgroundColor: 'white', border: '1px solid #eee', borderRadius: '8px', padding: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 16px 0' }}>Ticket Information</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#888' }}>Ticket ID</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#333' }}>#{selectedTicket.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#888' }}>Created On</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#333' }}>{new Date(selectedTicket.created_at).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#888' }}>Category</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#333' }}>{selectedTicket.type || 'Technical'}</span>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  onClick={handleToggleStatus}
                  style={{ width: '100%', padding: '10px', backgroundColor: selectedTicket.status === 'solved' ? '#fff' : '#fef2f2', border: selectedTicket.status === 'solved' ? '1px solid #ddd' : '1px solid #fee2e2', borderRadius: '4px', color: selectedTicket.status === 'solved' ? '#333' : '#ef4444', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {selectedTicket.status === 'solved' ? 'Reopen Ticket' : 'Mark as Resolved'}
                </button>
                <button 
                  style={{ width: '100%', padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #eee', borderRadius: '4px', color: '#666', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={() => apiService.downloadTicketById(selectedTicket.id)}
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px 32px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#1A1A1A', margin: 0 }}>Support Desk</h1>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Track your requests or get immediate assistance.</p>
        </div>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '8px 14px', 
          borderRadius: '4px', 
          border: '1px solid #eee', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          width: '300px'
        }}>
          <Search size={14} color="#888" />
          <input 
            type="text" 
            placeholder="Search tickets..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%', color: '#333' }}
          />
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '24px' }}>
        {/* Main Content: Tickets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#333' }}>Your Active Tickets</h4>
              <button 
                onClick={fetchTickets}
                style={{ background: 'none', border: 'none', fontSize: '12px', color: '#156DC4', fontWeight: '600', cursor: 'pointer' }}
              >
                Refresh
              </button>
            </div>
            <div style={{ minHeight: '300px' }}>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontSize: '13px' }}>Loading tickets...</div>
              ) : tickets.length > 0 ? (
                tickets.map((ticket, i) => (
                  <div 
                    key={ticket.id || i}
                    onClick={() => { setSelectedTicket(ticket); fetchTicketDetails(ticket.id); }}
                    style={{ padding: '16px 24px', borderBottom: i === tickets.length - 1 ? 'none' : '1px solid #f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div>
                      <h5 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '700', color: '#1A1A1A' }}>{ticket.subject || 'No Subject'}</h5>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#888' }}>ID: #{ticket.id}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#666' }}>
                          {getStatusIcon(ticket.status)}
                          {ticket.status}
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={14} color="#ccc" />
                  </div>
                ))
              ) : (
                <div style={{ padding: '80px 40px', textAlign: 'center' }}>
                  <LifeBuoy size={40} color="#eee" style={{ marginBottom: '16px' }} />
                  <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>No support tickets found.</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#aaa' }}>Reach out to us to start a conversation.</p>
                </div>
              )}
            </div>
          </section>

          <section style={{ 
            backgroundColor: '#A01E35', 
            borderRadius: '8px', 
            padding: '24px', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ maxWidth: '70%' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Still need help?</h3>
              <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>Our support specialists are ready to assist you.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{ 
                backgroundColor: 'white', 
                color: '#A01E35', 
                padding: '10px 20px', 
                borderRadius: '4px', 
                border: 'none', 
                fontWeight: '700', 
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={16} />
              New Ticket
            </button>
          </section>
        </div>

        {/* Sidebar: Contact Channels */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #eee', padding: '20px' }}>
             <h4 style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 16px 0', color: '#333' }}>Quick Contact</h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#f0f4f8', color: '#156DC4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={16} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: '#1A1A1A' }}>1800-419-2222</p>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Hotline</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#fff0f0', color: '#A01E35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={16} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: '#1A1A1A' }}>support@pnb.co.in</p>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Email</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#e6f4ea', color: '#1e7e34', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700', margin: 0, color: '#1A1A1A' }}>Live Chat</p>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Active</p>
                  </div>
                </div>
             </div>
          </div>
        </aside>
      </div>

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', width: '500px', maxWidth: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#333' }}>Raise New Support Ticket</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#aaa', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleCreateTicket} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Subject</label>
                <input 
                  required
                  type="text" 
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  placeholder="Summarize the issue"
                  style={{ padding: '10px 12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Description</label>
                <textarea 
                  required
                  rows={4}
                  value={newTicket.body}
                  onChange={(e) => setNewTicket({...newTicket, body: e.target.value})}
                  placeholder="Provide more details about your concern..."
                  style={{ padding: '10px 12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px', resize: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)} 
                  style={{ padding: '10px 20px', backgroundColor: 'transparent', border: 'none', color: '#666', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '10px 24px', backgroundColor: '#A01E35', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
