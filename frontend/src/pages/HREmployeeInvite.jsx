import React, { useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

export default function HREmployeeInvite() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInvite(null);
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

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Invite Employee</h1>
        <p className="page-subtitle">Generate a setup token for a new hire</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ maxWidth: '520px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Send Invitation'}
          </button>
        </form>
      </div>

      {invite && (
        <div className="card mt-2" style={{ maxWidth: '640px' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Invitation Created</h3>
          <p><strong>Email:</strong> {invite.email}</p>
          <p><strong>Expires:</strong> {new Date(invite.expires_at).toLocaleString()}</p>
          <p style={{ wordBreak: 'break-all' }}><strong>Setup link:</strong> {invite.setup_link}</p>
          <p style={{ wordBreak: 'break-all', fontSize: '0.85rem', color: '#6b7280' }}>
            <strong>Token:</strong> {invite.setup_token}
          </p>
        </div>
      )}
    </Layout>
  );
}
