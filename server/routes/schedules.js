const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

function validateScheduleInput(body) {
  if (!body.day_fr || !body.time) {
    return 'day_fr et time sont obligatoires';
  }
  return null;
}

router.get('/', async (req, res) => {
  try {
    const schedules = await prisma.massSchedule.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Liste complete (admin)
router.get('/all', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const schedules = await prisma.massSchedule.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const validationError = validateScheduleInput(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }
  try {
    const schedule = await prisma.massSchedule.create({ data: req.body });
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const schedule = await prisma.massSchedule.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(schedule);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Horaire introuvable' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.massSchedule.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Horaire introuvable' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
