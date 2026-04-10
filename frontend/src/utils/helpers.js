/**
 * Utility Functions Library
 * Common helper functions for the application
 */

/**
 * String utilities
 */
export const stringUtils = {
  capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
  
  truncate: (str, length = 100) =>
    str.length > length ? str.substring(0, length) + '...' : str,
  
  slugify: (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-'),
  
  camelCase: (str) =>
    str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
      index === 0 ? match.toLowerCase() : match.toUpperCase()
    ),
  
  getInitials: (name) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
};

/**
 * Number utilities
 */
export const numberUtils = {
  formatNumber: (num) => new Intl.NumberFormat().format(num),
  
  formatCurrency: (num, currency = 'USD') =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(num),
  
  formatPercent: (num, decimals = 1) =>
    `${(num * 100).toFixed(decimals)}%`,
  
  clamp: (num, min, max) => Math.min(Math.max(num, min), max),
  
  round: (num, decimals = 0) =>
    Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals),
};

/**
 * Date utilities
 */
export const dateUtils = {
  formatDate: (date, format = 'MMM DD, YYYY') => {
    const d = new Date(date);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return d.toLocaleDateString('en-US', options);
  },
  
  formatTime: (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  },
  
  getTimeAgo: (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return dateUtils.formatDate(date);
  },
  
  getDayName: (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  },
};

/**
 * Validation utilities
 */
export const validationUtils = {
  isEmail: (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  
  isPhoneNumber: (phone) =>
    /^[\d\s\-\+\(\)]{10,}$/.test(phone.replace(/\s/g, '')),
  
  isUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  isPasswordStrong: (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  },
  
  isEmpty: (value) =>
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0),
};

/**
 * Array utilities
 */
export const arrayUtils = {
  unique: (arr) => [...new Set(arr)],
  
  chunk: (arr, size) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    ),
  
  flatten: (arr) => arr.reduce((acc, val) => acc.concat(val), []),
  
  shuffle: (arr) => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  },
  
  orderBy: (arr, key, direction = 'asc') =>
    [...arr].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    }),
};

/**
 * Object utilities
 */
export const objectUtils = {
  pick: (obj, keys) =>
    keys.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {}),
  
  omit: (obj, keys) =>
    Object.keys(obj)
      .filter((key) => !keys.includes(key))
      .reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {}),
  
  merge: (target, source) => ({
    ...target,
    ...source,
  }),
  
  deepEqual: (obj1, obj2) =>
    JSON.stringify(obj1) === JSON.stringify(obj2),
};

/**
 * Color utilities
 */
export const colorUtils = {
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },
  
  rgbToHex: (r, g, b) => '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join(''),
  
  getLuminance: (r, g, b) =>
    (0.299 * r + 0.587 * g + 0.114 * b) / 255,
  
  isDarkColor: (hex) => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return false;
    return colorUtils.getLuminance(rgb.r, rgb.g, rgb.b) < 0.5;
  },
};

/**
 * LocalStorage utilities
 */
export const storageUtils = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to set storage:', e);
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
      console.error('Failed to get storage:', e);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to remove storage:', e);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
  },
};

/**
 * Debounce and Throttle
 */
export const createDebounce = (func, wait) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const createThrottle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Promise utilities
 */
export const promiseUtils = {
  delay: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  
  retry: async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;
        await promiseUtils.delay(delay);
      }
    }
  },
  
  timeout: (promise, ms) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), ms)
      ),
    ]);
  },
};

export default {
  stringUtils,
  numberUtils,
  dateUtils,
  validationUtils,
  arrayUtils,
  objectUtils,
  colorUtils,
  storageUtils,
  createDebounce,
  createThrottle,
  promiseUtils,
};
