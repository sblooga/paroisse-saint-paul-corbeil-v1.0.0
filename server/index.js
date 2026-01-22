require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./db');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 10000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_ROLE = process.env.ADMIN_ROLE || 'ADMIN';
const ADMIN_FORCE_RESET = (process.env.ADMIN_FORCE_RESET || '').toLowerCase() === 'true';

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server and, if configured, limit browser origins
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true
  })
);
app.use(express.json());

// Import des routes
const articleRoutes = require('./routes/articles');
const teamRoutes = require('./routes/team');
const scheduleRoutes = require('./routes/schedules');
const authRoutes = require('./routes/auth');
const podcastRoutes = require('./routes/podcast');
const homilyRoutes = require('./routes/homilies');
const uploadRoutes = require('./routes/uploads');
const messageRoutes = require('./routes/messages');
const newsletterRoutes = require('./routes/newsletter');
const pageRoutes = require('./routes/pages');
const faqRoutes = require('./routes/faq');
const footerRoutes = require('./routes/footer');
const lifeStagesRoutes = require('./routes/lifeStages');

// Utilisation des routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/homilies', homilyRoutes);
app.use('/podcast', podcastRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/life-stages', lifeStagesRoutes);

// Route de test pour vérifier que le serveur répond
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Le Gardien est en ligne' });
});

// Création/mise à jour de l'admin au démarrage
async function ensureAdminExists() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn('ADMIN_EMAIL ou ADMIN_PASSWORD non défini. Aucun compte admin créé.');
    return;
  }

  try {
    // On cherche si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

    if (!existingUser) {
      console.log('[init] Création du compte administrateur...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

      await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          passwordHash,
          role: ADMIN_ROLE
        }
      });
      console.log('[ok] Compte administrateur créé avec succès.');
    } else if (ADMIN_FORCE_RESET) {
      console.log('[init] Mise à jour du mot de passe administrateur (ADMIN_FORCE_RESET=true)...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { passwordHash, role: ADMIN_ROLE }
      });
      console.log('[ok] Mot de passe administrateur mis à jour.');
    } else {
      console.log('[info] Le compte administrateur existe déjà.');
    }
  } catch (error) {
    console.error('[err] Erreur lors de la vérification de l\'admin:', error);
  }
}

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`[start] Le Gardien surveille le port ${PORT}`);
  await ensureAdminExists();
});
