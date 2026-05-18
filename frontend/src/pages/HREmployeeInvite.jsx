import React, { useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

export default function HREmployeeInvite() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInvite(null);
    setCopied(false);
    setLoading(true);
    try {
      const res = await api.post('/admin/employees/invite', { name, email });
      setInvite(res.data);
      setName('');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create invitation.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (invite?.setup_link) {
      navigator.clipboard.writeText(invite.setup_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Layout>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '80vh',
        fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        padding: '2rem 1rem'
      }}>
        
        {/* Centered Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ width: '72px', height: '72px', background: '#BAC8B1', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7B9669', boxShadow: '0 8px 20px rgba(124, 58, 237, 0.15)', margin: '0 auto 1.5rem' }}>
            <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#404E3B', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Invite Employee</h1>
          <p style={{ fontSize: '1.05rem', color: '#404E3B', maxWidth: '420px', margin: '0 auto', lineHeight: '1.6' }}>
            Generate a secure setup token to welcome a new hire to the team.
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem', width: '100%', maxWidth: '500px', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 2px 4px rgba(220, 38, 38, 0.05)' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span style={{ fontWeight: 500 }}>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '500px' }}>
          {/* Main Form Card */}
          <div className="card" style={{ padding: '3rem 2.5rem', borderRadius: '24px', border: '1px solid #BAC8B1', boxShadow: '0 20px 40px -15px rgba(124, 58, 237, 0.1)', background: '#BAC8B1', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative background element */}
            <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(243,232,255,1) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }}></div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '14px', border: '2px solid #f3f4f6', background: '#E6E6E6', fontSize: '1.05rem', color: '#404E3B', outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    placeholder="e.g. Jane Doe"
                    onFocus={(e) => { e.target.style.borderColor = '#c4b5fd'; e.target.style.background = '#ffffff'; e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#f3f4f6'; e.target.style.background = '#E6E6E6'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div style={{ marginBottom: '2.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '14px', border: '2px solid #f3f4f6', background: '#E6E6E6', fontSize: '1.05rem', color: '#404E3B', outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    placeholder="jane.doe@acme.com"
                    onFocus={(e) => { e.target.style.borderColor = '#c4b5fd'; e.target.style.background = '#ffffff'; e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#f3f4f6'; e.target.style.background = '#E6E6E6'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #7B9669 0%, #6C8480 100%)', color: '#fff', border: 'none', padding: '1.1rem', borderRadius: '14px', fontSize: '1.1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s ease', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 20px -6px rgba(109, 40, 217, 0.5)', fontFamily: 'inherit' }}
                  onMouseOver={(e) => { if(!loading) e.target.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={(e) => { if(!loading) e.target.style.transform = 'translateY(0)'; }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin" width="22" height="22" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Creating Invite...
                    </>
                  ) : (
                    <>
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      Send Invitation
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Success Card */}
          {invite && (
            <div style={{ animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <div className="card" style={{ padding: '2.5rem', borderRadius: '24px', background: '#BAC8B1', border: '2px dashed #c4b5fd', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', background: '#BAC8B1', borderRadius: '50%', zIndex: 0 }}></div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ width: '40px', height: '40px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#404E3B', letterSpacing: '-0.01em' }}>Invitation Sent!</h3>
                  </div>

                  <div style={{ background: '#BAC8B1', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <p style={{ fontSize: '0.85rem', color: '#404E3B', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Sent to</p>
                    <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#7B9669', marginBottom: '1.25rem' }}>{invite.email}</p>
                    
                    <p style={{ fontSize: '0.85rem', color: '#404E3B', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Expires On</p>
                    <p style={{ fontSize: '1.05rem', fontWeight: 600, color: '#374151' }}>{new Date(invite.expires_at).toLocaleString()}</p>
                  </div>

                  <div style={{ background: '#BAC8B1', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    <div style={{ overflow: 'hidden' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7B9669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Setup Link</p>
                      <p style={{ fontSize: '0.9rem', color: '#404E3B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'monospace' }}>{invite.setup_link}</p>
                    </div>
                    <button 
                      onClick={copyToClipboard}
                      style={{ background: copied ? '#10b981' : '#BAC8B1', color: copied ? '#fff' : '#7B9669', border: 'none', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s', boxShadow: copied ? '0 4px 10px rgba(16, 185, 129, 0.2)' : 'none' }}
                      title="Copy Link"
                    >
                      {copied ? (
                        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                      ) : (
                        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Layout>
  );
}
