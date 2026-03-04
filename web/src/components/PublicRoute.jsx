import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const PublicRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();
  
  console.log('PublicRoute - isAuthenticated:', isAuthenticated);
  console.log('PublicRoute - user:', user);

  // If user is authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    console.log('PublicRoute - User authenticated, redirecting to dashboard');
    
    // Check user role and redirect accordingly
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // User is not authenticated, render the public page (login/register)
  return children;
};

export default PublicRoute;