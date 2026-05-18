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
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
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
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">First-Time Setup</h1>
        <p className="auth-subtitle">Set your password using the invitation from HR</p>

        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#eff6ff', borderRadius: '8px', fontSize: '0.85rem', color: '#1e40af' }}>
          Enter the setup token from your HR invitation, or open the direct link provided by HR.
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {validating && <p style={{ color: '#6b7280' }}>Validating invitation...</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Setup Token</label>
            <input
              type="text"
              className="form-input"
              value={setupToken}
              onChange={(e) => setSetupToken(e.target.value.trim())}
              onBlur={handleTokenBlur}
              placeholder="Paste token from HR invite"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={!!tokenFromUrl && !!email}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="form-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || validating}>
            {loading ? 'Setting up...' : 'Complete Setup'}
          </button>
        </form>

        <p className="mt-3 text-center" style={{ color: '#6b7280', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}