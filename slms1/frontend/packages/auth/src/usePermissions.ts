import { useAuth } from './AuthProvider';

/**
 * Hook to check user permissions
 */
export function usePermissions() {
  const { user, isAuthenticated } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated || !user) {
      return false;
    }

    // TODO: Implement actual permission checking from user roles
    // For now, admins have all permissions
    if (user.userType === 'admin') {
      return true;
    }

    return false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(hasPermission);
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(hasPermission);
  };

  const isAdmin = user?.userType === 'admin';
  const isLecturer = user?.userType === 'lecturer';
  const isStudent = user?.userType === 'student';

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isLecturer,
    isStudent,
  };
}
