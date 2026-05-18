import React from 'react';

export default function ProgressBar({ percent, label }) {
  const displayPercent = Math.min(100, Math.max(0, percent));
  return (
    <div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${displayPercent}%` }} />
      </div>
      <div className="progress-label">
        {label || `${displayPercent}% Complete`}
      </div>
    </div>
  );
}
