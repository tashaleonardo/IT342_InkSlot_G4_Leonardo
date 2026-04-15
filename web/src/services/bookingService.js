import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Helper to get auth token
const getToken = () => localStorage.getItem('accessToken');

// Helper to check if token is valid
const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// Auth headers with error handling
const authHeaders = () => {
  const token = getToken();
  if (!token || !isTokenValid()) {
    console.warn('No valid auth token found');
    return { headers: {} };
  }
  return {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Error handler
const handleApiError = (error, defaultMessage) => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.message || 
                    error.response.data?.error || 
                    defaultMessage;
    console.error('API Error:', message);
    throw new Error(message);
  } else if (error.request) {
    // Request made but no response
    console.error('Network Error:', error.request);
    throw new Error('Network error. Please check your connection.');
  } else {
    // Something else happened
    console.error('Error:', error.message);
    throw new Error(defaultMessage);
  }
};

// ============== ARTIST ENDPOINTS ==============

/**
 * Get artist's own bookings (optionally filtered by status)
 * @param {string} status - Optional status filter (PENDING, CONFIRMED, COMPLETED, CANCELLED)
 * @returns {Promise<Array>} List of bookings
 */
export const getMyBookings = async (status) => {
  try {
    const params = status && status !== 'ALL' ? `?status=${status}` : '';
    const res = await axios.get(`${API}/artist/bookings${params}`, authHeaders());
    return res.data.data || [];
  } catch (error) {
    return handleApiError(error, 'Failed to load bookings');
  }
};

/**
 * Get single booking by ID
 * @param {number} id - Booking ID
 * @returns {Promise<Object>} Booking details
 */
export const getBookingById = async (id) => {
  try {
    const res = await axios.get(`${API}/artist/bookings/${id}`, authHeaders());
    return res.data.data;
  } catch (error) {
    return handleApiError(error, 'Failed to load booking details');
  }
};

/**
 * Update booking status
 * @param {number} id - Booking ID
 * @param {string} status - New status (CONFIRMED, COMPLETED, CANCELLED)
 * @param {string} cancellationReason - Required if status is CANCELLED
 * @returns {Promise<Object>} Updated booking
 */
export const updateBookingStatus = async (id, status, cancellationReason) => {
  try {
    const payload = { status };
    if (status === 'CANCELLED' && cancellationReason) {
      payload.cancellationReason = cancellationReason;
    }
    const res = await axios.patch(
      `${API}/artist/bookings/${id}/status`,
      payload,
      authHeaders()
    );
    return res.data.data;
  } catch (error) {
    return handleApiError(error, 'Failed to update booking status');
  }
};

/**
 * Get booking counts for dashboard
 * @returns {Promise<Object>} Counts for each status
 */
export const getBookingCounts = async () => {
  try {
    const [pending, confirmed, completed, cancelled] = await Promise.all([
      getMyBookings('PENDING').catch(() => []),
      getMyBookings('CONFIRMED').catch(() => []),
      getMyBookings('COMPLETED').catch(() => []),
      getMyBookings('CANCELLED').catch(() => [])
    ]);
    
    return {
      pending: pending.length,
      confirmed: confirmed.length,
      completed: completed.length,
      cancelled: cancelled.length,
      total: pending.length + confirmed.length + completed.length + cancelled.length
    };
  } catch (error) {
    console.error('Failed to get booking counts:', error);
    return {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      total: 0
    };
  }
};

/**
 * Get today's appointments
 * @returns {Promise<Array>} List of today's appointments
 */
export const getTodaysAppointments = async () => {
  try {
    const allBookings = await getMyBookings();
    const today = new Date().toISOString().split('T')[0];
    return allBookings.filter(booking => 
      booking.appointmentDate === today && 
      booking.status !== 'CANCELLED'
    );
  } catch (error) {
    console.error('Failed to get today\'s appointments:', error);
    return [];
  }
};

// ============== GUEST/PUBLIC ENDPOINTS ==============

/**
 * Create a new booking (public endpoint)
 * @param {Object} req - Booking request object
 * @param {number} req.artistId - ID of the artist
 * @param {string} req.clientName - Client's full name
 * @param {string} req.clientEmail - Client's email
 * @param {string} req.clientPhone - Client's phone number
 * @param {string} req.appointmentDate - Date (YYYY-MM-DD)
 * @param {string} req.appointmentTime - Time (HH:MM)
 * @param {string} req.approximateSize - SMALL, MEDIUM, LARGE, or UNDECIDED
 * @param {string} req.designPreference - Optional design preference
 * @param {string} req.additionalNotes - Optional notes
 * @returns {Promise<Object>} Created booking with reference number
 */
export const createBooking = async (req) => {
  try {
    // Validate required fields
    const requiredFields = ['artistId', 'clientName', 'clientEmail', 'clientPhone', 'appointmentDate', 'appointmentTime', 'approximateSize'];
    for (const field of requiredFields) {
      if (!req[field]) {
        throw new Error(`${field} is required`);
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.clientEmail)) {
      throw new Error('Please enter a valid email address');
    }
    
    // Validate date is not in the past
    const today = new Date().toISOString().split('T')[0];
    if (req.appointmentDate < today) {
      throw new Error('Appointment date cannot be in the past');
    }
    
    const res = await axios.post(`${API}/bookings`, req);
    return res.data.data;
  } catch (error) {
    if (error.message.includes('is required') || error.message.includes('valid email')) {
      throw error;
    }
    return handleApiError(error, 'Failed to create booking');
  }
};

/**
 * Check booking status by reference number (public endpoint)
 * @param {string} ref - Booking reference number (e.g., INK-2026-0001)
 * @returns {Promise<Object>} Booking details
 */
export const checkBookingStatus = async (ref) => {
  try {
    if (!ref || ref.trim() === '') {
      throw new Error('Reference number is required');
    }
    const res = await axios.get(`${API}/bookings/status/${ref}`);
    return res.data.data;
  } catch (error) {
    if (error.message === 'Reference number is required') {
      throw error;
    }
    return handleApiError(error, 'Failed to check booking status');
  }
};

/**
 * Get available time slots for an artist on a specific date
 * @param {number} artistId - Artist ID
 * @param {string} date - Date (YYYY-MM-DD)
 * @returns {Promise<Array>} Available time slots
 */
export const getAvailableTimeSlots = async (artistId, date) => {
  try {
    // First get all bookings for that artist on that date
    const allBookings = await getMyBookings();
    const dateBookings = allBookings.filter(b => 
      b.artistId === artistId && 
      b.appointmentDate === date &&
      b.status !== 'CANCELLED'
    );
    
    // Available time slots (9 AM to 5 PM)
    const allSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const bookedSlots = dateBookings.map(b => b.appointmentTime);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
    
    return availableSlots;
  } catch (error) {
    console.error('Failed to get available time slots:', error);
    // Return all slots as fallback
    return ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  }
};

// ============== UTILITY FUNCTIONS ==============

/**
 * Format booking status for display
 * @param {string} status - Status code
 * @returns {string} Formatted status
 */
export const formatStatus = (status) => {
  const statusMap = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
  };
  return statusMap[status] || status;
};

/**
 * Get status color for styling
 * @param {string} status - Status code
 * @returns {string} Color hex code
 */
export const getStatusColor = (status) => {
  const colorMap = {
    PENDING: '#f59e0b',
    CONFIRMED: '#3b82f6',
    COMPLETED: '#10b981',
    CANCELLED: '#ef4444'
  };
  return colorMap[status] || '#888';
};

/**
 * Format duration in minutes to readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded} hr${rounded !== 1 ? 's' : ''}`;
};

/**
 * Format date for display
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {string} Formatted date
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default {
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  getBookingCounts,
  getTodaysAppointments,
  createBooking,
  checkBookingStatus,
  getAvailableTimeSlots,
  formatStatus,
  getStatusColor,
  formatDuration,
  formatDate
};