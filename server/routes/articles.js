const express = require('express');
const router = express.Router();
const prisma = require('../db');
const auth = require('../middleware/auth');

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

module.exports = router;
