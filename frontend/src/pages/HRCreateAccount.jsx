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
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create HR account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Create HR Account</h1>
        <p className="page-subtitle">Authorized HR administrators can create new HR accounts</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card" style={{ maxWidth: '500px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="HR Name" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hr@company.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="form-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create HR Account'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
