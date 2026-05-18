import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/axios';

export default function DocumentUpload() {
  const { user, refreshUser } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const fileInputRefs = {
    aadhar: useRef(null),
    pan: useRef(null),
    degree: useRef(null),
    passport: useRef(null)
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsRes, typesRes] = await Promise.all([
        api.get('/documents/my').catch(() => ({ data: { documents: [] } })),
        api.get('/documents/types').catch(() => ({ data: { document_types: [] } }))
      ]);
      setDocuments(docsRes.data.documents || []);
      setDocumentTypes(typesRes.data.document_types || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e, typeKey) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingId(typeKey);
    try {
      const matchingType = documentTypes.find(t => 
        t.name.toLowerCase().includes(typeKey.toLowerCase()) || 
        t.code.toLowerCase().includes(typeKey.toLowerCase())
      );
      const typeCode = matchingType ? matchingType.code : typeKey;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', typeCode);

      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setToast({ type: 'success', title: 'Upload Successful', detail: `${file.name} has been received.` });
      setTimeout(() => setToast(null), 5000);

      await fetchData();
      await refreshUser();
    } catch (err) {
      setToast({ type: 'error', title: 'Upload Failed', detail: err.response?.data?.error || 'Please try again.' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setUploadingId(null);
      if (fileInputRefs[typeKey].current) {
        fileInputRefs[typeKey].current.value = '';
      }
    }
  };

  const getDocStatus = (typeKey) => {
    const matchingDocs = documents.filter(d => 
      (d.DocumentType && (d.DocumentType.name.toLowerCase().includes(typeKey.toLowerCase()) || d.DocumentType.code.toLowerCase().includes(typeKey.toLowerCase()))) ||
      d.original_name.toLowerCase().includes(typeKey.toLowerCase()) ||
      d.document_type_id === typeKey
    );
    if (matchingDocs.length > 0) {
      matchingDocs.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
      return matchingDocs[0];
    }
    return null;
  };

  const profileReady = user?.profile_complete || user?.onboarding_status !== 'Profile Incomplete';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `Uploaded on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const renderUploadBox = (typeKey, title, maxText, icon, color) => {
    const doc = getDocStatus(typeKey);
    const isUploading = uploadingId === typeKey;

    if (doc) {
      const isVerified = doc.status === 'approved';
      return (
        <div style={{ background: isVerified ? '#ecfdf5' : '#E6E6E6', border: `1px solid ${isVerified ? '#a7f3d0' : '#e2e8f0'}`, borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '140px', textAlign: 'center' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isVerified ? '#10b981' : '#64748b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <p style={{ margin: 0, fontWeight: 600, color: isVerified ? '#065f46' : '#334155', fontSize: '0.9rem', wordBreak: 'break-all' }}>{doc.original_name}</p>
          <p style={{ margin: '0.25rem 0 0 0', color: isVerified ? '#047857' : '#64748b', fontSize: '0.75rem' }}>{formatDate(doc.created_at)}</p>
        </div>
      );
    }

    return (
      <div 
        onClick={() => !isUploading && fileInputRefs[typeKey].current?.click()}
        style={{ border: `2px dashed ${color === 'purple' ? '#7B9669' : '#cbd5e1'}`, borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '140px', background: color === 'purple' ? '#BAC8B1' : '#ffffff', cursor: isUploading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', textAlign: 'center' }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = color === 'purple' ? '#7B9669' : '#94a3b8'}
        onMouseOut={(e) => e.currentTarget.style.borderColor = color === 'purple' ? '#7B9669' : '#cbd5e1'}
      >
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#BAC8B1', color: '#7B9669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
          {isUploading ? (
             <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : icon}
        </div>
        <p style={{ margin: 0, fontWeight: 600, color: '#404E3B', fontSize: '0.9rem' }}>{title}</p>
        <p style={{ margin: '0.25rem 0 0 0', color: '#404E3B', fontSize: '0.75rem' }}>{maxText}</p>
      </div>
    );
  };

  const getBadge = (doc, defaultType) => {
    if (!doc) {
      if (defaultType === 'REQUIRED') return <span style={{ background: '#fce7f3', color: '#be185d', padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em' }}>REQUIRED</span>;
      return <span style={{ background: '#9AA991', color: '#404E3B', padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em' }}>PENDING</span>;
    }
    if (doc.status === 'approved') return <span style={{ background: '#ecfdf5', color: '#059669', padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em' }}>VERIFIED</span>;
    if (doc.status === 'rejected') return <span style={{ background: '#fef2f2', color: '#dc2626', padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em' }}>REJECTED</span>;
    return <span style={{ background: '#fffbeb', color: '#b45309', padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em' }}>IN REVIEW</span>;
  };

  return (
    <Layout>
      <div style={{ padding: '1rem 2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Inter", "Segoe UI", sans-serif', background: '#faf8fc', minHeight: '100%', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#404E3B', margin: '0 0 0.5rem 0' }}>Document Verification</h1>
          <p style={{ color: '#404E3B', fontSize: '0.95rem', margin: 0 }}>Please upload clear, legible copies of your identification and education documents to complete your onboarding process.</p>
        </div>

        {/* Profile Alert */}
        {!profileReady && (
          <div style={{ background: '#BAC8B1', borderRadius: '12px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', border: '1px solid #e9d5ff' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#7B9669', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#4b286d', fontSize: '1rem', fontWeight: 700 }}>Complete your profile first.</h4>
                <p style={{ margin: 0, color: '#7B9669', fontSize: '0.85rem' }}>Some document fields are locked until your basic profile information is verified by the HR team.</p>
              </div>
            </div>
            <Link to="/profile" style={{ background: '#7B9669', color: 'white', padding: '0.6rem 1.25rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', flexShrink: 0, transition: 'background 0.2s' }}>
              View Profile
            </Link>
          </div>
        )}

        {/* Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* Aadhar Card */}
          <div style={{ background: '#BAC8B1', borderRadius: '16px', padding: '1.5rem', border: '1px solid #9AA991', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#BAC8B1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" fill="none" stroke="#7B9669" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
              </div>
              {getBadge(getDocStatus('aadhar'), 'REQUIRED')}
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#404E3B' }}>Aadhar Card</h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: '#404E3B', lineHeight: 1.4, flex: 1 }}>Identity proof. Front &amp; back merged.</p>
            {renderUploadBox('aadhar', 'Drag & drop to upload', 'PDF, JPG up to 5MB', <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>, 'purple')}
            <input ref={fileInputRefs.aadhar} type="file" style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg" onChange={(e) => handleFileChange(e, 'aadhar')} disabled={!profileReady} />
          </div>

          {/* PAN Card */}
          <div style={{ background: '#BAC8B1', borderRadius: '16px', padding: '1.5rem', border: '1px solid #9AA991', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#9AA991', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" fill="none" stroke="#64748b" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </div>
              {getBadge(getDocStatus('pan'), 'PENDING')}
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#404E3B' }}>PAN Card</h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: '#404E3B', lineHeight: 1.4, flex: 1 }}>Income tax identity document.</p>
            {renderUploadBox('pan', 'Click to Upload', 'PDF, JPG up to 5MB', <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>, 'gray')}
            <input ref={fileInputRefs.pan} type="file" style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg" onChange={(e) => handleFileChange(e, 'pan')} disabled={!profileReady} />
          </div>

          {/* Degree Certificate */}
          <div style={{ background: '#BAC8B1', borderRadius: '16px', padding: '1.5rem', border: '1px solid #9AA991', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#9AA991', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" fill="none" stroke="#64748b" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 14v7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              {getBadge(getDocStatus('degree'), 'PENDING')}
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#404E3B' }}>Degree Certificate</h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: '#404E3B', lineHeight: 1.4, flex: 1 }}>Latest degree or post-grad certificate.</p>
            {renderUploadBox('degree', 'Click to Upload', 'PDF preferred, max 10MB', <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>, 'gray')}
            <input ref={fileInputRefs.degree} type="file" style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg" onChange={(e) => handleFileChange(e, 'degree')} disabled={!profileReady} />
          </div>

        </div>

        {/* Bottom Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          
          {/* Passport Photo (Takes 2 cols if space allows) */}
          <div style={{ gridColumn: '1 / -1', '@media(minWidth: 1024px)': { gridColumn: 'span 2' }, background: '#BAC8B1', borderRadius: '16px', padding: '1.5rem', border: '1px solid #9AA991', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#BAC8B1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <svg width="24" height="24" fill="none" stroke="#7B9669" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#404E3B' }}>Passport Photo</h3>
                <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: '#404E3B', lineHeight: 1.5 }}>Please provide a high-resolution, front-facing photograph with a white background. This will be used for your official ID card and internal portal.</p>
              </div>
              <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column' }}>
                <div 
                  onClick={() => fileInputRefs.passport.current?.click()}
                  style={{ flex: 1, border: '2px dashed #7B9669', borderRadius: '12px', background: '#BAC8B1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: '200px', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = '#7B9669'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = '#7B9669'}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#BAC8B1', color: '#7B9669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    <span style={{ fontWeight: 600, color: '#404E3B' }}>Upload Photo</span>
                    <span style={{ color: '#404E3B', fontSize: '0.75rem', marginTop: '0.25rem' }}>JPG, PNG up to 5MB</span>
                  </div>
                </div>
                <input ref={fileInputRefs.passport} type="file" style={{ display: 'none' }} accept=".jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'passport')} disabled={!profileReady} />
              </div>
            </div>
          </div>



        </div>

        {/* Toast Notification */}
        {toast && (
          <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#404E3B', color: 'white', padding: '1rem 1.25rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 50, animation: 'slideIn 0.3s ease-out' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: toast.type === 'success' ? '#7B9669' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {toast.type === 'success' ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              )}
            </div>
            <div>
              <p style={{ margin: '0 0 0.15rem 0', fontWeight: 600, fontSize: '0.9rem' }}>{toast.title}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1' }}>{toast.detail}</p>
            </div>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: '#404E3B', cursor: 'pointer', marginLeft: '0.5rem' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        )}

      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Layout>
  );
}
