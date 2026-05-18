import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [tab, setTab] = useState('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your onboarding portal</p>

        <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
          <button
            onClick={() => { setTab('employee'); setError(''); }}
            style={{
              flex: 1, padding: '0.75rem', border: 'none', background: 'none',
              cursor: 'pointer', fontWeight: tab === 'employee' ? 600 : 400,
              color: tab === 'employee' ? '#4f46e5' : '#6b7280',
              borderBottom: tab === 'employee' ? '2px solid #4f46e5' : '2px solid transparent',
              marginBottom: '-2px', fontSize: '0.95rem', transition: 'all 0.2s',
            }}
          >
            Employee Login
          </button>
          <button
            onClick={() => { setTab('hr'); setError(''); }}
            style={{
              flex: 1, padding: '0.75rem', border: 'none', background: 'none',
              cursor: 'pointer', fontWeight: tab === 'hr' ? 600 : 400,
              color: tab === 'hr' ? '#4f46e5' : '#6b7280',
              borderBottom: tab === 'hr' ? '2px solid #4f46e5' : '2px solid transparent',
              marginBottom: '-2px', fontSize: '0.95rem', transition: 'all 0.2s',
            }}
          >
            HR Login
          </button>
        </div>

        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f0fdf4', borderRadius: '8px', fontSize: '0.85rem', color: '#065f46' }}>
          {tab === 'employee'
            ? 'New hire? Use the setup link from HR to create your account.'
            : 'HR accounts are created by authorized HR administrators only.'}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : `Sign In as ${tab === 'hr' ? 'HR' : 'Employee'}`}
          </button>
        </form>

        {tab === 'employee' && (
          <p className="mt-3 text-center" style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Have an invite? <Link to="/setup">Complete first-time setup</Link>
          </p>
        )}
      </div>
    </div>
  );
}
