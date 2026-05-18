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
    <div className="auth-page-container" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-primary)' }}>

      {/* Left Panel - Branding & Animation */}
      <div className="auth-left-panel" style={{
        flex: 0.75,
        background: 'linear-gradient(135deg, #4A4A4A 0%, #303030 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        color: 'white'
      }}>
        <div className="animate-fade-in-right" style={{ position: 'relative', zIndex: 10, maxWidth: '440px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3.2rem', fontWeight: 700, fontFamily: 'var(--font-display)', lineHeight: 1.1, marginBottom: '1.5rem', textShadow: '0 4px 10px rgba(0,0,0,0.15)', letterSpacing: '-0.03em' }}>
            Welcome to<br />Hackaholics
          </h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.6, opacity: 0.85, fontFamily: 'var(--font-primary)' }}>
            Step into your new future. Our comprehensive portal streamlines every part of your professional integration, ensuring you have the tools you need from day one.
          </p>
        </div>

        {/* Animated Glassmorphic Shapes & Stardust */}
        {/* Object 1: Large glass circle */}
        <div style={{
          position: 'absolute', width: '180px', height: '180px', borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)',
          top: '55%', left: '10%', animation: 'float 6s ease-in-out infinite'
        }}></div>

        {/* Object 2: Rounded rectangle */}
        <div style={{
          position: 'absolute', width: '100px', height: '100px', borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)',
          top: '50%', right: '20%', animation: 'float 8s ease-in-out infinite reverse', transform: 'rotate(15deg)'
        }}></div>

        {/* Object 3: Glass card */}
        <div style={{
          position: 'absolute', width: '220px', height: '140px', borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)',
          top: '68%', right: '10%', animation: 'float 7s ease-in-out infinite 1s'
        }}></div>

        {/* Object 4: Medium circle */}
        <div style={{
          position: 'absolute', width: '60px', height: '60px', borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.08)',
          top: '25%', right: '10%', animation: 'float 5s ease-in-out infinite 2s'
        }}></div>

        {/* Object 5: Rounded square */}
        <div style={{
          position: 'absolute', width: '80px', height: '80px', borderRadius: '15px',
          background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.05)',
          top: '15%', left: '8%', animation: 'float 9s ease-in-out infinite reverse', transform: 'rotate(-25deg)'
        }}></div>

        {/* Object 6: Wide capsule */}
        <div style={{
          position: 'absolute', width: '140px', height: '40px', borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)',
          bottom: '8%', left: '30%', animation: 'float 7.5s ease-in-out infinite 0.5s', transform: 'rotate(5deg)'
        }}></div>

        {/* Object 7: Large Glass Ring */}
        <div style={{
          position: 'absolute', width: '120px', height: '120px', borderRadius: '50%',
          border: '6px solid rgba(255, 255, 255, 0.04)',
          top: '8%', right: '30%', animation: 'float 10s ease-in-out infinite'
        }}></div>

        {/* Object 8: Mini glowing stardust particle */}
        <div style={{
          position: 'absolute', width: '8px', height: '8px', borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.35)', boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
          top: '20%', left: '42%', animation: 'float 4s ease-in-out infinite 1.5s'
        }}></div>

        {/* Object 9: Another mini stardust particle */}
        <div style={{
          position: 'absolute', width: '12px', height: '12px', borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.25)',
          top: '38%', left: '8%', animation: 'float 5s ease-in-out infinite 0.7s'
        }}></div>

        {/* Object 10: Elegant vertical capsule */}
        <div style={{
          position: 'absolute', width: '36px', height: '100px', borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)',
          top: '28%', right: '4%', animation: 'float 8.5s ease-in-out infinite 2.2s', transform: 'rotate(-40deg)'
        }}></div>

        {/* Object 11: Sleek hollow square ring */}
        <div style={{
          position: 'absolute', width: '80px', height: '80px', borderRadius: '16px',
          border: '3px dashed rgba(255, 255, 255, 0.03)',
          top: '78%', left: '3%', animation: 'float 9.5s ease-in-out infinite 1.8s', transform: 'rotate(45deg)'
        }}></div>

        {/* Object 12: Bright star dot */}
        <div style={{
          position: 'absolute', width: '6px', height: '6px', borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.5)', boxShadow: '0 0 6px #fff',
          top: '82%', right: '35%', animation: 'float 3.5s ease-in-out infinite 0.3s'
        }}></div>

        {/* Object 13: Floating soft glass pill */}
        <div style={{
          position: 'absolute', width: '150px', height: '44px', borderRadius: '22px',
          background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255, 255, 255, 0.08)',
          top: '5%', left: '22%', animation: 'float 6.8s ease-in-out infinite 1.1s', transform: 'rotate(-12deg)'
        }}></div>

        {/* Object 14: Small stardust */}
        <div style={{
          position: 'absolute', width: '10px', height: '10px', borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.15)',
          top: '90%', left: '16%', animation: 'float 4.8s ease-in-out infinite 2.5s'
        }}></div>

        {/* Object 15: Abstract hollow circle ring */}
        <div style={{
          position: 'absolute', width: '50px', height: '50px', borderRadius: '50%',
          border: '3px solid rgba(255, 255, 255, 0.05)',
          bottom: '22%', left: '45%', animation: 'float 7.2s ease-in-out infinite 0.9s'
        }}></div>

        {/* Object 16: Small dashed ring */}
        <div style={{
          position: 'absolute', width: '45px', height: '45px', borderRadius: '50%',
          border: '2px dashed rgba(255,255,255,0.06)',
          top: '45%', left: '48%', animation: 'float 7.8s ease-in-out infinite reverse 1.2s'
        }}></div>

        {/* Object 17: Sleek vertical capsule */}
        <div style={{
          position: 'absolute', width: '24px', height: '70px', borderRadius: '12px',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
          top: '60%', left: '5%', animation: 'float 8.8s ease-in-out infinite 0.2s', transform: 'rotate(25deg)'
        }}></div>

        {/* Object 18: Glowing stardust */}
        <div style={{
          position: 'absolute', width: '10px', height: '10px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.3)', boxShadow: '0 0 10px rgba(255,255,255,0.4)',
          top: '72%', left: '35%', animation: 'float 4.2s ease-in-out infinite 0.5s'
        }}></div>

        {/* Object 19: Tilted pill */}
        <div style={{
          position: 'absolute', width: '90px', height: '28px', borderRadius: '14px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
          top: '12%', right: '8%', animation: 'float 6.4s ease-in-out infinite reverse 2.1s', transform: 'rotate(-15deg)'
        }}></div>

        {/* Object 20: Dotted glow dot */}
        <div style={{
          position: 'absolute', width: '5px', height: '5px', borderRadius: '50%',
          background: '#fff', boxShadow: '0 0 6px #fff',
          top: '52%', right: '42%', animation: 'float 3.2s ease-in-out infinite 1.7s'
        }}></div>

        {/* Object 21: Medium dashed square ring */}
        <div style={{
          position: 'absolute', width: '60px', height: '60px', borderRadius: '12px',
          border: '2px dashed rgba(255,255,255,0.04)',
          top: '32%', left: '25%', animation: 'float 9.2s ease-in-out infinite 0.9s', transform: 'rotate(12deg)'
        }}></div>

        {/* Object 22: High-blur soft sphere */}
        <div style={{
          position: 'absolute', width: '150px', height: '150px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(15px)',
          top: '-5%', right: '-2%', animation: 'float 11s ease-in-out infinite reverse'
        }}></div>

        {/* Object 23: Miniature particle */}
        <div style={{
          position: 'absolute', width: '7px', height: '7px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          top: '88%', right: '18%', animation: 'float 5.2s ease-in-out infinite 2s'
        }}></div>

        {/* Object 24: Hollow ring */}
        <div style={{
          position: 'absolute', width: '80px', height: '80px', borderRadius: '50%',
          border: '3px solid rgba(255,255,255,0.03)',
          top: '38%', right: '32%', animation: 'float 8s ease-in-out infinite 1.4s'
        }}></div>

        {/* Object 25: Tilted square */}
        <div style={{
          position: 'absolute', width: '40px', height: '40px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          bottom: '18%', right: '38%', animation: 'float 6.9s ease-in-out infinite 0.4s', transform: 'rotate(33deg)'
        }}></div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="auth-right-panel" style={{
        flex: 1.25,
        background: 'var(--bg-section)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div className="animate-scale-in" style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '3rem 2.5rem', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-color)' }}>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Access Your Portal</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>Please log in to your account to continue.</p>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => { setTab('employee'); setError(''); }}
                style={{
                  flex: 1, padding: '0.75rem 0', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.95rem', fontWeight: tab === 'employee' ? 600 : 500,
                  color: tab === 'employee' ? 'var(--primary-brand)' : 'var(--text-muted)',
                  borderBottom: tab === 'employee' ? '2px solid var(--primary-brand)' : '2px solid transparent',
                  marginBottom: '-2px', transition: 'all var(--transition-normal)', outline: 'none'
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
                  color: tab === 'hr' ? 'var(--primary-brand)' : 'var(--text-muted)',
                  borderBottom: tab === 'hr' ? '2px solid var(--primary-brand)' : '2px solid transparent',
                  marginBottom: '-2px', transition: 'all var(--transition-normal)', outline: 'none'
                }}
              >
                HR Login
              </button>
            </div>


            {error && (
              <div style={{ background: 'var(--status-rejected-bg)', border: '1px solid var(--status-rejected-border)', color: 'var(--status-rejected-text)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'fadeIn 0.3s' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Work Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'all var(--transition-normal)', fontFamily: 'inherit' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(109, 129, 150, 0.25)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ marginBottom: '2rem', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ width: '100%', padding: '0.85rem 2.5rem 0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-section)', fontSize: '1rem', letterSpacing: !showPassword && password ? '2px' : 'normal', boxSizing: 'border-box', outline: 'none', transition: 'all var(--transition-normal)', fontFamily: 'inherit' }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(109, 129, 150, 0.25)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.background = 'var(--bg-section)'; e.target.style.boxShadow = 'none'; }}
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
                style={{ width: '100%', background: 'var(--primary-brand)', color: 'var(--text-inverse)', border: 'none', padding: '0.95rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, transition: 'background var(--transition-normal)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onMouseOver={(e) => { if (!loading) e.currentTarget.style.background = 'var(--primary-brand-hover)'; }}
                onMouseOut={(e) => { if (!loading) e.currentTarget.style.background = 'var(--primary-brand)'; }}
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
                {!loading && <span style={{ marginLeft: '4px' }}>→</span>}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', visibility: tab === 'employee' ? 'visible' : 'hidden' }}>
              <Link to="/setup" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color var(--transition-normal)' }}
                onMouseOver={(e) => e.target.style.color = 'var(--primary-brand)'}
                onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                Have an invite? Complete first-time setup
              </Link>
            </div>

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
