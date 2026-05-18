import React from 'react';

const statusConfig = {
  'Profile Incomplete': { class: 'badge-incomplete', label: 'Profile Incomplete' },
  'Profile Complete': { class: 'badge-complete', label: 'Profile Complete' },
  'Documents Uploaded': { class: 'badge-uploaded', label: 'Documents Uploaded' },
  'Documents Submitted': { class: 'badge-submitted', label: 'Documents Submitted' },
  'Documents Approved': { class: 'badge-approved', label: 'Documents Approved' },
  'Checklist In Progress': { class: 'badge-progress', label: 'Checklist In Progress' },
  'Joining Confirmed': { class: 'badge-confirmed', label: 'Joining Confirmed' },
};

export default function StatusBadge({ status, docStatus }) {
  if (docStatus) {
    const docConfig = {
      pending: { class: 'badge-pending', label: 'Pending' },
      approved: { class: 'badge-approved', label: 'Approved' },
      rejected: { class: 'badge-rejected', label: 'Rejected' },
    };
    const config = docConfig[docStatus] || { class: 'badge-pending', label: docStatus };
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  }

  const config = statusConfig[status] || { class: 'badge-pending', label: status };
  return <span className={`badge ${config.class}`}>{config.label}</span>;
}
