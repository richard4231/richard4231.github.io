import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
}

export function Alert({
  children,
  variant = 'info',
  title,
  onClose,
}: AlertProps) {
  return (
    <div className={`alert alert-${variant}`} role="alert">
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
      )}
      {title && <strong className="alert-title">{title}</strong>}
      <div className="alert-content">{children}</div>
    </div>
  );
}
