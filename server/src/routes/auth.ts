import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { CONFIG } from '../config';
import { Storage, UserRecord } from '../storage/db';

export const authRouter = Router();

const RegisterBodySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.string().optional()
});

const LoginBodySchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required')
});

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = RegisterBodySchema.parse(req.body);
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await Storage.getUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists. Please sign in.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: UserRecord = {
      id: `USR_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: role || 'Business Analyst'
    };

    await Storage.saveUser(newUser);

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      CONFIG.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors[0]?.message || 'Invalid input' });
    }
    return res.status(400).json({ success: false, error: err.message || 'Registration failed' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = LoginBodySchema.parse(req.body);
    const normalizedEmail = email.toLowerCase().trim();

    const user = await Storage.getUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password. Please check your credentials.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password. Please check your credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      CONFIG.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors[0]?.message || 'Invalid input' });
    }
    return res.status(400).json({ success: false, error: err.message || 'Login failed' });
  }
});

// GET /api/auth/me
authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing auth token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as any;
    return res.json({ success: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Session expired or invalid. Please sign in again.' });
  }
});
