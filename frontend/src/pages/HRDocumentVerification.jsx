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
    const allApproved = documents.length > 0 && documents.every((d) => d.status === 'approved');
    const checklistDone = employeeInfo.onboarding_status === 'Documents Approved' || employeeInfo.onboarding_status === 'Checklist In Progress';

    return (
      <Layout>
        <div className="page-header flex-between">
          <div>
            <h1 className="page-title">{employeeInfo.name}</h1>
            <p className="page-subtitle">
              {employeeInfo.email} &middot; <StatusBadge status={employeeInfo.onboarding_status} />
              {employeeInfo.total_document_types != null && (
                <span style={{ marginLeft: '0.5rem', color: '#6b7280' }}>
                  &middot; {employeeInfo.documents_approved}/{employeeInfo.total_document_types} documents approved
                </span>
              )}
            </p>
          </div>
          <button className="btn btn-outline" onClick={goBack}>Back to List</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {profile && (
          <div className="card">
            <h3 style={{ marginBottom: '0.75rem' }}>Employee Profile</h3>
            <div className="grid grid-2" style={{ fontSize: '0.9rem' }}>
              <div><strong>Phone:</strong> {profile.phone || '-'}</div>
              <div><strong>DOB:</strong> {profile.date_of_birth || '-'}</div>
              <div><strong>City:</strong> {profile.city || '-'}</div>
              <div><strong>State:</strong> {profile.state || '-'}</div>
              <div><strong>Bank A/C:</strong> {profile.bank_account_number || '-'}</div>
              <div><strong>PAN:</strong> {profile.pan_number || '-'}</div>
              <div><strong>Emergency:</strong> {profile.emergency_contact_name || '-'} ({profile.emergency_contact_phone || '-'})</div>
            </div>
          </div>
        )}

        <div className="card mt-2">
          <h3 style={{ marginBottom: '1rem' }}>
            Documents ({documents.filter((d) => d.status === 'approved').length}/
            {employeeInfo.total_document_types ?? documents.length} approved)
          </h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>File</th>
                  <th>Status</th>
                  <th>Remark</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td><strong>{doc.DocumentType?.name}</strong></td>
                    <td>{doc.original_name}</td>
                    <td><StatusBadge docStatus={doc.status} /></td>
                    <td>{doc.hr_remark || '-'}</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-sm btn-outline" onClick={() => handleDownload(doc.id)}>Download</button>
                        <button className="btn btn-sm btn-outline" onClick={() => handleDownloadOCR(doc.id)}>OCR Data</button>
                        {doc.status !== 'approved' && (
                          <>
                            <button className="btn btn-sm btn-success" onClick={() => handleVerify(doc.id, 'approved')} disabled={actionLoading}>
                              Approve
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleVerify(doc.id, 'rejected')} disabled={actionLoading}>
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {(allApproved || checklistDone) && employeeInfo.onboarding_status !== 'Joining Confirmed' && (
          <div className="card mt-2">
            <h3>Confirm Joining</h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              All documents approved. You can confirm this employee's joining.
            </p>
            <button className="btn btn-success" onClick={handleConfirmJoining} disabled={actionLoading}>
              {actionLoading ? 'Processing...' : 'Confirm Joining'}
            </button>
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
                  <td colSpan="4" style={{ textAlign: 'center', color: '#6b7280' }}>No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
