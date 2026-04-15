// src/pages/ArtistsPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ArtistsPage.css';

const ArtistsPage = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8080/api/v1/artists');
      console.log('Full response:', response);
      console.log('Artists data:', response.data.data);
      
      // response.data.data contains the artists array
      if (response.data.success && Array.isArray(response.data.data)) {
        setArtists(response.data.data);
      } else {
        setArtists([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Unable to load artists. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredArtists = artists.filter(artist =>
    artist.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookNow = (artistId, artistName) => {
    navigate(`/booking?artistId=${artistId}&artistName=${encodeURIComponent(artistName)}`);
  };

  return (
    <div className="artists-page">
      {/* Bubble Background */}
      <div className="bubble-field">
        <div className="bubble bubble1"></div>
        <div className="bubble bubble2"></div>
        <div className="bubble bubble3"></div>
        <div className="bubble bubble4"></div>
        <div className="bubble bubble5"></div>
        <div className="bubble bubble6"></div>
      </div>

      <div className="artists-container">
        {/* Header */}
        <div className="artists-header">
          <Link to="/" className="back-home-btn">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
          <div className="artists-title-section">
            <h1 className="artists-title">Meet Our Artists</h1>
            <p className="artists-subtitle">
              Book your next masterpiece with our talented tattoo artists
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Search by artist name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="search-clear" onClick={() => setSearchTerm('')}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="artists-loading">
            <div className="spinner"></div>
            <p>Loading artists...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="artists-error">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
            <button onClick={fetchArtists} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {/* Artists Grid */}
        {!loading && !error && (
          <>
            {filteredArtists.length === 0 ? (
              <div className="no-artists">
                <i className="fas fa-user-slash"></i>
                <h3>No artists found</h3>
                <p>{searchTerm ? `No artists matching "${searchTerm}"` : 'No artists available at the moment'}</p>
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="clear-search-btn">
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="artists-count">
                  {filteredArtists.length} {filteredArtists.length === 1 ? 'Artist' : 'Artists'} Available
                </div>
                <div className="artists-grid">
                  {filteredArtists.map((artist) => (
                    <div key={artist.id} className="artist-card">
                      <div className="artist-avatar">
                        <div className="avatar-placeholder">
                          <i className="fas fa-user"></i>
                        </div>
                        <div className={`artist-status ${artist.isActive !== false ? 'active' : 'inactive'}`}>
                          {artist.isActive !== false ? 'Available' : 'Unavailable'}
                        </div>
                      </div>
                      <div className="artist-info">
                        <h3 className="artist-name">{artist.fullName}</h3>
                        <p className="artist-role">
                          <i className="fas fa-palette"></i> Tattoo Artist
                        </p>
                        <p className="artist-email">
                          <i className="fas fa-envelope"></i> {artist.email}
                        </p>
                      </div>
                      <div className="artist-actions">
                        <button
                          className="book-btn"
                          onClick={() => handleBookNow(artist.id, artist.fullName)}
                          disabled={artist.isActive === false}
                        >
                          <i className="fas fa-calendar-check"></i>
                          {artist.isActive !== false ? 'Book Appointment' : 'Currently Unavailable'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ArtistsPage;