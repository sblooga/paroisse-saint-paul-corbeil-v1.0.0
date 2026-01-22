const express = require('express');
const prisma = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Liste des abonnés (admin)
router.get('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const subs = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(subs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inscription (public)
router.post('/', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'email requis' });
  try {
    const sub = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { active: true },
      create: { email }
    });
    res.status(201).json(sub);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Désinscription (public ou admin)
router.post('/unsubscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'email requis' });
  try {
    const sub = await prisma.newsletterSubscriber.update({
      where: { email },
      data: { active: false }
    });
    res.json(sub);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Email non trouvé' });
    res.status(500).json({ error: error.message });
  }
});

// Suppression (admin)
router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.newsletterSubscriber.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Abonné introuvable' });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
