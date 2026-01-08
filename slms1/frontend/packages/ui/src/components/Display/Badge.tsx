import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
}: BadgeProps) {
  return (
    <span className={`badge badge-${variant} badge-${size}`}>
      {children}
    </span>
  );
}

// Predefined badges for common statuses
export function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    active: 'success',
    registered: 'success',
    confirmed: 'success',
    attended: 'success',
    passed: 'success',
    paid: 'success',
    pending: 'warning',
    waitlisted: 'warning',
    waiting: 'warning',
    on_leave: 'warning',
    overdue: 'warning',
    withdrawn: 'danger',
    excluded: 'danger',
    failed: 'danger',
    cancelled: 'danger',
    graduated: 'info',
    completed: 'info',
  };

  return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
}
