import '../styles/ArtistDashboard.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!authService.isAuthenticated()) {
        navigate('/login');
        return;
      }
      try {
        const userData = authService.getUser();
        setUser(userData);
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 2000);
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const userData = authService.getUser();
    console.log('User object:', userData);
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  if (loading) {
    return <div className="ds-loading">Loading...</div>;
  }

  const navItems = [
    { id: 'dashboard', icon: 'fas fa-th-large', label: 'Dashboard' },
    { id: 'profile',   icon: 'fas fa-user',     label: 'My Profile' },
    { id: 'portfolio', icon: 'fas fa-palette',  label: 'Portfolio' },
    { id: 'schedule',  icon: 'fas fa-calendar-alt', label: 'Schedule' },
    { id: 'bookings',  icon: 'fas fa-book',     label: 'Bookings' },
  ];

  return (
    <div className="ds-root">
      {/* Bubble Background */}
      <div className="bubble-field">
        <div className="bubble bubble1"></div>
        <div className="bubble bubble2"></div>
        <div className="bubble bubble3"></div>
        <div className="bubble bubble4"></div>
        <div className="bubble bubble5"></div>
        <div className="bubble bubble6"></div>
      </div>

      {showWelcome && (
        <div className="ds-toast">
          <i className="fas fa-check-circle"></i>
          <span>Welcome back, {user?.fullName?.split(' ')[0]}!</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="ds-sidebar">
        <div className="ds-sidebar-brand">
          <span className="ds-brand-ink">INK</span><span className="ds-brand-slot">SLOT</span>
        </div>

        <nav className="ds-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`ds-nav-item${activeNav === item.id ? ' ds-nav-active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button className="ds-signout" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Area */}
      <div className="ds-main">
        {/* Top Header */}
        <header className="ds-topbar">
          <div className="ds-topbar-left">
            <h1 className="ds-page-title">Artist Portal</h1>
            <p className="ds-page-sub">Welcome back, {user?.fullName?.split(' ')[0]}!</p>
          </div>
          <div className="ds-topbar-right">
            <div className="ds-avatar">
              <i className="fas fa-user"></i>
            </div>
          </div>
        </header>

        {/* Stats Row */}
        <div className="ds-stats-row">
          <div className="ds-stat-card">
            <div className="ds-stat-icon"><i className="fas fa-layer-group"></i></div>
            <div className="ds-stat-body">
              <div className="ds-stat-label">Total Sessions</div>
              <div className="ds-stat-value">0</div>
            </div>
            <button className="ds-stat-cta">View All <i className="fas fa-arrow-right"></i></button>
          </div>

          <div className="ds-stat-card">
            <div className="ds-stat-icon"><i className="fas fa-calendar-check"></i></div>
            <div className="ds-stat-body">
              <div className="ds-stat-label">Appointments</div>
              <div className="ds-stat-value">0</div>
            </div>
            <div className="ds-stat-meta"><i className="fas fa-check-circle"></i> 0 confirmed</div>
          </div>

          <div className="ds-stat-card">
            <div className="ds-stat-icon"><i className="fas fa-star"></i></div>
            <div className="ds-stat-body">
              <div className="ds-stat-label">Reviews</div>
              <div className="ds-stat-value">0</div>
            </div>
            <button className="ds-stat-cta">Review Bookings <i className="fas fa-arrow-right"></i></button>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="ds-schedule-block">
          <div className="ds-schedule-info">
            <h3>Today's Schedule</h3>
            <p><i className="fas fa-clock"></i> No appointments today</p>
          </div>
          <span className="ds-schedule-badge">All Clear</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
