import axios from 'axios';

// Smart baseURL determination:
// Uses configured VITE_API_BASE_URL or defaults to live production Render backend
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;
  return 'https://the-prime-cafe-backend.onrender.com/api';
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

// Response interceptor with automatic fallback to live backend if localhost fails
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (config && !config._retry && config.baseURL && config.baseURL.includes('localhost')) {
      config._retry = true;
      config.baseURL = 'https://the-prime-cafe-backend.onrender.com/api';
      api.defaults.baseURL = 'https://the-prime-cafe-backend.onrender.com/api';
      return api(config);
    }
    return Promise.reject(error);
  }
);

export default api;
