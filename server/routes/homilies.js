const express = require('express');
const prisma = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Liste toutes les homélies
router.get('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const homilies = await prisma.homily.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(homilies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crée une homélie
router.post('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const { slug, title, cloudinaryPublicId } = req.body;
  if (!slug || !title || !cloudinaryPublicId) {
    return res.status(400).json({ message: 'slug, title et cloudinaryPublicId sont requis' });
  }
  try {
    const homily = await prisma.homily.create({
      data: { slug, title, cloudinaryPublicId }
    });
    res.status(201).json(homily);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Met à jour une homélie
router.put('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const { slug, title, cloudinaryPublicId } = req.body;
  try {
    const homily = await prisma.homily.update({
      where: { id: req.params.id },
      data: { slug, title, cloudinaryPublicId }
    });
    res.json(homily);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Homélie introuvable' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Supprime une homélie
router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.homily.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Homélie introuvable' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
