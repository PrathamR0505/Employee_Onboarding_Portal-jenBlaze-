import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import api from '../api/axios';

export default function HRDashboard() {
  const [overview, setOverview] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await api.get('/admin/onboarding/overview');
      setOverview(res.data.overview);
      setSummary(res.data.summary);
    } catch {
      setError('Failed to load overview.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="page-header"><h1 className="page-title">HR Dashboard</h1></div>
        <p>Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">HR Dashboard</h1>
        <p className="page-subtitle">Onboarding overview for all employees</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {summary && (
        <div className="grid grid-4 mb-3">
          <div className="card stat-card">
            <div className="stat-value">{summary.total_employees}</div>
            <div className="stat-label">Total Employees</div>
          </div>
          {Object.entries(summary.status_counts || {}).map(([status, count]) => (
            <div className="card stat-card" key={status}>
              <div className="stat-value">{count}</div>
              <div className="stat-label">{status}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Employee Status</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>City</th>
                <th>Progress</th>
                <th>Documents</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {overview.map((emp) => (
                <tr key={emp.id}>
                  <td><strong>{emp.name}</strong></td>
                  <td>{emp.email}</td>
                  <td><StatusBadge status={emp.onboarding_status} /></td>
                  <td>{emp.city || '-'}</td>
                  <td><strong>{emp.progress_percent}%</strong></td>
                  <td>{emp.documents_approved}/{emp.total_document_types} approved</td>
                  <td>
                    <a href={`/hr/documents?userId=${emp.id}`} className="btn btn-sm btn-primary" style={{ textDecoration: 'none' }}>
                      View
                    </a>
                  </td>
                </tr>
              ))}
              {overview.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#6b7280' }}>No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
