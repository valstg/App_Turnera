import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authRequired, ownerOnly } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = Router();

/**
 * GET /api/users/me
 */
router.get('/me', authRequired, async (req, res) => {
  return res.json({ id: req.user.id, email: req.user.email, role: req.user.role, name: req.user.name });
});

/**
 * POST /api/users
 * Owners can create users. (Optional for your app; keep it for completeness)
 */
router.post('/', authRequired, ownerOnly, async (req, res) => {
  const { email, name, role = 'employee', password } = req.body || {};
  if (!email || !name || !password) return res.status(400).json({ error: 'Missing required fields' });

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return res.status(409).json({ error: 'Email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await prisma.user.create({
    data: { email: email.toLowerCase(), name, role, passwordHash }
  });

  res.status(201).json({ id: created.id, email: created.email, name: created.name, role: created.role });
});

export default router;
