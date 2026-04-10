import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  login as loginService,
  register as registerService,
  logout as logoutService
} from '../services/authService.js';
import api from '../services/api.js';
import { useToast } from '../components/ui/Toast';

const AuthContext = createContext(null);

const decodeTokenSafely = (token) => {
  const decodedUser = jwtDecode(token);

  if (decodedUser?.exp && decodedUser.exp * 1000 <= Date.now()) {
    throw new Error('Token has expired');
  }

  return decodedUser;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  // --- Restore session from localStorage ---
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decodedUser = decodeTokenSafely(storedToken);
        setUser(decodedUser);
        setToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (error) {
        console.error('Invalid or expired token, clearing localStorage.');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  // --- Keep token in sync with localStorage ---
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // --- Login ---
  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const data = await loginService(credentials);
      if (data?.token) {
        const decodedUser = decodeTokenSafely(data.token);
        setUser(decodedUser);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        success('Welcome back!', `Hello ${decodedUser.name || decodedUser.email}!`);
      }
      return data;
    } catch (err) {
      console.error('Login failed:', err);
      error('Login Failed', err.message || 'Please check your credentials and try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [success, error]);

  // --- Register ---
  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const data = await registerService(userData);
      if (data?.token) {
        const decodedUser = decodeTokenSafely(data.token);
        setUser(decodedUser);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        success('Account Created!', `Welcome ${decodedUser.name || decodedUser.email}! Your account has been created successfully.`);
      }
      return data;
    } catch (err) {
      console.error('Registration failed:', err);
      error('Registration Failed', err.message || 'Please check your information and try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [success, error]);

  // --- Logout ---
  const logout = useCallback(() => {
    try {
      logoutService();
    } catch (err) {
      console.warn('Logout service failed silently:', err);
    }
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
    success('Logged Out', 'You have been successfully logged out. See you soon!');
  }, [success]);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(token)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// --- Custom hook ---
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
};
