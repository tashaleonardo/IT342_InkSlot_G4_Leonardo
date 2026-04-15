// src/pages/HomePage.jsx
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="bubble-field">
        <div className="bubble bubble1"></div>
        <div className="bubble bubble2"></div>
        <div className="bubble bubble3"></div>
        <div className="bubble bubble4"></div>
        <div className="bubble bubble5"></div>
        <div className="bubble bubble6"></div>
      </div>

      <div className="home-container">
        {/* Header with Login button */}
        <div className="home-header">
          <div className="home-logo">
            INK<span>SLOT</span>
          </div>
          <Link to="/login" className="login-nav-btn">
            <i className="fas fa-user"></i> Login
          </Link>
        </div>

        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">
            Book Your Next<br />
            <span>Masterpiece</span>
          </h1>
          <p className="hero-subtitle">
            Connect with top-rated tattoo artists. Browse portfolios, 
            check availability, and book appointments instantly.
          </p>
          <div className="hero-buttons">
            <Link to="/artists" className="btn-primary-hero">
              Browse Artists <i className="fas fa-arrow-right"></i>
            </Link>
            <Link to="/gallery" className="btn-secondary-hero">
              View Gallery
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <h2 className="section-title">Why Choose InkSlot?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <i className="fas fa-search"></i>
              <h3>Discover Artists</h3>
              <p>Browse through curated portfolios of professional tattoo artists</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-calendar-check"></i>
              <h3>Easy Booking</h3>
              <p>Book appointments directly with your favorite artists</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-shield-alt"></i>
              <h3>Secure & Safe</h3>
              <p>Verified artists and secure payment system</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="home-footer">
          <p>&copy; 2024 InkSlot - Tattoo Booking Platform</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;