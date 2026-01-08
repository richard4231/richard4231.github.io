import React from 'react';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, login } = useAuth();

  if (isLoading) {
    return fallback || <div>Laden...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login
    login();
    return fallback || <div>Weiterleitung zur Anmeldung...</div>;
  }

  // TODO: Check required permissions
  // For now, just check if user exists
  if (!user) {
    return fallback || <div>Zugriff verweigert</div>;
  }

  return <>{children}</>;
}
