import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authRequired } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = Router();

/**
 * The schedule is stored as JSON in the settings table under key 'schedule'
 * Shape: { weeklySchedule: DaySchedule[], updatedAt: ISO }
 */

/**
 * GET /api/schedule
 * Public: allow reading schedule to render booking options
 */
router.get('/', async (req, res) => {
  const setting = await prisma.setting.findUnique({ where: { key: 'schedule' } });
  const value = setting ? JSON.parse(setting.value) : { weeklySchedule: [
    { day: 'Monday', isEnabled: true, startTime: '09:00', endTime: '17:00', overbookingRules: [] },
    { day: 'Tuesday', isEnabled: true, startTime: '09:00', endTime: '17:00', overbookingRules: [] },
    { day: 'Wednesday', isEnabled: true, startTime: '09:00', endTime: '17:00', overbookingRules: [] },
    { day: 'Thursday', isEnabled: true, startTime: '09:00', endTime: '17:00', overbookingRules: [] },
    { day: 'Friday', isEnabled: true, startTime: '09:00', endTime: '17:00', overbookingRules: [] },
    { day: 'Saturday', isEnabled: false, startTime: '09:00', endTime: '13:00', overbookingRules: [] },
    { day: 'Sunday', isEnabled: false, startTime: '09:00', endTime: '13:00', overbookingRules: [] }
  ], updatedAt: new Date().toISOString() };
  res.json(value);
});

/**
 * PUT /api/schedule
 * Auth: any logged-in user (owner/manager) can update; you can tighten if needed
 * body: { weeklySchedule: [...] }
 */
router.put('/', authRequired, async (req, res) => {
  const { weeklySchedule } = req.body || {};
  if (!weeklySchedule || !Array.isArray(weeklySchedule) || weeklySchedule.length !== 7) {
    return res.status(400).json({ error: 'Invalid weeklySchedule: must be array length 7' });
  }
  const value = { weeklySchedule, updatedAt: new Date().toISOString() };
  const updated = await prisma.setting.upsert({
    where: { key: 'schedule' },
    create: { key: 'schedule', value: JSON.stringify(defaultSchedule)},
    update: { value: JSON.stringify(defaultSchedule) }
  });
  res.json(updated.value);
});

export default router;
