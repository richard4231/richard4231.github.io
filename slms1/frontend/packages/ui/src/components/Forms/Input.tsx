import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`form-field ${error ? 'has-error' : ''} ${className}`}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <input id={inputId} {...props} />
      {error && <span className="field-error">{error}</span>}
      {helperText && !error && <span className="field-helper">{helperText}</span>}
    </div>
  );
}
