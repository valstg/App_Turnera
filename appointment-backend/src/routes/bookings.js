import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authRequired } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = Router();

/**
 * POST /api/bookings
 * Public endpoint to create a booking (name, email, day, time)
 */
router.post('/', async (req, res) => {
  const { customerName, customerEmail, day, time } = req.body || {};
  if (!customerName || !customerEmail || !day || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const created = await prisma.booking.create({
    data: { customerName, customerEmail, day, time }
  });
  res.status(201).json(created);
});

/**
 * GET /api/bookings
 * Auth required; list bookings with optional filters
 */
/**
 * GET /api/bookings/public/find
 * Público: encuentra el primer turno SIN calificar por email (para la pantalla de rating)
 * Uso: /api/bookings/public/find?email=alguien@correo.com
 */
router.get('/public/find', async (req, res) => {
  const { email } = req.query || {};
  if (!email) return res.status(400).json({ error: 'email requerido' });

  try {
    const found = await prisma.booking.findFirst({
      where: {
        customerEmail: { contains: String(email), mode: 'insensitive' },
        ratedAt: null, // solo no calificados
      },
      orderBy: { bookedAt: 'desc' },
    });
    // Devuelve null si no hay resultados para que el front lo maneje sin romper
    return res.json(found || null);
  } catch (e) {
    return res.status(500).json({ error: 'Error buscando turno' });
  }
});


router.get('/', authRequired, async (req, res) => {
  const { day, rated, email } = req.query;
  const where = {};
  if (day) where.day = String(day);
  if (rated === 'true') where.ratedAt = { not: null };
  if (rated === 'false') where.ratedAt = null;
  if (email) where.customerEmail = { contains: String(email), mode: 'insensitive' };

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { bookedAt: 'desc' },
  });
  res.json(bookings);
});


/**
 * PATCH /api/bookings/:id/rate
 * Public endpoint to add rating/comment to a booking by id
 */
router.patch('/:id/rate', async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body || {};
  if (rating == null || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating must be 1..5' });
  }
  const updated = await prisma.booking.update({
    where: { id },
    data: { rating, comment: comment || null, ratedAt: new Date() }
  }).catch(() => null);

  if (!updated) return res.status(404).json({ error: 'Booking not found' });
  res.json(updated);
});

/**
 * DELETE /api/bookings/:id
 * Auth required; delete a booking
 */
router.delete('/:id', authRequired, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.booking.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: 'Booking not found' });
  }
});

export default router;
