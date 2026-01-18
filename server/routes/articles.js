const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

function validateArticleInput(body) {
  if (!body.title_fr || !body.slug) {
    return 'title_fr et slug sont obligatoires';
  }
  return null;
}

router.get('/', async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Liste complète (admin)
router.get('/all', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Creation
router.post('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const validationError = validateArticleInput(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }
  try {
    const article = await prisma.article.create({ data: req.body });
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mise a jour
router.put('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(article);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Article introuvable' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Suppression
router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.article.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Article introuvable' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
