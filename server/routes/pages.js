const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

function validatePageInput(body) {
  if (!body.slug || !body.title_fr) {
    return 'slug et title_fr sont obligatoires';
  }
  return null;
}

// Liste publique (pages publiées)
router.get('/', async (req, res) => {
  try {
    const pages = await prisma.page.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Détail public par slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: req.params.slug }
    });
    if (!page || !page.published) {
      return res.status(404).json({ message: 'Page non trouvée' });
    }
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Liste complète (admin)
router.get('/all', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Création
router.post('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const validationError = validatePageInput(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }
  try {
    const page = await prisma.page.create({ data: req.body });
    res.status(201).json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mise à jour
router.put('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const page = await prisma.page.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(page);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Page introuvable' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Suppression
router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.page.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Page introuvable' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
