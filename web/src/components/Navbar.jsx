import { Link } from 'react-router-dom';
import { authService } from '../services/authService';

const Navbar = () => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser(); 

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          INKSLOT <span>Artist Portal</span>
        </Link>
        
        <div className="navbar-menu">
          {!isAuthenticated ? (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ width: 'auto' }}>
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="auth-buttons">
              <span className="user-name">{user?.full_name || 'Artist'}</span>
              <button onClick={handleLogout} className="btn btn-outline" style={{ width: 'auto', padding: '0.6rem 1.5rem' }}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {};

export default Navbar;
