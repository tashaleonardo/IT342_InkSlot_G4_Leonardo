import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuth2Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Extract tokens and role from URL query params
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const refreshToken = params.get('refreshToken');
    const role = params.get('role');

    if (token) {
      // Store tokens same way as regular login
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);

      // Fetch user info and store
      fetch('http://localhost:8080/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.data));
            // Redirect based on role
            if (role === 'ADMIN') {
              navigate('/admin/dashboard', { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          }
        })
        .catch(() => navigate('/login', { replace: true }));
    } else {
      // No token — something went wrong
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="ds-loading">
      <span>Signing you in...</span>
    </div>
  );
};

export default OAuth2Callback;
