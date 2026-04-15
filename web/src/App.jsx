import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import OAuth2Callback from './pages/OAuth2Callback';
import HomePage from './pages/HomePage'; 
import BookingsPage from './pages/BookingsPage';
import GuestBookingPage from './pages/GuestBookingPage';
import ArtistsPage from './pages/ArtistsPage';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public home/booking page - no redirect! */}
          <Route path="/" element={<HomePage />} />
          
          {/* Login route - PublicRoute handles redirect if already logged in */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route path="/artists" element={<ArtistsPage />} />

          {/* NEW: Guest booking route - public access */}
          <Route path="/booking" element={<GuestBookingPage />} />
          
          {/* Private routes with role-based access control */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute requiredRole="ARTIST">
                <Dashboard />
              </PrivateRoute>
            }
          />
          
          {/* NEW: Artist bookings management route */}
          <Route
            path="/dashboard/bookings"
            element={
              <PrivateRoute requiredRole="ARTIST">
                <BookingsPage />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          
          <Route path="/oauth2/callback" element={<OAuth2Callback />} />
          
          {/* Catch all route - redirect to home, not login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;