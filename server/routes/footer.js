const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// Liste publique : seulement les liens actifs
router.get('/', async (req, res) => {
  try {
    const links = await prisma.footerLink.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }]
    });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Liste complète pour l'admin
router.get('/all', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const links = await prisma.footerLink.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }]
    });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const {
    label,
    label_fr,
    label_pl,
    url,
    sortOrder = 0,
    active = true
  } = req.body || {};

  if (!label || !url) {
    return res.status(400).json({ message: 'label et url sont obligatoires' });
  }

  try {
    const created = await prisma.footerLink.create({
      data: {
        label,
        label_fr: label_fr || null,
        label_pl: label_pl || null,
        url,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
        active: Boolean(active)
      }
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const updated = await prisma.footerLink.update({
      where: { id: req.params.id },
      data: {
        label: req.body.label,
        label_fr: req.body.label_fr ?? null,
        label_pl: req.body.label_pl ?? null,
        url: req.body.url,
        sortOrder: typeof req.body.sortOrder === 'number' ? req.body.sortOrder : undefined,
        active: typeof req.body.active === 'boolean' ? req.body.active : undefined
      }
    });
    res.json(updated);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Lien introuvable' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.footerLink.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Lien introuvable' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
