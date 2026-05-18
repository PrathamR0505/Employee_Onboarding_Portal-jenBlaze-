import React, { useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

export default function HRCreateAccount() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/admin/hr/create', { name, email, password });
      setSuccess(`HR account created for ${email}`);
      setName('');
      setEmail('');
      setPassword('');
      setConfirm('');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create HR account.');
    } finally {
      setLoading(false);
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Create HR Account</h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto', lineHeight: '1.5' }}>
            Authorized HR administrators can provision access for new HR team members.
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1.25rem', borderRadius: '10px', marginBottom: '1rem', width: '100%', maxWidth: '460px', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 2px 4px rgba(220, 38, 38, 0.05)', animation: 'slideUp 0.3s ease-out', fontSize: '0.9rem' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span style={{ fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '0.75rem 1.25rem', borderRadius: '10px', marginBottom: '1rem', width: '100%', maxWidth: '460px', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.05)', animation: 'slideUp 0.3s ease-out', fontSize: '0.9rem' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span style={{ fontWeight: 500 }}>{success}</span>
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
                    placeholder="e.g. Alex Taylor"
                    required
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '2px solid var(--border-color)', background: 'var(--bg-section)', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.background = 'var(--bg-card)'; e.target.style.boxShadow = '0 0 0 4px rgba(43,43,43,0.05)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.background = 'var(--bg-section)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.taylor@company.com"
                    required
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '2px solid var(--border-color)', background: 'var(--bg-section)', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.background = 'var(--bg-card)'; e.target.style.boxShadow = '0 0 0 4px rgba(43,43,43,0.05)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.background = 'var(--bg-section)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '2px solid var(--border-color)', background: 'var(--bg-section)', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box', fontFamily: 'inherit', letterSpacing: password ? '2px' : 'normal' }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.background = 'var(--bg-card)'; e.target.style.boxShadow = '0 0 0 4px rgba(43,43,43,0.05)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.background = 'var(--bg-section)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Confirm Password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    required
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '2px solid var(--border-color)', background: 'var(--bg-section)', fontSize: '0.95rem', color: 'var(--text-primary)', outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box', fontFamily: 'inherit', letterSpacing: confirm ? '2px' : 'normal' }}
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
                      Provisioning Account...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
                      Create HR Account
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
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
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Layout>
  );
}
