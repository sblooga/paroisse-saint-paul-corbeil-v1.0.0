const express = require('express');
const prisma = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public: liste FAQ (actives)
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.faqCategory.findMany({
      where: { active: true },
      orderBy: { sort_order: 'asc' },
      include: {
        items: {
          where: { active: true },
          orderBy: { sort_order: 'asc' }
        }
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: liste complète
router.get('/all', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const categories = await prisma.faqCategory.findMany({
      orderBy: { sort_order: 'asc' },
      include: {
        items: { orderBy: { sort_order: 'asc' } }
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD Categories
router.post('/categories', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const { name, sort_order = 0, active = true } = req.body;
  if (!name) return res.status(400).json({ message: 'name requis' });
  try {
    const cat = await prisma.faqCategory.create({ data: { name, sort_order, active } });
    res.status(201).json(cat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/categories/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const cat = await prisma.faqCategory.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(cat);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Catégorie introuvable' });
    res.status(500).json({ error: error.message });
  }
});

router.delete('/categories/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.faqCategory.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Catégorie introuvable' });
    res.status(500).json({ error: error.message });
  }
});

// CRUD Items
router.post('/items', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const { question_fr, categoryId, sort_order = 0, active = true, imageUrl = null } = req.body;
  if (!question_fr || !categoryId) return res.status(400).json({ message: 'question_fr et categoryId requis' });
  try {
    const item = await prisma.faqItem.create({
      data: {
        ...req.body,
        imageUrl,
        sort_order,
        active
      }
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/items/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const item = await prisma.faqItem.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        imageUrl: req.body.imageUrl ?? null
      }
    });
    res.json(item);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Entrée introuvable' });
    res.status(500).json({ error: error.message });
  }
});

router.delete('/items/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.faqItem.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Entrée introuvable' });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
