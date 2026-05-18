import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Setup() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [setupToken, setSetupToken] = useState(tokenFromUrl);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(!!tokenFromUrl);
  const { setup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenFromUrl) {
      validateToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const validateToken = async (token) => {
    setValidating(true);
    setError('');
    try {
      const res = await api.get('/auth/setup/validate', { params: { token } });
      setEmail(res.data.email);
      setName(res.data.name || '');
      setSetupToken(token);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired setup link.');
    } finally {
      setValidating(false);
    }
  };

  const handleTokenBlur = () => {
    if (setupToken && setupToken.length >= 32) {
      validateToken(setupToken);
    }
  };

  // Password validation checks
  const hasLength = password.length >= 8;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!setupToken) {
      setError('Setup token is required. Use the invitation link from HR.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!hasLength || !hasSpecialChar || !hasUppercase) {
      setError('Please ensure your password meets all requirements.');
      return;
    }
    setLoading(true);
    try {
      await setup({ setup_token: setupToken, password, name, email });
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'var(--font-primary)',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--bg-section)'
    }}>
      <div style={{
        position: 'relative',
        zIndex: 10,
        background: 'var(--bg-card)',
        borderRadius: '24px',
        padding: '3rem 3.5rem',
        width: '100%',
        maxWidth: '560px',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--border-color)'
      }}>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Create Employee Account
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Complete your registration to access the HR portal.
        </p>

        {/* Info Alert */}
        <div style={{ background: 'var(--bg-section)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <svg width="20" height="20" fill="none" stroke="var(--primary-brand)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '2px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            This registration is for employees only. HR accounts are created by authorized HR administrators.
          </span>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.85rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {error}
          </div>
        )}

        {validating && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Validating invitation...
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Setup Token</label>
            <input
              type="text"
              value={setupToken}
              onChange={(e) => setSetupToken(e.target.value.trim())}
              onBlur={handleTokenBlur}
              placeholder="Paste token from HR invite"
              required
              style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-section)', fontSize: '0.95rem', color: 'var(--text-primary)', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s', fontFamily: 'inherit' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.background = 'var(--bg-card)'; e.target.style.boxShadow = '0 0 0 3px rgba(43, 43, 43, 0.05)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.background = 'var(--bg-section)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              required
              style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-section)', fontSize: '0.95rem', color: 'var(--text-primary)', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s', fontFamily: 'inherit' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.background = 'var(--bg-card)'; e.target.style.boxShadow = '0 0 0 3px rgba(43, 43, 43, 0.05)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.background = 'var(--bg-section)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Corporate Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={!!tokenFromUrl && !!email}
              placeholder="jane.doe@acmecorp.com"
              required
              style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: (!!tokenFromUrl && !!email) ? 'var(--bg-section)' : 'var(--bg-section)', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s', fontFamily: 'inherit', color: (!!tokenFromUrl && !!email) ? 'var(--text-secondary)' : 'var(--text-primary)' }}
              onFocus={(e) => { if (!(!!tokenFromUrl && !!email)) { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.background = 'var(--bg-card)'; e.target.style.boxShadow = '0 0 0 3px rgba(43, 43, 43, 0.05)'; } }}
              onBlur={(e) => { if (!(!!tokenFromUrl && !!email)) { e.target.style.borderColor = 'var(--border-color)'; e.target.style.background = 'var(--bg-section)'; e.target.style.boxShadow = 'none'; } }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-section)', fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: password ? '2px' : 'normal', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s', fontFamily: 'inherit' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.background = 'var(--bg-card)'; e.target.style.boxShadow = '0 0 0 3px rgba(43, 43, 43, 0.05)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.background = 'var(--bg-section)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-section)', fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: confirm ? '2px' : 'normal', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s', fontFamily: 'inherit' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.background = 'var(--bg-card)'; e.target.style.boxShadow = '0 0 0 3px rgba(43, 43, 43, 0.05)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.background = 'var(--bg-section)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Password Requirements Checklist */}
          <div style={{ background: 'var(--bg-section)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', marginBottom: '2rem' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: hasLength ? 'var(--primary-brand)' : 'var(--text-secondary)', transition: 'color 0.2s' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: hasLength ? '4px solid var(--primary-brand)' : '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}></div>
                At least 8 characters
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: hasSpecialChar ? 'var(--primary-brand)' : 'var(--text-secondary)', transition: 'color 0.2s' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: hasSpecialChar ? '4px solid var(--primary-brand)' : '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}></div>
                One special character (@, #, $)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: hasUppercase ? 'var(--primary-brand)' : 'var(--text-secondary)', transition: 'color 0.2s' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: hasUppercase ? '4px solid var(--primary-brand)' : '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}></div>
                One uppercase letter
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || validating}
            style={{ width: '100%', background: 'var(--primary-brand)', color: 'var(--text-inverse)', border: 'none', padding: '1.05rem', borderRadius: '10px', fontSize: '1.05rem', fontWeight: 600, cursor: (loading || validating) ? 'not-allowed' : 'pointer', opacity: (loading || validating) ? 0.7 : 1, transition: 'background 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            onMouseOver={(e) => { if (!(loading || validating)) e.currentTarget.style.background = 'var(--primary-brand-hover)'; }}
            onMouseOut={(e) => { if (!(loading || validating)) e.currentTarget.style.background = 'var(--primary-brand)'; }}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing...
              </>
            ) : 'Create Employee Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-brand)', fontWeight: 600, textDecoration: 'none' }} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>Log In</Link>
        </p>
      </div>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}