const express = require('express');
const router = express.Router();
const prisma = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Route de connexion (Login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // On cherche l'utilisateur par son email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    // On vérifie le mot de passe
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    // On génère le jeton de connexion (JWT)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'saintpaulcorbeil',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Erreur Login:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

module.exports = router;
