import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function LoadingSpinner({
  size = 'md',
  label = 'Laden...',
}: LoadingSpinnerProps) {
  return (
    <div className={`loading-spinner loading-spinner-${size}`} role="status">
      <span className="spinner" />
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );
}
