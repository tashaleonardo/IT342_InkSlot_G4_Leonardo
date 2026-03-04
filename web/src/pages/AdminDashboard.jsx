import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import api from '../services/api';
import '../styles/Admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('dashboard-home');
  const [user, setUser] = useState(null);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);

  const [artistForm, setArtistForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => { checkAuth(); }, 100);
    return () => clearTimeout(timer);
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      if (!authService.isAuthenticated()) { navigate('/login'); return; }
      const userData = await authService.getCurrentUser();
      if (!userData || userData.role !== 'ADMIN') { navigate('/login'); return; }
      setUser(userData);
      await fetchArtists();
      setUser(userData);
      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 2000);
    } catch (error) {
      console.error('Auth check failed:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchArtists = async () => {
    try {
      setFetchError('');
      const response = await api.get('/admin/artists');
      setArtists(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch artists:', error);
      setFetchError('Failed to load artists. Please try again.');
      if (error.response?.status === 401 || error.response?.status === 403) navigate('/login');
    }
  };

  const handleLogout = () => { authService.logout(); navigate('/login'); };

  const handleCreateArtist = async (e) => {
    e.preventDefault();
    setFormError(''); setFormSuccess(''); setFormLoading(true);
    try {
      if (!artistForm.firstName || !artistForm.lastName || !artistForm.email || !artistForm.password) {
        setFormError('All fields are required'); setFormLoading(false); return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(artistForm.email)) {
        setFormError('Please enter a valid email address'); setFormLoading(false); return;
      }
      if (artistForm.password.length < 6) {
        setFormError('Password must be at least 6 characters'); setFormLoading(false); return;
      }
      const fullName = `${artistForm.firstName} ${artistForm.lastName}`.trim();
      const response = await api.post('/admin/artists', { fullName, email: artistForm.email, password: artistForm.password, role: 'ARTIST' });
      if (response.data.success) {
        setFormSuccess('Artist account created successfully!');
        setArtistForm({ firstName: '', lastName: '', email: '', password: '' });
        await fetchArtists();
      }
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to create artist account');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleArtistStatus = async (artistId, currentStatus) => {
    try {
      await api.patch(`/admin/artists/${artistId}/status`, { isActive: !currentStatus });
      setArtists(artists.map(a => a.id === artistId ? { ...a, isActive: !currentStatus } : a));
    } catch (error) {
      setFetchError('Failed to update artist status.');
    }
  };

  const handleDeleteArtist = async (artistId) => {
    if (!window.confirm('Delete this artist account? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/artists/${artistId}`);
      setArtists(artists.filter(a => a.id !== artistId));
    } catch (error) {
      setFetchError('Failed to delete artist.');
    }
  };

  if (loading) {
    return <div className="ds-loading">Loading...</div>;
  }

  const navItems = [
    { id: 'dashboard-home', icon: 'fas fa-th-large', label: 'Dashboard' },
    { id: 'manage-artists', icon: 'fas fa-users',    label: 'Manage Artists' },
    { id: 'account-settings', icon: 'fas fa-cog',   label: 'Settings' },
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
            <h1 className="ds-page-title">Admin Portal</h1>
            <p className="ds-page-sub">Welcome back, {user?.fullName?.split(' ')[0]}!</p>
          </div>
          <div className="ds-topbar-right">
            <div className="ds-avatar"><i className="fas fa-user-shield"></i></div>
          </div>
        </header>

        {/* Dashboard Home */}
        {activeNav === 'dashboard-home' && (
          <>
            <div className="ds-stats-row">
              <div className="ds-stat-card">
                <div className="ds-stat-icon"><i className="fas fa-users"></i></div>
                <div className="ds-stat-body">
                  <div className="ds-stat-label">Total Artists</div>
                  <div className="ds-stat-value">{artists.length}</div>
                </div>
                <button className="ds-stat-cta" onClick={() => setActiveNav('manage-artists')}>
                  Manage <i className="fas fa-arrow-right"></i>
                </button>
              </div>

              <div className="ds-stat-card">
                <div className="ds-stat-icon"><i className="fas fa-user-check"></i></div>
                <div className="ds-stat-body">
                  <div className="ds-stat-label">Active Artists</div>
                  <div className="ds-stat-value">{artists.filter(a => a.isActive).length}</div>
                </div>
                <div className="ds-stat-meta"><i className="fas fa-check-circle"></i> Currently active</div>
              </div>

              <div className="ds-stat-card">
                <div className="ds-stat-icon"><i className="fas fa-user-slash"></i></div>
                <div className="ds-stat-body">
                  <div className="ds-stat-label">Inactive Artists</div>
                  <div className="ds-stat-value">{artists.filter(a => !a.isActive).length}</div>
                </div>
                <div className="ds-stat-meta"><i className="fas fa-minus-circle"></i> Deactivated</div>
              </div>
            </div>

            <div className="ds-schedule-block">
              <div className="ds-schedule-info">
                <h3>Quick Actions</h3>
                <p><i className="fas fa-user-plus"></i> Create a new artist account</p>
              </div>
              <button className="ds-schedule-badge-btn" onClick={() => setActiveNav('manage-artists')}>
                Add Artist
              </button>
            </div>

            {fetchError && (
              <div className="ds-alert-error">
                <i className="fas fa-exclamation-circle"></i> {fetchError}
              </div>
            )}
          </>
        )}

        {/* Manage Artists */}
        {activeNav === 'manage-artists' && (
          <div className="adm-content">
            {/* Create Form */}
            <div className="adm-form-card">
              <h2 className="adm-section-title">Create Artist Account</h2>

              {formError && <div className="ds-alert-error"><i className="fas fa-exclamation-circle"></i> {formError}</div>}
              {formSuccess && <div className="ds-alert-success"><i className="fas fa-check-circle"></i> {formSuccess}</div>}

              <form onSubmit={handleCreateArtist} className="adm-form">
                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label className="adm-label">First Name</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={artistForm.firstName}
                      onChange={(e) => setArtistForm({...artistForm, firstName: e.target.value})}
                      placeholder="First name"
                      disabled={formLoading}
                      required
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Last Name</label>
                    <input
                      type="text"
                      className="adm-input"
                      value={artistForm.lastName}
                      onChange={(e) => setArtistForm({...artistForm, lastName: e.target.value})}
                      placeholder="Last name"
                      disabled={formLoading}
                      required
                    />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Email Address</label>
                  <input
                    type="email"
                    className="adm-input"
                    value={artistForm.email}
                    onChange={(e) => setArtistForm({...artistForm, email: e.target.value})}
                    placeholder="artist@example.com"
                    disabled={formLoading}
                    required
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Temporary Password</label>
                  <input
                    type="password"
                    className="adm-input"
                    value={artistForm.password}
                    onChange={(e) => setArtistForm({...artistForm, password: e.target.value})}
                    placeholder="Min. 6 characters"
                    disabled={formLoading}
                    required
                    minLength="6"
                  />
                </div>

                <button type="submit" className={`adm-submit-btn${formLoading ? ' loading' : ''}`} disabled={formLoading}>
                  {formLoading ? <><span className="adm-spinner"></span> Creating...</> : 'Create Artist Account'}
                </button>
              </form>
            </div>

            {/* Artists Table */}
            <div className="adm-table-card">
              <h2 className="adm-section-title">All Artists</h2>
              {artists.length === 0 ? (
                <p className="adm-empty">No artists yet. Create the first one above.</p>
              ) : (
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {artists.map((artist) => (
                        <tr key={artist.id}>
                          <td>{artist.fullName}</td>
                          <td>{artist.email}</td>
                          <td>
                            <span className={`adm-badge ${artist.isActive ? 'active' : 'inactive'}`}>
                              {artist.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="adm-actions">
                              <button
                                className="adm-icon-btn"
                                onClick={() => handleToggleArtistStatus(artist.id, artist.isActive)}
                                title={artist.isActive ? 'Deactivate' : 'Activate'}
                              >
                                <i className={`fas ${artist.isActive ? 'fa-ban' : 'fa-check'}`}></i>
                              </button>
                              <button
                                className="adm-icon-btn danger"
                                onClick={() => handleDeleteArtist(artist.id)}
                                title="Delete"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Account Settings */}
        {activeNav === 'account-settings' && (
          <div className="adm-content">
            <div className="adm-form-card">
              <h2 className="adm-section-title">Account Settings</h2>
              <p className="adm-empty">Admin account settings will be available here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
