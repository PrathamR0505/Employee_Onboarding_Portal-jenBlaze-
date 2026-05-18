import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../api/axios';

export default function ProfileSetup() {
  const { user, refreshUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    date_of_birth: '',
    gender: '',
    nationality: '',
    email: user?.email || '',
    phone: '',
    address: '',
    account_holder_name: user?.name || '',
    bank_account_number: '',
    sort_code: '',
    pan_number: '',
    tax_residency: 'United Kingdom'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      if (res.data.profile) {
        const p = res.data.profile;
        setForm(prev => ({
          ...prev,
          phone: p.phone || '',
          date_of_birth: p.date_of_birth ? p.date_of_birth.split('T')[0] : '',
          gender: p.gender || '',
          address: p.address || '',
          bank_account_number: p.bank_account_number || '',
          pan_number: p.pan_number || '',
        }));
      }
    } catch { }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = {
        phone: form.phone,
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        address: form.address,
      };
      if (form.bank_account_number) payload.bank_account_number = form.bank_account_number;
      if (form.pan_number) payload.pan_number = form.pan_number;

      await api.put('/profile', payload);
      setSuccess('Profile saved successfully!');
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const requiredFields = ['name', 'date_of_birth', 'gender', 'nationality', 'email', 'phone', 'address', 'account_holder_name', 'bank_account_number', 'sort_code', 'pan_number', 'tax_residency'];
  const completedFields = requiredFields.filter(f => form[f] && form[f].toString().trim() !== '').length;
  const progressPercent = Math.round((completedFields / requiredFields.length) * 100);

  // Stepper logic
  const status = user?.onboarding_status || 'Profile Incomplete';
  let currentStepIdx = 1; // 0 = Offer Accepted, 1 = Profile Setup
  if (['Profile Complete', 'Documents Uploaded', 'Documents Submitted', 'Documents Approved'].includes(status)) {
    currentStepIdx = 2;
  } else if (status === 'Checklist In Progress') {
    currentStepIdx = 3;
  } else if (status === 'Joining Confirmed') {
    currentStepIdx = 4;
  }

  const steps = [
    { label: 'OFFER ACCEPTED' },
    { label: 'PROFILE SETUP' },
    { label: 'VERIFICATION' },
    { label: 'ONBOARDING' },
    { label: 'CONFIRMED' }
  ];

  const inputStyle = { width: '100%', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-section)', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'all var(--transition-normal)', fontFamily: 'inherit', color: 'var(--text-primary)' };
  const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' };
  const cardStyle = { background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-color)', height: '100%' };

  return (
    <Layout>
      <div style={{ padding: '1rem 0', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-primary)', minHeight: '100%' }}>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative', padding: '0 1rem' }}>
          <div style={{ position: 'absolute', top: '16px', left: '2rem', right: '2rem', height: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>

          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isActive = idx === currentStepIdx;

            return (
              <div key={idx} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                {isCompleted ? (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 4px var(--bg-section)' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                ) : isActive ? (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-brand)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, boxShadow: '0 0 0 4px var(--bg-section)' }}>
                    0{idx + 1}
                  </div>
                ) : (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-card)', border: '2px solid var(--border-color)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, boxShadow: '0 0 0 4px var(--bg-section)' }}>
                    0{idx + 1}
                  </div>
                )}
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: (isCompleted || isActive) ? 'var(--text-primary)' : 'var(--text-muted)', letterSpacing: '0.05em' }}>{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Employee Profile Setup</h1>
            <span style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>Profile Incomplete</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>Please complete all sections of your employee profile to proceed with the background verification process.</p>
        </div>

        {/* Completion Status Bar */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Completion Status</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{progressPercent}% Complete</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--bg-section)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--primary-brand)', transition: 'width 0.3s ease' }}></div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.75rem 0 0 0' }}>Estimated time to complete: 15 minutes.</p>
        </div>

        {error && <div style={{ background: 'var(--status-rejected-bg)', border: '1px solid var(--status-rejected-border)', color: 'var(--status-rejected-text)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}
        {success && <div style={{ background: 'var(--status-approved-bg)', border: '1px solid var(--status-approved-border)', color: 'var(--status-approved-text)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Grid Layout for Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

            {/* 1. Personal Details */}
            <div className="animate-fade-in-up stagger-1" style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <svg width="20" height="20" fill="none" stroke="var(--primary-brand)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Personal Details</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Full Legal Name</label>
                  <input type="text" name="name" style={inputStyle} value={form.name} onChange={handleChange} placeholder="e.g. Jane Doe"
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,43,43,0.05)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Date of Birth</label>
                    <input type="date" name="date_of_birth" style={inputStyle} value={form.date_of_birth} onChange={handleChange}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,43,43,0.05)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Gender</label>
                    <select name="gender" style={inputStyle} value={form.gender} onChange={handleChange}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,43,43,0.05)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Nationality</label>
                  <input type="text" name="nationality" style={inputStyle} value={form.nationality} onChange={handleChange} placeholder="e.g. United Kingdom"
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,43,43,0.05)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Contact Details */}
            <div className="animate-fade-in-up stagger-2" style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <svg width="20" height="20" fill="none" stroke="var(--primary-brand)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Contact Details</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Personal Email Address</label>
                  <input type="email" name="email" style={inputStyle} value={form.email} onChange={handleChange} placeholder="alexandra.s@example.com"
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,43,43,0.05)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Primary Phone Number</label>
                  <input type="text" name="phone" style={inputStyle} value={form.phone} onChange={handleChange} placeholder="+44 20 7123 4567"
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,43,43,0.05)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Current Address</label>
                  <textarea name="address" style={{ ...inputStyle, minHeight: '88px', resize: 'vertical' }} value={form.address} onChange={handleChange} placeholder="Street, City, Postcode"
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,43,43,0.05)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Bank Details */}
            <div className="animate-fade-in-up stagger-3" style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <svg width="20" height="20" fill="none" stroke="var(--primary-brand)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Bank Details</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Account Holder Name</label>
                  <input type="text" name="account_holder_name" style={inputStyle} value={form.account_holder_name} onChange={handleChange}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,43,43,0.05)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Account Number</label>
                    <input type="password" name="bank_account_number" style={{ ...inputStyle, letterSpacing: form.bank_account_number ? '2px' : 'normal' }} value={form.bank_account_number} onChange={handleChange} placeholder="••••••••"
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,43,43,0.05)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Sort Code / Swift</label>
                    <input type="text" name="sort_code" style={inputStyle} value={form.sort_code} onChange={handleChange} placeholder="00-00-00"
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,43,43,0.05)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                <div style={{ background: 'var(--bg-section)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem', display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <svg width="18" height="18" fill="none" stroke="var(--primary-brand)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Payment information is encrypted and stored securely following GDPR compliance.</span>
                </div>
              </div>
            </div>

            {/* 4. PAN / Tax Details */}
            <div className="animate-fade-in-up stagger-4" style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <svg width="20" height="20" fill="none" stroke="var(--primary-brand)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>PAN / Tax Details</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>PAN Card Number / National ID</label>
                  <input type="text" name="pan_number" style={inputStyle} value={form.pan_number} onChange={handleChange} placeholder="ABCDE1234F"
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,43,43,0.05)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Tax Residency</label>
                  <select name="tax_residency" style={inputStyle} value={form.tax_residency} onChange={handleChange}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary-brand)'; e.target.style.boxShadow = '0 0 0 3px rgba(43,43,43,0.05)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                  >
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="India">India</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
            <button type="button" onClick={() => fetchProfile()} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', transition: 'color var(--transition-normal)' }}
              onMouseOver={(e) => e.target.style.color = 'var(--primary-brand)'}
              onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              Discard Changes
            </button>
            <button type="submit" disabled={loading} style={{ background: 'var(--primary-brand)', color: 'var(--text-inverse)', border: 'none', padding: '0.85rem 1.5rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background var(--transition-normal)' }}
              onMouseOver={(e) => { if (!loading) e.currentTarget.style.background = 'var(--primary-brand-hover)'; }}
              onMouseOut={(e) => { if (!loading) e.currentTarget.style.background = 'var(--primary-brand)'; }}
            >
              {loading && <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              Save Profile & Continue
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Layout>
  );
}
