import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import api from '../api/axios';

export default function OnboardingChecklist() {
  const { user, refreshUser } = useAuth();
  const [checklist, setChecklist] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [joiningDate, setJoiningDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChecklist();
  }, []);

  const fetchChecklist = async () => {
    try {
      const res = await api.get('/checklist');
      setChecklist(res.data.checklist);
      setProgressPercent(res.data.progress_percent);
    } catch {
      setError('Failed to load checklist.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/checklist/${id}`);
      await fetchChecklist();
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed.');
    }
  };

  const handleConfirmJoining = async () => {
    if (!joiningDate) {
      setError('Please select your joining date.');
      return;
    }
    try {
      await api.post('/joining/confirm', { joining_date: joiningDate });
      await refreshUser();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to confirm joining.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="page-header"><h1 className="page-title">Onboarding Checklist</h1></div>
        <p>Loading checklist...</p>
      </Layout>
    );
  }

  const canConfirmJoining = user?.onboarding_status === 'Documents Approved' || user?.onboarding_status === 'Checklist In Progress';
  const mandatoryItems = checklist.filter((c) => c.is_mandatory);
  const mandatoryComplete = mandatoryItems.length > 0 && mandatoryItems.every((c) => c.completed);

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Onboarding Checklist</h1>
        <p className="page-subtitle">Complete all items to finalize your onboarding</p>
      </div>

      <StatusBadge status={user?.onboarding_status} />
      <div className="mt-2 mb-3">
        <ProgressBar percent={progressPercent} label={`Checklist Progress: ${progressPercent}%`} />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card animate-scale-in stagger-2">
        {checklist.map((item) => (
          <div key={item.id} className="checklist-item">
            <input
              type="checkbox"
              className="checklist-checkbox"
              checked={item.completed}
              onChange={() => handleToggle(item.id)}
            />
            <div className="checklist-info">
              <div className="checklist-title">
                {item.title}
                {item.is_mandatory && <span style={{ color: '#dc2626', fontSize: '0.8rem', marginLeft: '0.5rem' }}>(Required)</span>}
              </div>
              <div className="checklist-desc">{item.description}</div>
              {item.completed_at && (
                <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '0.25rem' }}>
                  Completed: {new Date(item.completed_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {user?.onboarding_status === 'Joining Confirmed' ? (
        <div className="alert alert-success mt-2">
          <strong>Joining Confirmed!</strong> Welcome aboard!
          {user?.joining_date && (
            <span> Your joining date is {new Date(user.joining_date).toLocaleDateString()}.</span>
          )}
        </div>
      ) : canConfirmJoining ? (
        <div className="card mt-2 animate-scale-in stagger-3">
          <h3 style={{ marginBottom: '0.75rem' }}>Confirm Joining Date</h3>
          <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Complete all mandatory checklist items, then select your joining date.
          </p>
          <div className="form-group" style={{ maxWidth: '280px' }}>
            <label className="form-label">Joining Date</label>
            <input
              type="date"
              className="form-input"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <button className="btn btn-success mt-2" onClick={handleConfirmJoining} disabled={!mandatoryComplete || !joiningDate}>
            Confirm Joining
          </button>
          {!mandatoryComplete && (
            <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Complete all mandatory checklist items first.
            </p>
          )}
        </div>
      ) : null}
    </Layout>
  );
}
