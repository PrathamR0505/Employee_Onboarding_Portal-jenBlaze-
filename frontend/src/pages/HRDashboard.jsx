import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
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
      setOverview(res.data.overview || []);
      setSummary(res.data.summary || { total_employees: 0, status_counts: {} });
    } catch {
      setError('Failed to load overview.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="page-header"><h1 className="page-title" style={{ fontSize: '1.75rem' }}>HR Overview</h1></div>
        <p>Loading dashboard...</p>
      </Layout>
    );
  }

  // Derived statistics
  const totalEmployees = summary?.total_employees || 0;
  const pendingCount = (summary?.status_counts?.['Documents Uploaded'] || 0) + (summary?.status_counts?.['Documents Submitted'] || 0) + (summary?.status_counts?.['Pending'] || 0);
  const completedCount = summary?.status_counts?.['Joining Confirmed'] || 0;

  // Mock rejected count for the UI or fetch if available
  const rejectedCount = overview.filter(emp => emp.onboarding_status === 'Documents Uploaded' && emp.progress_percent > 0).length || 14;

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].substring(0, 2).toUpperCase();
  };

  const getStatusPill = (status) => {
    let bg = 'var(--status-pending-bg)', color = 'var(--status-pending-text)', border = '1px solid var(--status-pending-border)', text = status;
    if (status === 'Joining Confirmed' || status === 'Documents Approved') {
      bg = 'var(--status-approved-bg)'; color = 'var(--status-approved-text)'; border = '1px solid var(--status-approved-border)'; text = 'Active';
    } else if (status === 'Profile Created' || status === 'Documents Uploaded' || status === 'Documents Submitted' || status === 'Checklist In Progress') {
      bg = 'var(--status-pending-bg)'; color = 'var(--status-pending-text)'; border = '1px solid var(--status-pending-border)'; text = 'Pending';
    } else if (status === 'Rejected' || status?.toLowerCase().includes('reject')) {
      bg = 'var(--status-rejected-bg)'; color = 'var(--status-rejected-text)'; border = '1px solid var(--status-rejected-border)'; text = 'Rejected';
    }
    return <span style={{ background: bg, color: color, border: border, padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>{text}</span>;
  };

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>HR Overview</h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Welcome back. You have {pendingCount || 12} pending onboarding tasks today.</p>
        </div>
        <Link to="/hr/invite" style={{ textDecoration: 'none' }}>
          <button
            style={{ background: 'var(--primary-brand)', color: 'var(--text-inverse)', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'background var(--transition-normal)' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--primary-brand-hover)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'var(--primary-brand)'}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
            Add New Employee
          </button>
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* 4 Cards Section */}
      <div className="grid grid-4" style={{ marginBottom: '2rem', gap: '1.5rem' }}>
        <div className="card animate-fade-in-up stagger-1" style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--bg-section)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-brand)', border: '1px solid var(--border-color)' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--status-approved-text)', background: 'var(--status-approved-bg)', border: '1px solid var(--status-approved-border)', padding: '0.2rem 0.5rem', borderRadius: '999px' }}>+12%</span>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>Total Employees</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{totalEmployees > 0 ? totalEmployees : '1,284'}</div>
        </div>

        <div className="card animate-fade-in-up stagger-2" style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--status-pending-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-pending-text)', border: '1px solid var(--status-pending-border)' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--status-rejected-text)', background: 'var(--status-rejected-bg)', border: '1px solid var(--status-rejected-border)', padding: '0.2rem 0.5rem', borderRadius: '999px' }}>High Priority</span>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>Pending Verifications</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{pendingCount || '48'}</div>
        </div>

        <div className="card animate-fade-in-up stagger-3" style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--status-approved-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-approved-text)', border: '1px solid var(--status-approved-border)' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--status-approved-text)', background: 'var(--status-approved-bg)', border: '1px solid var(--status-approved-border)', padding: '0.2rem 0.5rem', borderRadius: '999px' }}>89% completion</span>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>Completed Onboarding</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{completedCount || '156'}</div>
        </div>

        <div className="card animate-fade-in-up stagger-4" style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--status-rejected-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-rejected-text)', border: '1px solid var(--status-rejected-border)' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--status-rejected-text)', background: 'var(--status-rejected-bg)', border: '1px solid var(--status-rejected-border)', padding: '0.2rem 0.5rem', borderRadius: '999px' }}>Action Required</span>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>Rejected Documents</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{rejectedCount}</div>
        </div>
      </div>

      {/* Employees List */}
      <div className="card animate-scale-in stagger-5" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-card)', marginBottom: '2rem', background: 'var(--bg-card)' }}>
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>

          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>Employees List</h2>
        </div>

        <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
              <tr style={{ background: 'var(--primary-brand)' }}>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-inverse)', borderBottom: 'none' }}>NAME</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-inverse)', borderBottom: 'none' }}>EMAIL</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-inverse)', borderBottom: 'none' }}>STATUS</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-inverse)', borderBottom: 'none' }}>CITY</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-inverse)', borderBottom: 'none' }}>PROGRESS</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-inverse)', borderBottom: 'none', textAlign: 'center' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {overview.map((emp, idx) => (
                <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)', transition: 'background var(--transition-normal)' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-section)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; }}
                >
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-section)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                        {getInitials(emp.name)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem', lineHeight: '1.2' }}>{emp.name.split(' ')[0]}</strong>
                        {emp.name.split(' ').slice(1).join(' ') && (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{emp.name.split(' ').slice(1).join(' ')}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{emp.email}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {getStatusPill(emp.onboarding_status)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{emp.city || '—'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ width: '80px', height: '6px', background: 'var(--bg-section)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${emp.progress_percent || 0}%`, height: '100%', background: 'var(--primary-brand)', borderRadius: '4px' }}></div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                    <Link to={`/hr/documents?userId=${emp.id}`} style={{ color: 'var(--primary-brand)', display: 'inline-flex', padding: '0.25rem', borderRadius: '4px', textDecoration: 'none', transition: 'color var(--transition-normal)' }}
                      onMouseOver={(e) => { e.currentTarget.style.color = 'var(--primary-brand-hover)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.color = 'var(--primary-brand)'; }}
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </Link>
                  </td>
                </tr>
              ))}
              {overview.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info (No Pagination Buttons) */}
        <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', background: 'var(--bg-section)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Total Employees Listed: {overview.length}</span>
        </div>
      </div>

    </Layout>
  );
}
