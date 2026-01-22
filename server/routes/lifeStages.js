const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

// Liste publique : étapes actives
router.get('/', async (_req, res) => {
  try {
    const stages = await prisma.lifeStage.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }]
    });
    res.json(stages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Liste complète admin
router.get('/all', requireAuth, requireRole('ADMIN'), async (_req, res) => {
  try {
    const stages = await prisma.lifeStage.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }]
    });
    res.json(stages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const {
    title_fr,
    title_pl,
    description_fr,
    description_pl,
    icon,
    imageUrl,
    sortOrder = 0,
    active = true
  } = req.body || {};

  if (!title_fr || !description_fr) {
    return res.status(400).json({ message: 'title_fr et description_fr sont requis' });
  }

  try {
    const created = await prisma.lifeStage.create({
      data: {
        title_fr,
        title_pl: title_pl || null,
        description_fr,
        description_pl: description_pl || null,
        icon: icon || null,
        imageUrl: imageUrl || null,
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
    const updated = await prisma.lifeStage.update({
      where: { id: req.params.id },
      data: {
        title_fr: req.body.title_fr,
        title_pl: req.body.title_pl ?? null,
        description_fr: req.body.description_fr,
        description_pl: req.body.description_pl ?? null,
        icon: req.body.icon ?? null,
        imageUrl: req.body.imageUrl ?? null,
        sortOrder: typeof req.body.sortOrder === 'number' ? req.body.sortOrder : undefined,
        active: typeof req.body.active === 'boolean' ? req.body.active : undefined
      }
    });
    res.json(updated);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Étape introuvable' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.lifeStage.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Étape introuvable' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
