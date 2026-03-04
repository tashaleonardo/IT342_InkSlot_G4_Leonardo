import api from './api';

export const authService = {
  // Register new artist
  register: async (registerData) => {
    const response = await api.post('/auth/register', registerData);
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Login artist
  login: async (loginData) => {
    const response = await api.post('/auth/login', loginData);
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      // Verify storage
      console.log('Login - Token stored:', localStorage.getItem('accessToken') ? 'Yes' : 'No');
      console.log('Login - User stored:', localStorage.getItem('user') ? 'Yes' : 'No');
    }
    return response.data;
  },

  // Get current user - FIXED: return just the user data, not the whole response
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      // Return just the user data from the ApiResponse
      return response.data.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.replace('/login');
  },

  // Check if user is authenticated - FIXED: better validation
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    // Check if token exists and has valid format
    if (!token || token.split('.').length !== 3) {
      return false;
    }
    
    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      if (Date.now() >= exp) {
        // Token expired, clear storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        return false;
      }
    } catch (e) {
      console.error('Error parsing token:', e);
      return false;
    }
    
    return true;
  },

  // Get stored user data
  getUser: () => {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('accessToken');
  }
};