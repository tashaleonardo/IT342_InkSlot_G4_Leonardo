import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './shared/components/PrivateRoute';
import PublicRoute from './shared/components/PublicRoute';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import AdminDashboard from './features/dashboard/AdminDashboard';
import OAuth2Callback from './features/auth/OAuth2Callback';
import HomePage from './features/home/HomePage';
import BookingsPage from './features/booking/BookingsPage';
import GuestBookingPage from './features/booking/GuestBookingPage';
import ArtistsPage from './features/artists/ArtistsPage';


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