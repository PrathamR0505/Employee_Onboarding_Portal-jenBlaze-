import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import api from '../api/axios';

export default function ProfileSetup() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    phone: '', date_of_birth: '', gender: '', address: '', city: '', state: '', postal_code: '',
    bank_account_number: '', pan_number: '',
    emergency_contact_name: '', emergency_contact_phone: '',
    education_degree: '', education_institution: '', education_year: '',
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
        const edu = Array.isArray(p.education_json) && p.education_json[0] ? p.education_json[0] : {};
        setForm({
          phone: p.phone || '',
          date_of_birth: p.date_of_birth || '',
          gender: p.gender || '',
          address: p.address || '',
          city: p.city || '',
          state: p.state || '',
          postal_code: p.postal_code || '',
          bank_account_number: '',
          pan_number: '',
          emergency_contact_name: p.emergency_contact_name || '',
          emergency_contact_phone: p.emergency_contact_phone || '',
          education_degree: edu.degree || '',
          education_institution: edu.institution || '',
          education_year: edu.year ? String(edu.year) : '',
        });
      }
    } catch {}
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
        city: form.city,
        state: form.state,
        postal_code: form.postal_code,
        emergency_contact_name: form.emergency_contact_name,
        emergency_contact_phone: form.emergency_contact_phone,
        education_json: [{
          degree: form.education_degree,
          institution: form.education_institution,
          year: form.education_year ? parseInt(form.education_year, 10) : null,
        }],
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

  const status = user?.onboarding_status || 'Profile Incomplete';
  const statusOrder = ['Profile Incomplete', 'Profile Complete', 'Documents Uploaded', 'Documents Submitted', 'Documents Approved', 'Checklist In Progress', 'Joining Confirmed'];
  const currentIdx = statusOrder.indexOf(status);
  const progressPercent = Math.round((currentIdx / (statusOrder.length - 1)) * 100);

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Profile Setup</h1>
        <p className="page-subtitle">Complete your profile to proceed with onboarding</p>
      </div>

      <StatusBadge status={status} />
      <div className="mt-2 mb-3">
        <ProgressBar percent={progressPercent} label={`Onboarding Progress: ${progressPercent}%`} />
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" name="phone" className="form-input" value={form.phone} onChange={handleChange} placeholder="9876543210" />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input type="date" name="date_of_birth" className="form-input" value={form.date_of_birth} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select name="gender" className="form-select" value={form.gender} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Address</label>
              <textarea name="address" className="form-textarea" value={form.address} onChange={handleChange} placeholder="Street address" />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input type="text" name="city" className="form-input" value={form.city} onChange={handleChange} placeholder="Mumbai" />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input type="text" name="state" className="form-input" value={form.state} onChange={handleChange} placeholder="Maharashtra" />
            </div>
            <div className="form-group">
              <label className="form-label">Postal Code</label>
              <input type="text" name="postal_code" className="form-input" value={form.postal_code} onChange={handleChange} placeholder="400001" />
            </div>
            <div className="form-group">
              <label className="form-label">Bank Account Number</label>
              <input type="text" name="bank_account_number" className="form-input" value={form.bank_account_number} onChange={handleChange} placeholder="Encrypted at rest" />
            </div>
            <div className="form-group">
              <label className="form-label">PAN Number</label>
              <input type="text" name="pan_number" className="form-input" value={form.pan_number} onChange={handleChange} placeholder="ABCDE1234F" />
            </div>
            <div className="form-group">
              <label className="form-label">Emergency Contact Name</label>
              <input type="text" name="emergency_contact_name" className="form-input" value={form.emergency_contact_name} onChange={handleChange} placeholder="Spouse/Parent" />
            </div>
            <div className="form-group">
              <label className="form-label">Emergency Contact Phone</label>
              <input type="tel" name="emergency_contact_phone" className="form-input" value={form.emergency_contact_phone} onChange={handleChange} placeholder="9876543210" required />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Education — Degree</label>
              <input type="text" name="education_degree" className="form-input" value={form.education_degree} onChange={handleChange} placeholder="B.Tech" required />
            </div>
            <div className="form-group">
              <label className="form-label">Institution</label>
              <input type="text" name="education_institution" className="form-input" value={form.education_institution} onChange={handleChange} placeholder="University name" required />
            </div>
            <div className="form-group">
              <label className="form-label">Year of Passing</label>
              <input type="number" name="education_year" className="form-input" value={form.education_year} onChange={handleChange} placeholder="2020" required />
            </div>
          </div>
          <div className="mt-2">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

