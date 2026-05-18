import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHR = user?.role === 'hr';

  const employeeLinks = [
    { to: '/profile', label: 'Profile Setup' },
    { to: '/documents/upload', label: 'Upload Documents' },
    { to: '/documents/status', label: 'Document Status' },
    { to: '/checklist', label: 'Onboarding Checklist' },
  ];

  const hrLinks = [
    { to: '/hr/dashboard', label: 'Dashboard' },
    { to: '/hr/documents', label: 'Document Verification' },
    { to: '/hr/invite', label: 'Invite Employee' },
    { to: '/hr/create-account', label: 'Create HR Account' },
  ];

  const links = isHR ? hrLinks : employeeLinks;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">Onboarding Portal</div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>
            {user?.name} ({isHR ? 'HR' : 'Employee'})
          </div>
          <button className="btn btn-sm btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', width: '100%' }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
