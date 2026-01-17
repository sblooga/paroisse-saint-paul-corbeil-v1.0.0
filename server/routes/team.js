const express = require('express');
const router = express.Router();
const prisma = require('../db');

router.get('/', async (req, res) => {
  try {
    const members = await prisma.teamMember.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
