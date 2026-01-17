const express = require('express');
const router = express.Router();
const prisma = require('../db');

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

module.exports = router;
