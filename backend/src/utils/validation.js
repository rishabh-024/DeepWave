import Joi from 'joi';
import { ValidationError } from './errors.js';

const htmlEntityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
};

const sanitizeString = (value) => value.replace(/[&<>"'`]/g, (char) => htmlEntityMap[char]);

export const validateSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
    }),
    email: Joi.string().email().lowercase().required().messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
    }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.base': 'Password must contain uppercase, lowercase, and numbers',
        'string.empty': 'Password is required',
      }),
  }),

  login: Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required(),
  }),

  moodEntry: Joi.object({
    mood: Joi.string()
      .valid('happy', 'sad', 'anxious', 'calm', 'energized', 'tired', 'neutral')
      .required(),
    intensity: Joi.number().integer().min(1).max(10).required(),
    notes: Joi.string().max(500).allow(''),
    tags: Joi.array().items(Joi.string().trim()).optional(),
  }),

  track: Joi.object({
    title: Joi.string().min(1).max(255).required(),
    artist: Joi.string().min(1).max(255).required(),
    duration: Joi.number().positive().required(),
    category: Joi.string().required(),
    description: Joi.string().max(1000).allow(''),
    fileUrl: Joi.string().uri().required(),
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string(),
    order: Joi.string().valid('asc', 'desc').default('asc'),
  }),

  profileUpdate: Joi.object({
    name: Joi.string().min(2).max(100),
    email: Joi.string().email().lowercase(),
    preferences: Joi.object().unknown(true),
  }),
};

export const validateData = (data, schema) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const messages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    throw new ValidationError('Validation failed', messages);
  }

  return value;
};

export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return sanitizeString(input);
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeInput(item));
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }

  return input;
};

export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const isStrongPassword = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);

  return (
    password.length >= minLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumbers
  );
};

export const sanitizeForOutput = (obj, excludeFields = ['passwordHash', '__v']) => {
  if (!obj) return null;

  const copy = obj.toObject ? obj.toObject() : { ...obj };

  excludeFields.forEach(field => {
    delete copy[field];
  });

  return copy;
};

export const deepEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

export const validateFileUpload = (file, allowedMimes = ['audio/mpeg', 'audio/wav'], maxSize = 50 * 1024 * 1024) => {
  if (!file) {
    throw new ValidationError('No file provided');
  }

  if (!allowedMimes.includes(file.mimetype)) {
    throw new ValidationError(`Invalid file type. Allowed types: ${allowedMimes.join(', ')}`);
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    throw new ValidationError(`File size exceeds ${maxSizeMB}MB limit`);
  }

  return true;
};

export const getPaginationParams = (page = 1, limit = 10) => {
  const cleanPage = Math.max(1, parseInt(page) || 1);
  const cleanLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const skip = (cleanPage - 1) * cleanLimit;

  return { page: cleanPage, limit: cleanLimit, skip };
};

export default {
  validateSchemas,
  validateData,
  sanitizeInput,
  isValidObjectId,
  isValidEmail,
  isStrongPassword,
  sanitizeForOutput,
  deepEqual,
  validateFileUpload,
  getPaginationParams,
};
