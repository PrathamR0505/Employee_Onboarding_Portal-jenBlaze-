import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Setup from './pages/Setup';
import ProfileSetup from './pages/ProfileSetup';
import DocumentUpload from './pages/DocumentUpload';
import DocumentStatus from './pages/DocumentStatus';
import OnboardingChecklist from './pages/OnboardingChecklist';
import HRDashboard from './pages/HRDashboard';
import HRDocumentVerification from './pages/HRDocumentVerification';
import HRCreateAccount from './pages/HRCreateAccount';
import HREmployeeInvite from './pages/HREmployeeInvite';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'hr') return <Navigate to="/hr/dashboard" replace />;
  return <Navigate to="/profile" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/" element={<HomeRedirect />} />

      {/* Employee routes */}
      <Route path="/profile" element={<ProtectedRoute role="employee"><ProfileSetup /></ProtectedRoute>} />
      <Route path="/documents/upload" element={<ProtectedRoute role="employee"><DocumentUpload /></ProtectedRoute>} />
      <Route path="/documents/status" element={<ProtectedRoute role="employee"><DocumentStatus /></ProtectedRoute>} />
      <Route path="/checklist" element={<ProtectedRoute role="employee"><OnboardingChecklist /></ProtectedRoute>} />

      {/* HR routes */}
      <Route path="/hr/dashboard" element={<ProtectedRoute role="hr"><HRDashboard /></ProtectedRoute>} />
      <Route path="/hr/documents" element={<ProtectedRoute role="hr"><HRDocumentVerification /></ProtectedRoute>} />
      <Route path="/hr/create-account" element={<ProtectedRoute role="hr"><HRCreateAccount /></ProtectedRoute>} />
      <Route path="/hr/invite" element={<ProtectedRoute role="hr"><HREmployeeInvite /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
