import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import api from '../api/axios';

export default function DocumentUpload() {
  const { user, refreshUser } = useAuth();
  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const res = await api.get('/documents/types');
      const types = res.data.document_types || [];
      setDocumentTypes(types);
      if (types.length > 0) setSelectedType(types[0].code);
    } catch {
      setError('Failed to load document types.');
    }
  };

  const selectedMeta = documentTypes.find((t) => t.code === selectedType);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const ext = selected.name.split('.').pop().toLowerCase();
      if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
        setError('Only PDF, JPG, and PNG files are allowed.');
        setFile(null);
        return;
      }
      if (selectedMeta?.max_size_bytes && selected.size > selectedMeta.max_size_bytes) {
        setError(`File exceeds max size of ${selectedMeta.max_size_mb}MB for this document type.`);
        setFile(null);
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', selectedType);
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Document uploaded successfully!');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const profileReady = user?.profile_complete || user?.onboarding_status !== 'Profile Incomplete';

  if (!profileReady) {
    return (
      <Layout>
        <div className="page-header">
          <h1 className="page-title">Upload Documents</h1>
        </div>
        <div className="alert alert-info">Please complete your profile setup before uploading documents.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Upload Documents</h1>
        <p className="page-subtitle">Upload ID proof, address proof, education, and experience documents</p>
      </div>

      <StatusBadge status={user?.onboarding_status} />

      {error && <div className="alert alert-error mt-2">{error}</div>}
      {success && <div className="alert alert-success mt-2">{success}</div>}

      <div className="card mt-2">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Document Type</label>
            <select className="form-select" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              {documentTypes.map((dt) => (
                <option key={dt.code} value={dt.code}>
                  {dt.name} {dt.is_mandatory ? '(Required)' : '(Optional)'}
                  {dt.max_size_mb ? ` — max ${dt.max_size_mb}MB` : ''}
                </option>
              ))}
            </select>
            {selectedMeta?.description && (
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.35rem' }}>{selectedMeta.description}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">File</label>
            <div className="dropzone" onClick={() => fileInputRef.current?.click()}>
              <div className="dropzone-icon">&#128196;</div>
              <p>{file ? file.name : 'Click to select a file (PDF, JPG, PNG)'}</p>
              {file && <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || !file}>
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>
    </Layout>
  );
}

