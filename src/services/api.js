import axios from 'axios';

// Smart baseURL determination:
// When running locally on localhost / 127.0.0.1, prioritize local backend on port 5000
// so newly created routes (like /api/reviews and /api/loyalty) work instantly without waiting for Render deployment.
const getBaseURL = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl && envUrl.includes('localhost')) {
      return envUrl;
    }
    return 'http://localhost:5000/api';
  }
  return import.meta.env.VITE_API_BASE_URL || 'https://the-prime-cafe-backend.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach Bearer token from localStorage as fallback
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('akc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized occurs on protected routes (not login/check), optionally handle
    return Promise.reject(error);
  }
);

export default api;
