import express from 'express';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const auth = express.Router();

const registerSchema = Joi.object({
  name: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

auth.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: { code: 'invalid_input', message: error.details[0].message } });

    const existing = await User.findOne({ email: value.email });
    if (existing) return res.status(409).json({ error: { code: 'exists', message: 'Email already registered' } });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(value.password, salt);
    const user = await User.create({ name: value.name, email: value.email, passwordHash: hash });

    const payload = { id: user._id, name: user.name, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token });

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: { code: 'server_error', message: 'Internal server error' } });
  }
});

auth.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: { code: 'invalid_input', message: error.details[0].message } });

    console.log(`Attempting login for: ${value.email}`);
    const user = await User.findOne({ email: value.email });

    if (!user) {
      console.log(`Login failed: User not found for email ${value.email}`);
      return res.status(401).json({ error: { code: 'unauthorized', message: 'Invalid credentials' } });
    }

    if (!user.passwordHash) {
        console.log(`Login failed: User ${value.email} has no passwordHash field. The user data might be old.`);
        return res.status(401).json({ error: { code: 'unauthorized', message: 'Invalid credentials (data error).' } });
    }

    console.log(`Comparing password for user ${user.email}...`);
    const matched = await bcrypt.compare(value.password, user.passwordHash);

    if (!matched) {
      console.log(`Login failed: Password mismatch for user ${user.email}`);
      return res.status(401).json({ error: { code: 'unauthorized', message: 'Invalid credentials' } });
    }

    console.log(`Login successful for ${user.email}`);
    const payload = { id: user._id, name: user.name, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: { code: 'server_error', message: 'Internal server error' } });
  }
});

export default auth;