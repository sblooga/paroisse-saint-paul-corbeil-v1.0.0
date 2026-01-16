const express = require('express');
const cors = require('cors');
const prisma = require('./db');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Import des routes
const articleRoutes = require('./routes/articles');
const teamRoutes = require('./routes/team');
const scheduleRoutes = require('./routes/schedules');
const authRoutes = require('./routes/auth');

// Utilisation des routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/schedules', scheduleRoutes);

// Route de test pour vérifier que le serveur répond
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Le Gardien est en ligne' });
});

// Fonction de sécurité : Création de l'admin par défaut au démarrage
async function ensureAdminExists() {
  try {
    const email = 'admin@saintpaul.fr';
    // On cherche si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
      console.log('🚀 Création du compte administrateur par défaut...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('SaintPaul2026!', salt);

      await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'ADMIN'
        }
      });
      console.log('✅ Compte administrateur créé avec succès.');
    } else {
      console.log('ℹ️ Le compte administrateur existe déjà.');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de l\'admin:', error);
  }
}

// Démarrage du serveur
app.listen(PORT, async () => {
  console.log(`🚀 Le Gardien surveille le port ${PORT}`);
  // Exécution de la vérification de l'admin au lancement
  await ensureAdminExists();
});
