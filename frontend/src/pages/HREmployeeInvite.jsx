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
        minHeight: 'calc(100vh - 10rem)',
        fontFamily: 'var(--font-primary)',
        padding: '0 1rem'
      }}>

        {/* Centered Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--bg-section)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-brand)', boxShadow: 'var(--shadow-card)', margin: '0 auto 1rem' }}>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Invite Employee</h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto', lineHeight: '1.5' }}>
            Generate a secure setup token to welcome a new hire to the team.
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1.25rem', borderRadius: '10px', marginBottom: '1rem', width: '100%', maxWidth: '460px', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 2px 4px rgba(220, 38, 38, 0.05)', fontSize: '0.9rem' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span style={{ fontWeight: 500 }}>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '460px' }}>
          {/* Main Form Card */}
          <div className="card" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)', background: 'var(--bg-card)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '2px solid var(--border-color)', background: 'var(--bg-section)', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    placeholder="e.g. Jane Doe"
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.background = 'var(--bg-card)'; e.target.style.boxShadow = '0 0 0 4px rgba(43,43,43,0.05)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.background = 'var(--bg-section)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '2px solid var(--border-color)', background: 'var(--bg-section)', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    placeholder="jane.doe@acme.com"
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.background = 'var(--bg-card)'; e.target.style.boxShadow = '0 0 0 4px rgba(43,43,43,0.05)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.background = 'var(--bg-section)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', background: 'var(--primary-brand)', color: 'var(--text-inverse)', border: 'none', padding: '0.85rem', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s ease', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 20px -6px rgba(43, 43, 43, 0.15)', fontFamily: 'inherit' }}
                  onMouseOver={(e) => { if (!loading) e.currentTarget.style.background = 'var(--primary-brand-hover)'; }}
                  onMouseOut={(e) => { if (!loading) e.currentTarget.style.background = 'var(--primary-brand)'; }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Creating Invite...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
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
              <div className="card" style={{ padding: '2rem', borderRadius: '20px', background: 'var(--bg-card)', border: '2px dashed var(--primary-brand)', boxShadow: 'var(--shadow-card)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '32px', height: '32px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em', margin: 0 }}>Invitation Sent!</h3>
                  </div>

                  <div style={{ background: 'var(--bg-section)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Sent to</p>
                    <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-brand)', marginBottom: '1rem' }}>{invite.email}</p>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Generated Token</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace', background: 'var(--bg-alt)', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                        {invite.setup_token}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(invite.setup_token);
                          const el = document.getElementById('copy-token-btn');
                          if (el) {
                            el.innerText = 'Copied!';
                            setTimeout(() => { el.innerText = 'Copy'; }, 1500);
                          }
                        }}
                        id="copy-token-btn"
                        style={{
                          background: 'var(--primary-brand)',
                          color: 'var(--text-inverse)',
                          border: 'none',
                          padding: '0.4rem 0.6rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-brand-hover)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary-brand)'}
                      >
                        Copy
                      </button>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Expires On</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(invite.expires_at).toLocaleString()}</p>
                  </div>

                  <div style={{ background: 'var(--bg-section)', borderRadius: '16px', padding: '1rem 1.25rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
                    <div style={{ overflow: 'hidden' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-brand)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Setup Link</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'monospace' }}>{invite.setup_link}</p>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      style={{ background: copied ? '#10b981' : 'var(--primary-brand)', color: 'var(--text-inverse)', border: 'none', padding: '0.6rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s', boxShadow: copied ? '0 4px 10px rgba(16, 185, 129, 0.2)' : 'none' }}
                      title="Copy Link"
                      onMouseOver={(e) => { if (!copied) e.currentTarget.style.background = 'var(--primary-brand-hover)'; }}
                      onMouseOut={(e) => { if (!copied) e.currentTarget.style.background = 'var(--primary-brand)'; }}
                    >
                      {copied ? (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                      ) : (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
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
