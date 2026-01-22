const express = require('express');
const prisma = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Liste des messages de contact (admin)
router.get('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Création d'un message (public)
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'name, email, message requis' });
  }
  try {
    const created = await prisma.contactMessage.create({
      data: { name, email, subject: subject || null, message }
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Marquer comme lu (admin)
router.put('/:id/read', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const updated = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { read: true }
    });
    res.json(updated);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Message introuvable' });
    res.status(500).json({ error: error.message });
  }
});

// Suppression (admin)
router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Message introuvable' });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
