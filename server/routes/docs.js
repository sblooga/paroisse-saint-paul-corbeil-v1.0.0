const express = require('express');
const prisma = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const DOCS_KEY = 'docs_password';

// Admin: mise à jour du code (6 chiffres)
router.put('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const { code } = req.body;
  if (!code || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: 'Code invalide (6 chiffres requis)' });
  }
  try {
    await prisma.siteSettings.upsert({
      where: { key: DOCS_KEY },
      update: { value: code },
      create: { key: DOCS_KEY, value: code }
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public: vérification du code
router.post('/verify', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ valid: false, message: 'Code requis' });
  try {
    const setting = await prisma.siteSettings.findUnique({ where: { key: DOCS_KEY } });
    if (setting && setting.value === code) {
      return res.json({ valid: true });
    }
    return res.status(401).json({ valid: false });
  } catch (error) {
    res.status(500).json({ valid: false, error: error.message });
  }
});

module.exports = router;
