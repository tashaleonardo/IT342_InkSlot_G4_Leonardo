import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const PrivateRoute = ({ children, requiredRole = null }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();
  
  console.log('PrivateRoute - isAuthenticated:', isAuthenticated);
  console.log('PrivateRoute - user:', user);

  if (!isAuthenticated) {
    console.log('PrivateRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check for required role if specified
  if (requiredRole && user?.role !== requiredRole) {
    console.log(`PrivateRoute - User role ${user?.role} does not match required role ${requiredRole}`);
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  console.log('PrivateRoute - Authenticated, rendering protected component');
  return children;
};

export default PrivateRoute;