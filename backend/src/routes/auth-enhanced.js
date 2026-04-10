import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import { validateData, validateSchemas, isStrongPassword, isValidEmail } from '../utils/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  ValidationError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../utils/errors.js';
import { config } from '../config/environment.js';
import { authLimiter } from '../utils/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, asyncHandler(async (req, res) => {
  const value = validateData(req.body, validateSchemas.register);

  const { name, email, password } = value;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    if (existingUser.emailVerified) {
      throw new ConflictError('Email already registered', { field: 'email' });
    }
  }

  if (!isStrongPassword(password)) {
    throw new ValidationError('Password does not meet security requirements', {
      requirements: {
        minLength: '8 characters',
        uppercase: '1 uppercase letter',
        lowercase: '1 lowercase letter',
        number: '1 number',
      },
    });
  }

  const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);

  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    emailVerificationToken,
    emailVerificationTokenExpiry,
    emailVerified: false,
    createdAt: new Date(),
    lastLogin: null,
    preferences: {
      notifications: true,
      twoFactorEnabled: false,
    },
  });

  logger.info('User registered successfully', {
    userId: user._id,
    email: user.email,
    requestId: req.id,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await User.findByIdAndUpdate(user._id, {
    refreshTokens: [{ token: refreshTokenHash, createdAt: new Date() }],
  });

  res.status(201).json({
    status: 'success',
    message: 'Registration successful. Please verify your email.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: config.security.jwtExpiry,
      },
    },
  });
}));

router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const value = validateData(req.body, validateSchemas.login);

  const { email, password } = value;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    logger.warn('Failed login attempt', {
      email: user.email,
      requestId: req.id,
    });
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user.status === 'deactivated') {
    throw new UnauthorizedError('This account has been deactivated');
  }

  await User.findByIdAndUpdate(user._id, {
    lastLogin: new Date(),
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await User.findByIdAndUpdate(user._id, {
    $push: {
      refreshTokens: {
        token: refreshTokenHash,
        createdAt: new Date(),
      },
    },
  });

  logger.info('User logged in successfully', {
    userId: user._id,
    email: user.email,
    requestId: req.id,
  });

  res.json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: config.security.jwtExpiry,
      },
    },
  });
}));

router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new UnauthorizedError('Refresh token is required');
  }

  try {
    const decoded = jwt.verify(refreshToken, config.security.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const tokenHashMatch = await Promise.any(
      user.refreshTokens.map(rt =>
        bcrypt.compare(refreshToken, rt.token).then(match => match ? rt : Promise.reject())
      )
    );

    if (!tokenHashMatch) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const newAccessToken = generateAccessToken(user);

    res.json({
      status: 'success',
      data: {
        accessToken: newAccessToken,
        expiresIn: config.security.jwtExpiry,
      },
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Refresh token has expired');
    }
    throw new UnauthorizedError('Invalid refresh token');
  }
}));

router.post('/logout', authMiddleware, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await User.findByIdAndUpdate(req.user.id, {
      $pull: {
        refreshTokens: {
          token: { $eq: refreshToken },
        },
      },
    });
  }

  logger.info('User logged out', {
    userId: req.user.id,
    requestId: req.id,
  });

  res.json({
    status: 'success',
    message: 'Logout successful',
  });
}));

router.post('/request-password-reset', authLimiter, asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email address');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.json({
      status: 'success',
      message: 'If an account exists, password reset instructions have been sent to the email.',
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = await bcrypt.hash(resetToken, 10);
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await User.findByIdAndUpdate(user._id, {
    passwordResetToken: resetTokenHash,
    passwordResetTokenExpiry: resetTokenExpiry,
  });

  logger.info('Password reset requested', {
    userId: user._id,
    email: user.email,
    requestId: req.id,
  });

  res.json({
    status: 'success',
    message: 'If an account exists, password reset instructions have been sent to the email.',
    debug: process.env.NODE_ENV === 'development' ? { resetToken } : undefined,
  });
}));

router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new ValidationError('Token and password are required');
  }

  if (!isStrongPassword(password)) {
    throw new ValidationError('Password does not meet security requirements');
  }

  const user = await User.findOne({
    passwordResetTokenExpiry: { $gt: new Date() },
  });

  if (!user || !(await bcrypt.compare(token, user.passwordResetToken || ''))) {
    throw new UnauthorizedError('Invalid or expired password reset token');
  }

  const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);
  await User.findByIdAndUpdate(user._id, {
    passwordHash,
    passwordResetToken: null,
    passwordResetTokenExpiry: null,
    refreshTokens: [],
  });

  logger.info('Password reset successfully', {
    userId: user._id,
    email: user.email,
    requestId: req.id,
  });

  res.json({
    status: 'success',
    message: 'Password reset successfully',
  });
}));

router.post('/change-password', authMiddleware, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ValidationError('Current and new passwords are required');
  }

  if (!isStrongPassword(newPassword)) {
    throw new ValidationError('New password does not meet security requirements');
  }

  const user = await User.findById(req.user.id);

  const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!passwordMatch) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  const passwordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);
  await User.findByIdAndUpdate(user._id, {
    passwordHash,
    refreshTokens: [],
  });

  logger.info('Password changed successfully', {
    userId: user._id,
    email: user.email,
    requestId: req.id,
  });

  res.json({
    status: 'success',
    message: 'Password changed successfully',
  });
}));

router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ValidationError('Verification token is required');
  }

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid or expired email verification token');
  }

  await User.findByIdAndUpdate(user._id, {
    emailVerified: true,
    emailVerificationToken: null,
    emailVerificationTokenExpiry: null,
  });

  logger.info('Email verified successfully', {
    userId: user._id,
    email: user.email,
    requestId: req.id,
  });

  res.json({
    status: 'success',
    message: 'Email verified successfully',
  });
}));

router.post('/deactivate-account', authMiddleware, asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new ValidationError('Password is required to deactivate account');
  }

  const user = await User.findById(req.user.id);

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    throw new UnauthorizedError('Password is incorrect');
  }

  await User.findByIdAndUpdate(user._id, {
    status: 'deactivated',
    deactivatedAt: new Date(),
    refreshTokens: [],
  });

  logger.info('Account deactivated', {
    userId: user._id,
    email: user.email,
    requestId: req.id,
  });

  res.json({
    status: 'success',
    message: 'Account has been deactivated',
  });
}));

router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash -refreshTokens');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.json({
    status: 'success',
    data: user,
  });
}));

function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    config.security.jwtSecret,
    { expiresIn: config.security.jwtExpiry }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    config.security.jwtSecret,
    { expiresIn: config.security.refreshTokenExpiry }
  );
}

export default router;
