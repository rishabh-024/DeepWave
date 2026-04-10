import axios from 'axios';

const DEFAULT_API = 'http://localhost:4000/api';

export const extractApiErrorMessage = (error, fallback = 'Something went wrong') => (
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback
);

// Create API instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || DEFAULT_API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and auth
api.interceptors.response.use(
  (response) => {
    // Successful response
    return response;
  },
  (error) => {
    // Handle different error scenarios
    const status = error.response?.status;
    const message = extractApiErrorMessage(error, error.message);

    // Auth errors
    if (status === 401 || status === 403) {
      console.error('Auth Error: Unauthorized access');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Network errors
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      console.error('Network Error: Unable to reach backend', error.message);
      error.message = 'Network error. Please check your connection.';
    }

    // Timeout errors
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.';
    }

    // Log error for debugging
    console.error('API Error:', {
      status,
      message,
      url: error.config?.url,
      method: error.config?.method,
    });

    return Promise.reject(error);
  }
);

/**
 * Enhanced API methods with better error handling
 */
const apiMethods = {
  /**
   * GET request
   */
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw {
        status: error.response?.status,
        message: extractApiErrorMessage(error),
        error,
      };
    }
  },

  /**
   * POST request
   */
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw {
        status: error.response?.status,
        message: extractApiErrorMessage(error),
        error,
      };
    }
  },

  /**
   * PUT request
   */
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw {
        status: error.response?.status,
        message: extractApiErrorMessage(error),
        error,
      };
    }
  },

  /**
   * PATCH request
   */
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw {
        status: error.response?.status,
        message: extractApiErrorMessage(error),
        error,
      };
    }
  },

  /**
   * DELETE request
   */
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw {
        status: error.response?.status,
        message: extractApiErrorMessage(error),
        error,
      };
    }
  },
};

export default api;
export { apiMethods };
