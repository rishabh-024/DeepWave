import axios from 'axios';

const DEFAULT_API = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || DEFAULT_API,
  timeout: 10000, // 10s timeout to fail fast on network issues
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 403 || error.response.status === 401)) {
      console.error("Auth Error: Token is invalid or expired. Logging out.");
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
      // Surface clear message for network issues
      console.error('Network Error: Unable to reach backend at', api.defaults.baseURL, error.message);
    }
    return Promise.reject(error);
  }
);

export default api;