import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [tab, setTab] = useState('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user.role !== tab) {
        setError(`This account is not registered as ${tab === 'hr' ? 'an HR' : 'an Employee'}. Please use the correct login tab.`);
        setLoading(false);
        return;
      }
      if (data.user.role === 'hr') {
        navigate('/hr/dashboard');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container" style={{ display: 'flex', minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      
      {/* Left Panel - Branding & Animation */}
      <div className="auth-left-panel" style={{ 
        flex: 1, 
        background: 'linear-gradient(135deg, #7B9669 0%, #6C8480 100%)', 
        position: 'relative', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem 6rem',
        color: 'white'
      }}>
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '500px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', textShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            Welcome to<br/>Hackaholics
          </h1>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, opacity: 0.9 }}>
            Step into your new future. Our comprehensive portal streamlines every part of your professional integration, ensuring you have the tools you need from day one.
          </p>
        </div>

        {/* Animated Glassmorphic Shapes */}
        <div style={{
          position: 'absolute', width: '180px', height: '180px', borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)',
          top: '55%', left: '15%', animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute', width: '100px', height: '100px', borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)',
          top: '55%', right: '25%', animation: 'float 8s ease-in-out infinite reverse', transform: 'rotate(15deg)'
        }}></div>
        <div style={{
          position: 'absolute', width: '220px', height: '140px', borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)',
          top: '65%', right: '15%', animation: 'float 7s ease-in-out infinite 1s'
        }}></div>
        
        {/* Extra floating elements */}
        <div style={{
          position: 'absolute', width: '60px', height: '60px', borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.15)',
          top: '25%', right: '15%', animation: 'float 5s ease-in-out infinite 2s'
        }}></div>
        <div style={{
          position: 'absolute', width: '80px', height: '80px', borderRadius: '15px',
          background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)',
          top: '15%', left: '10%', animation: 'float 9s ease-in-out infinite reverse', transform: 'rotate(-25deg)'
        }}></div>
        <div style={{
          position: 'absolute', width: '140px', height: '40px', borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)',
          bottom: '10%', left: '35%', animation: 'float 7.5s ease-in-out infinite 0.5s', transform: 'rotate(5deg)'
        }}></div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="auth-right-panel" style={{ 
        flex: 1, 
        background: '#BAC8B1', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ background: '#BAC8B1', borderRadius: '24px', padding: '3rem 2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
            
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#404E3B', marginBottom: '0.5rem' }}>Access Your Portal</h2>
            <p style={{ color: '#404E3B', fontSize: '0.95rem', marginBottom: '2rem' }}>Please log in to your account to continue.</p>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid #f3f4f6', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => { setTab('employee'); setError(''); }}
                style={{
                  flex: 1, padding: '0.75rem 0', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.95rem', fontWeight: tab === 'employee' ? 600 : 500,
                  color: tab === 'employee' ? '#7B9669' : '#9ca3af',
                  borderBottom: tab === 'employee' ? '2px solid #7B9669' : '2px solid transparent',
                  marginBottom: '-2px', transition: 'all 0.2s ease', outline: 'none'
                }}
              >
                Employee Login
              </button>
              <button
                type="button"
                onClick={() => { setTab('hr'); setError(''); }}
                style={{
                  flex: 1, padding: '0.75rem 0', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.95rem', fontWeight: tab === 'hr' ? 600 : 500,
                  color: tab === 'hr' ? '#7B9669' : '#9ca3af',
                  borderBottom: tab === 'hr' ? '2px solid #7B9669' : '2px solid transparent',
                  marginBottom: '-2px', transition: 'all 0.2s ease', outline: 'none'
                }}
              >
                HR Login
              </button>
            </div>

            {/* Context Alert */}
            {tab === 'employee' ? (
              <div style={{ background: '#E6E6E6', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <svg width="18" height="18" fill="none" stroke="#7B9669" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span style={{ fontSize: '0.85rem', color: '#7B9669', fontWeight: 500 }}>New here? Create your employee account below.</span>
              </div>
            ) : (
              <div style={{ background: '#E6E6E6', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <svg width="18" height="18" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                <span style={{ fontSize: '0.85rem', color: '#404E3B', fontWeight: 500 }}>HR accounts are securely provisioned.</span>
              </div>
            )}

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'fadeIn 0.3s' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Work Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #9AA991', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s', fontFamily: 'inherit' }}
                  onFocus={(e) => { e.target.style.borderColor = '#7B9669'; e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#9AA991'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ marginBottom: '2rem', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ width: '100%', padding: '0.85rem 2.5rem 0.85rem 1rem', borderRadius: '10px', border: '1px solid #9AA991', background: '#E6E6E6', fontSize: '1rem', letterSpacing: !showPassword && password ? '2px' : 'normal', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s', fontFamily: 'inherit' }}
                    onFocus={(e) => { e.target.style.borderColor = '#7B9669'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#9AA991'; e.target.style.background = '#E6E6E6'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    ) : (
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                    )}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ width: '100%', background: '#7B9669', color: '#fff', border: 'none', padding: '0.95rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onMouseOver={(e) => { if(!loading) e.currentTarget.style.background = '#7B9669'; }}
                onMouseOut={(e) => { if(!loading) e.currentTarget.style.background = '#7B9669'; }}
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'} 
                {!loading && <span style={{ marginLeft: '4px' }}>→</span>}
              </button>
            </form>

            {tab === 'employee' && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <Link to="/setup" style={{ fontSize: '0.9rem', color: '#404E3B', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseOver={(e) => e.target.style.color = '#7B9669'}
                  onMouseOut={(e) => e.target.style.color = '#6b7280'}
                >
                  Have an invite? Complete first-time setup
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 900px) {
          .auth-page-container {
            flex-direction: column !important;
          }
          .auth-left-panel {
            padding: 3rem 2rem !important;
            align-items: center;
            text-align: center;
          }
          .auth-left-panel h1 {
            font-size: 2.5rem !important;
          }
          .auth-right-panel {
            padding: 2rem 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
