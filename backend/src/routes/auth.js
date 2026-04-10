import express from 'express';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import logger from '../utils/logger.js';

const router = express.Router();

const registerSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  email: Joi.string().trim().email().lowercase().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required(),
  password: Joi.string().required()
});

const createToken = (user) => jwt.sign(
  { id: user._id, name: user.name, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

router.post('/register', async (req, res) => {
  let value;
  try {
    const validation = registerSchema.validate(req.body);
    const { error } = validation;
    value = validation.value;
    if (error) return res.status(400).json({ error: { code: 'invalid_input', message: error.details[0].message } });

    const existing = await User.findOne({ email: value.email });
    if (existing) return res.status(409).json({ error: { code: 'exists', message: 'Email already registered' } });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(value.password, salt);
    const user = await User.create({ name: value.name, email: value.email, passwordHash: hash });

    res.status(201).json({
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    logger.error('Registration error', { error: err.message, stack: err.stack, email: value?.email });
    res.status(500).json({ error: { code: 'server_error', message: 'Internal server error' } });
  }
});

router.post('/login', async (req, res) => {
  let value;
  try {
    const validation = loginSchema.validate(req.body);
    const { error } = validation;
    value = validation.value;
    if (error) return res.status(400).json({ error: { code: 'invalid_input', message: error.details[0].message } });

    const user = await User.findOne({ email: value.email });
    if (!user) return res.status(401).json({ error: { code: 'unauthorized', message: 'Invalid credentials' } });

    const matched = await bcrypt.compare(value.password, user.passwordHash);
    if (!matched) return res.status(401).json({ error: { code: 'unauthorized', message: 'Invalid credentials' } });

    res.json({
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });

  } catch (err) {
    logger.error('Login error', { error: err.message, stack: err.stack, email: value?.email });
    res.status(500).json({ error: { code: 'server_error', message: 'Internal server error' } });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email role createdAt').lean();

    if (!user) {
      return res.status(404).json({ error: { code: 'not_found', message: 'User not found' } });
    }

    res.json({ user });
  } catch (err) {
    logger.error('Me route error', { error: err.message, stack: err.stack, userId: req.user?.id });
    res.status(500).json({ error: { code: 'server_error', message: 'Internal server error' } });
  }
});

export default router;
