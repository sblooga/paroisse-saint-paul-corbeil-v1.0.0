const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

function validateMemberInput(body) {
  if (!body.name || !body.role_fr || !body.category) {
    return 'name, role_fr et category sont obligatoires';
  }
  return null;
}

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

// Liste complete (admin)
router.get('/all', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const validationError = validateMemberInput(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }
  try {
    const member = await prisma.teamMember.create({ data: req.body });
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const member = await prisma.teamMember.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(member);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Membre introuvable' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.teamMember.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Membre introuvable' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
