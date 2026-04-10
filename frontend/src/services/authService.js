import api, { extractApiErrorMessage } from './api';

const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw new Error(extractApiErrorMessage(error, "Login failed"));
  }
};

const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error.response?.data || error.message);
    throw new Error(extractApiErrorMessage(error, "Registration failed"));
  }
};

const logout = () => {
  localStorage.removeItem('token');
};

export { login, register, logout };
