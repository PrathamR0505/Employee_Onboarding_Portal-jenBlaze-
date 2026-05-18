import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import api from '../api/axios';

export default function DocumentStatus() {
  const { user, refreshUser } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsRes, typesRes] = await Promise.all([
        api.get('/documents/my'),
        api.get('/documents/types'),
      ]);
      setDocuments(docsRes.data.documents);
      setDocumentTypes(typesRes.data.document_types || []);
    } catch {
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/documents/submit');
      setSuccess('Documents submitted for verification!');
      await refreshUser();
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed.');
    } finally {
      setSubmitting(false);
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

  const hasPending = documents.some((d) => d.status === 'pending');
  const mandatoryTypes = documentTypes.filter((t) => t.is_mandatory);
  const uploadedTypeIds = new Set(documents.map((d) => d.document_type_id));
  const allMandatoryUploaded = mandatoryTypes.every((t) => uploadedTypeIds.has(t.id));
  const totalDocs = documents.length;
  const approvedDocs = documents.filter((d) => d.status === 'approved').length;
  const progressPercent = totalDocs > 0 ? Math.round((approvedDocs / totalDocs) * 100) : 0;

  if (loading) {
    return (
      <Layout>
        <div className="page-header"><h1 className="page-title">Document Status</h1></div>
        <p>Loading documents...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Document Status</h1>
        <p className="page-subtitle">View and manage your uploaded documents</p>
      </div>

      <StatusBadge status={user?.onboarding_status} />
      <div className="mt-2 mb-3">
        <ProgressBar percent={progressPercent} label={`${approvedDocs}/${totalDocs} documents approved`} />
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        {documents.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No documents uploaded yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th>File Name</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>HR Remark</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td><strong>{doc.DocumentType?.name}</strong></td>
                    <td>{doc.original_name}</td>
                    <td>{(doc.file_size / 1024).toFixed(1)} KB</td>
                    <td><StatusBadge docStatus={doc.status} /></td>
                    <td>{doc.hr_remark || '-'}</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-sm btn-outline" onClick={() => handleDownload(doc.id)}>
                          Download
                        </button>
                        <button className="btn btn-sm btn-outline" onClick={() => handleDownloadOCR(doc.id)}>
                          OCR Data
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {hasPending && (
        <div className="mt-2">
          {!allMandatoryUploaded && (
            <p className="alert alert-info" style={{ marginBottom: '0.75rem' }}>
              Upload all mandatory document types before submitting:{' '}
              {mandatoryTypes.filter((t) => !uploadedTypeIds.has(t.id)).map((t) => t.name).join(', ')}
            </p>
          )}
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || !allMandatoryUploaded}>
            {submitting ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </div>
      )}
    </Layout>
  );
}
