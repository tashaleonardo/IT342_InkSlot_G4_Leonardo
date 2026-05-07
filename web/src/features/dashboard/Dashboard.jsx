import '../../styles/ArtistDashboard.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../auth/authService';
import { getMyBookings } from '../booking/bookingService';


const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [showWelcome, setShowWelcome] = useState(false);

  // Booking stats
  const [pendingCount, setPendingCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState([]);

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

        // Fetch booking stats
        await fetchBookingStats();
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchBookingStats = async () => {
    try {
      const [pending, confirmed, completed, all] = await Promise.all([
        getMyBookings('PENDING').catch(() => []),
        getMyBookings('CONFIRMED').catch(() => []),
        getMyBookings('COMPLETED').catch(() => []),
        getMyBookings().catch(() => [])
      ]);

      setPendingCount(pending.length);
      setConfirmedCount(confirmed.length);
      setCompletedCount(completed.length);
      setTotalBookings(all.length);

      // Check for today's appointments
      const today = new Date().toISOString().split('T')[0];
      const todayApps = all.filter(b => b.appointmentDate === today && b.status !== 'CANCELLED');
      setTodayAppointments(todayApps);
    } catch (error) {
      console.error('Failed to fetch booking stats:', error);
    }
  };

  const handleNavClick = (item) => {
    setActiveNav(item.id);
    if (item.path) {
      navigate(item.path);
    }
  };

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
    { id: 'bookings',  icon: 'fas fa-book',     label: 'Bookings', path: '/dashboard/bookings' },
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
              onClick={() => handleNavClick(item)}
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
            <div className="ds-stat-icon"><i className="fas fa-calendar-alt"></i></div>
            <div className="ds-stat-body">
              <div className="ds-stat-label">Total Bookings</div>
              <div className="ds-stat-value">{totalBookings}</div>
            </div>
            <button
              className="ds-stat-cta"
              onClick={() => navigate('/dashboard/bookings')}
            >
              View All <i className="fas fa-arrow-right"></i>
            </button>
          </div>

          <div className="ds-stat-card">
            <div className="ds-stat-icon"><i className="fas fa-clock"></i></div>
            <div className="ds-stat-body">
              <div className="ds-stat-label">Pending</div>
              <div className="ds-stat-value">{pendingCount}</div>
            </div>
            <button
              className="ds-stat-cta"
              onClick={() => navigate('/dashboard/bookings?status=PENDING')}
            >
              Review <i className="fas fa-arrow-right"></i>
            </button>
          </div>

          <div className="ds-stat-card">
            <div className="ds-stat-icon"><i className="fas fa-check-circle"></i></div>
            <div className="ds-stat-body">
              <div className="ds-stat-label">Confirmed</div>
              <div className="ds-stat-value">{confirmedCount}</div>
            </div>
            <div className="ds-stat-meta">
              <i className="fas fa-check"></i> {completedCount} completed
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="ds-schedule-block">
          <div className="ds-schedule-info">
            <h3>Today's Schedule</h3>
            {todayAppointments.length === 0 ? (
              <p><i className="fas fa-clock"></i> No appointments today</p>
            ) : (
              <p><i className="fas fa-calendar-check"></i> {todayAppointments.length} appointment(s) today</p>
            )}
          </div>
          {todayAppointments.length > 0 ? (
            <button
              className="ds-schedule-badge-btn"
              onClick={() => navigate('/dashboard/bookings')}
            >
              View Schedule →
            </button>
          ) : (
            <span className="ds-schedule-badge">All Clear</span>
          )}
        </div>

        {/* Quick Actions - Only show if there are pending bookings */}
        {pendingCount > 0 && (
          <div className="ds-schedule-block" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <div className="ds-schedule-info">
              <h3 style={{ color: '#f59e0b' }}>Pending Approvals</h3>
              <p><i className="fas fa-bell"></i> You have {pendingCount} booking request(s) waiting for your confirmation</p>
            </div>
            <button
              className="ds-schedule-badge-btn"
              onClick={() => navigate('/dashboard/bookings?status=PENDING')}
              style={{ background: '#f59e0b', color: '#000' }}
            >
              Review Now →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
