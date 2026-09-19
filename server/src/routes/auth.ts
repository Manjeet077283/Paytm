import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { CONFIG } from '../config';

export const authRouter = Router();

// Demo users store
const users = new Map<string, { id: string; name: string; email: string; passwordHash: string; role: string }>();

// Seed default executive demo user
const salt = bcrypt.genSaltSync(10);
users.set('executive@paytm.com', {
  id: 'USR_DEMO_01',
  name: 'Vaibhav Jain',
  email: 'executive@paytm.com',
  passwordHash: bcrypt.hashSync('paytm123', salt),
  role: 'VP of Product & Operations'
});

const AuthBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  name: z.string().optional()
});

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = AuthBodySchema.parse(req.body);
    if (users.has(email)) {
      return res.status(400).json({ success: false, error: 'User already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: `USR_${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      passwordHash,
      role: 'Business Analyst'
    };
    users.set(email, newUser);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, CONFIG.JWT_SECRET, {
      expiresIn: '7d'
    });

    return res.status(201).json({
      success: true,
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = AuthBodySchema.parse(req.body);
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, CONFIG.JWT_SECRET, {
      expiresIn: '7d'
    });

    return res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me
authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Return default demo user session for smooth hackathon demo testing
    return res.json({
      success: true,
      user: {
        id: 'USR_DEMO_01',
        name: 'Vaibhav Jain',
        email: 'executive@paytm.com',
        role: 'VP of Product & Operations'
      }
    });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as any;
    return res.json({ success: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
});
