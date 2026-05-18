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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{ width: '56px', height: '56px', background: '#f3e8ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', boxShadow: '0 4px 10px rgba(124, 58, 237, 0.15)' }}>
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>Invite Employee</h1>
          <p style={{ fontSize: '1rem', color: '#6b7280' }}>Generate a secure setup token to welcome a new hire to the team.</p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '1.5rem', maxWidth: '600px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div className="card" style={{ flex: '1 1 400px', maxWidth: '500px', padding: '2.5rem', borderRadius: '24px', border: '1px solid #f3e8ff', boxShadow: '0 10px 40px -10px rgba(124, 58, 237, 0.15)', background: '#fff' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#374151', marginBottom: '1.5rem' }}>New Invitation</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: '1rem', color: '#1f2937', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                placeholder="e.g. Jane Doe"
                onFocus={(e) => { e.target.style.borderColor = '#8b5cf6'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: '1rem', color: '#1f2937', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                placeholder="jane.doe@example.com"
                onFocus={(e) => { e.target.style.borderColor = '#8b5cf6'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#fff', border: 'none', padding: '1rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Creating Invite...
                </>
              ) : (
                <>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  Send Invitation
                </>
              )}
            </button>
          </form>
        </div>

        {invite && (
          <div style={{ flex: '1 1 400px', maxWidth: '500px', animation: 'fadeIn 0.5s ease-out' }}>
            <div className="card" style={{ padding: '2rem', borderRadius: '24px', background: '#f5f3ff', border: '2px dashed #d8b4fe', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: '#ede9fe', borderRadius: '50%', zIndex: 0 }}></div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '32px', height: '32px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937' }}>Invitation Sent!</h3>
                </div>

                <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.25rem' }}>Sent to</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>{invite.email}</p>
                  
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.25rem' }}>Expires On</p>
                  <p style={{ fontSize: '1rem', fontWeight: 500, color: '#374151' }}>{new Date(invite.expires_at).toLocaleString()}</p>
                </div>

                <div style={{ background: '#fff', borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Setup Link</p>
                    <p style={{ fontSize: '0.85rem', color: '#4b5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{invite.setup_link}</p>
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    style={{ background: copied ? '#dcfce7' : '#f3e8ff', color: copied ? '#166534' : '#7c3aed', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}
                    title="Copy Link"
                  >
                    {copied ? (
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                    ) : (
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Layout>
  );
}
