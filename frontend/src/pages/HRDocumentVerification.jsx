import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import api from '../api/axios';

export default function HRDocumentVerification() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userId) {
      fetchEmployeeDocs(userId);
    } else {
      fetchEmployeeList();
    }
  }, [userId]);

  const fetchEmployeeList = async () => {
    try {
      const res = await api.get('/admin/onboarding/overview');
      setEmployees(res.data.overview);
    } catch {
      setError('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeDocs = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/documents/${id}`);
      setEmployeeInfo(res.data.employee);
      setDocuments(res.data.documents);
      setProfile(res.data.profile);
      setSelectedEmployee(id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (docId, status) => {
    const remark = status === 'rejected' ? prompt('HR Remark (required for rejection):') : '';
    if (status === 'rejected' && !remark) {
      setError('HR remark is mandatory when rejecting a document.');
      return;
    }
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.patch(`/admin/documents/${docId}/verify`, { status, hr_remark: remark || undefined });
      setSuccess(`Document ${status} successfully.`);
      await fetchEmployeeDocs(selectedEmployee);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmJoining = async () => {
    const joiningDate = prompt('Enter joining date (YYYY-MM-DD):');
    if (!joiningDate) {
      setError('Joining date is required.');
      return;
    }
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post(`/admin/joining/confirm/${selectedEmployee}`, { joining_date: joiningDate });
      setSuccess('Joining confirmed!');
      await fetchEmployeeDocs(selectedEmployee);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to confirm joining.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async (docId) => {
    try {
      const res = await api.get(`/download/${docId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      const doc = documents.find((d) => d.id === docId);
      a.download = doc?.original_name || 'document';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Download failed.');
    }
  };

  const handleDownloadOCR = async (docId) => {
    try {
      const res = await api.get(`/download/${docId}/ocr`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      const doc = documents.find((d) => d.id === docId);
      a.download = `${(doc?.original_name || 'document').split('.')[0]}_ocr.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('OCR data not available for this document.');
    }
  };

  const goBack = () => {
    setSelectedEmployee(null);
    setEmployeeInfo(null);
    setDocuments([]);
    setProfile(null);
    fetchEmployeeList();
  };

  if (loading) {
    return (
      <Layout>
        <div className="page-header"><h1 className="page-title">Document Verification</h1></div>
        <p>Loading...</p>
      </Layout>
    );
  }

  if (selectedEmployee && employeeInfo) {
    const totalDocs = employeeInfo.total_document_types ?? (documents.length || 4);
    const approvedDocs = documents.filter((d) => d.status === 'approved').length;
    const allApproved = documents.length > 0 && approvedDocs === totalDocs;
    const checklistDone = employeeInfo.onboarding_status === 'Documents Approved' || employeeInfo.onboarding_status === 'Checklist In Progress';

    return (
      <Layout>
        <div className="page-header flex-between" style={{ alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.75rem' }}>Document Status</h1>
            <p className="page-subtitle" style={{ fontSize: '0.95rem', marginTop: '4px' }}>
              Track and manage verification progress for {employeeInfo.name}.
            </p>
          </div>
          <button 
            className="btn" 
            onClick={goBack}
            style={{ padding: '0.6rem 1.25rem', background: '#2A1B38', color: '#fff', borderRadius: '8px', fontWeight: 600 }}
          >
            ← Back to List
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="grid grid-2" style={{ marginBottom: '1.5rem', gap: '1.5rem' }}>
          {/* Total Progress Card */}
          <div className="card" style={{ padding: '1.5rem', border: '1px solid #f3f4f6', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#404E3B', fontWeight: 500, marginBottom: '0.75rem' }}>Total Progress</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#7B9669' }}>{approvedDocs}</span>
              <span style={{ fontSize: '1.25rem', color: '#9ca3af', fontWeight: 500 }}>/ {totalDocs}</span>
            </div>
            <p style={{ color: '#404E3B', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 500 }}>Documents Approved</p>
            <div className="progress-bar" style={{ height: '6px', background: '#f3f4f6', borderRadius: '10px' }}>
              <div className="progress-fill" style={{ width: `${(approvedDocs / Math.max(totalDocs, 1)) * 100}%`, background: '#b286fd', borderRadius: '10px' }}></div>
            </div>
          </div>

          {/* Current Status Card */}
          <div className="card" style={{ padding: '1.5rem', border: '1px solid #f3f4f6', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', background: '#BAC8B1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7B9669', flexShrinks: 0 }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: '#404E3B', fontWeight: 500, marginBottom: '0.25rem' }}>Current Status</p>
                <h3 style={{ fontSize: '1.15rem', color: '#404E3B', fontWeight: 600, marginBottom: '0.25rem' }}>{employeeInfo.onboarding_status}</h3>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Last updated today</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ background: '#fdf4ff', color: '#c026d3', border: '1px solid #f0abfc', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', display: 'inline-block' }}>
                • {allApproved ? 'Verified' : 'Awaiting HR Review'}
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #f3f4f6', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#404E3B', fontWeight: 600 }}>Document Inventory</h3>
          </div>
          <div className="table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#2A1B38' }}>
                  <th style={{ padding: '0.875rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: '#fff', borderBottom: 'none' }}>DOCUMENT TYPE</th>
                  <th style={{ padding: '0.875rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: '#fff', borderBottom: 'none' }}>FILE NAME</th>
                  <th style={{ padding: '0.875rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: '#fff', borderBottom: 'none' }}>STATUS</th>
                  <th style={{ padding: '0.875rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: '#fff', borderBottom: 'none' }}>HR REMARK</th>
                  <th style={{ padding: '0.875rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: '#fff', borderBottom: 'none', textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', background: '#BAC8B1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7B9669' }}>
                           <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                        </div>
                        <strong style={{ color: '#374151', fontWeight: 500, fontSize: '0.95rem' }}>{doc.DocumentType?.name}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: '#404E3B', fontSize: '0.9rem' }}>{doc.original_name}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {doc.status === 'approved' && <span style={{ background: '#dcfce7', color: '#166534', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>✓ Approved</span>}
                      {doc.status === 'pending' && <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>⏱ Pending</span>}
                      {doc.status === 'rejected' && <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>✗ Rejected</span>}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: doc.status === 'rejected' ? '#dc2626' : '#6b7280', fontSize: '0.85rem', fontStyle: doc.status === 'rejected' ? 'normal' : 'italic' }}>
                      {doc.hr_remark || '—'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                        <button onClick={() => handleDownload(doc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#404E3B', padding: '4px' }} title="Download File">
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        </button>
                        <button onClick={() => handleDownloadOCR(doc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7B9669', padding: '4px' }} title="Download OCR">
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </button>
                        {doc.status !== 'approved' && (
                          <>
                            <span style={{ width: '1px', height: '16px', background: '#9AA991', margin: '0 4px' }}></span>
                            <button onClick={() => handleVerify(doc.id, 'approved')} disabled={actionLoading} style={{ background: 'none', border: 'none', cursor: actionLoading ? 'not-allowed' : 'pointer', color: '#10b981', padding: '4px' }} title="Approve">
                              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                            </button>
                            <button onClick={() => handleVerify(doc.id, 'rejected')} disabled={actionLoading} style={{ background: 'none', border: 'none', cursor: actionLoading ? 'not-allowed' : 'pointer', color: '#dc2626', padding: '4px' }} title="Reject">
                              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#404E3B', fontSize: '0.9rem' }}>No documents uploaded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(allApproved || checklistDone) && employeeInfo.onboarding_status !== 'Joining Confirmed' && (
          <div className="card mt-3" style={{ background: '#BAC8B1', border: '1px solid #ddd6fe', padding: '1.5rem', borderRadius: '12px' }}>
            <div className="flex-between">
              <div>
                <h3 style={{ color: '#7B9669', marginBottom: '0.25rem', fontSize: '1.1rem' }}>Ready for Joining</h3>
                <p style={{ color: '#404E3B', fontSize: '0.9rem' }}>All documents are verified. You can now confirm the joining date.</p>
              </div>
              <button className="btn btn-primary" onClick={handleConfirmJoining} disabled={actionLoading} style={{ background: '#7B9669' }}>
                {actionLoading ? 'Processing...' : 'Confirm Joining Date'}
              </button>
            </div>
          </div>
        )}
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Document Verification</h1>
        <p className="page-subtitle">Select an employee to review documents</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td><strong>{emp.name}</strong></td>
                  <td>{emp.email}</td>
                  <td><StatusBadge status={emp.onboarding_status} /></td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => fetchEmployeeDocs(emp.id)}>
                      View Documents
                    </button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#404E3B' }}>No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
