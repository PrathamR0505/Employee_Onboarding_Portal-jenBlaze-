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
    { to: '/profile', label: 'Profile Setup', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
    { to: '/documents/upload', label: 'Document Verification', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /> },
    { to: '/documents/status', label: 'Document Status', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
    { to: '/checklist', label: 'Onboarding Checklist', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /> },
  ];

  const hrLinks = [
    { to: '/hr/dashboard', label: 'Dashboard', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /> },
    { to: '/hr/documents', label: 'Document Verification', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
    { to: '/hr/invite', label: 'Invite Employee', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /> },
    { to: '/hr/create-account', label: 'Create HR Account', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
  ];

  const links = isHR ? hrLinks : employeeLinks;

  return (
    <div className="app-layout" style={{ background: '#E6E6E6', fontFamily: '"Inter", "Segoe UI", sans-serif', minHeight: '100vh', display: 'flex' }}>
      <aside style={{
        width: '280px',
        background: '#BAC8B1',
        borderRight: '1px solid #BAC8B1',
        padding: '2.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        boxShadow: '4px 0 24px rgba(124, 58, 237, 0.05)',
        overflowY: 'auto'
      }}>
        {/* Brand Header */}
        <div style={{
          fontSize: '1.4rem',
          fontWeight: 800,
          color: '#404E3B',
          paddingBottom: '2.5rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          letterSpacing: '-0.02em'
        }}>
          <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #7B9669 0%, #6C8480 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(109, 40, 217, 0.3)' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          Hacka<span style={{ color: '#7B9669' }}>holics</span>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', paddingLeft: '0.75rem' }}>Menu</p>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                color: isActive ? '#7B9669' : '#6b7280',
                background: isActive ? '#BAC8B1' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? 'inset 3px 0 0 0 #7B9669' : 'none'
              })}
              onMouseEnter={(e) => {
                if (e.currentTarget.style.background === 'transparent' || e.currentTarget.style.background === '') {
                  e.currentTarget.style.background = '#E6E6E6';
                  e.currentTarget.style.color = '#4b5563';
                }
              }}
              onMouseLeave={(e) => {
                if (e.currentTarget.style.background === 'rgb(250, 245, 255)' || e.currentTarget.style.background === '#E6E6E6') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }
              }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {link.icon}
              </svg>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div style={{ marginTop: 'auto', background: '#E6E6E6', borderRadius: '16px', padding: '1.25rem', border: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#BAC8B1', color: '#7B9669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#404E3B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name || 'User'}</p>
              <p style={{ fontSize: '0.75rem', color: '#7B9669', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{isHR ? 'HR Admin' : 'Employee'}</p>
            </div>
          </div>
          <button 
            style={{ width: '100%', padding: '0.75rem', background: '#BAC8B1', border: '1px solid #9AA991', borderRadius: '10px', color: '#ef4444', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s', fontSize: '0.9rem' }}
            onClick={handleLogout}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#9AA991'; }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Logout
          </button>
        </div>
      </aside>
      
      <main className="main-content" style={{ flex: 1, marginLeft: '280px', padding: '2.5rem', background: '#E6E6E6' }}>
        {children}
      </main>
    </div>
  );
}
