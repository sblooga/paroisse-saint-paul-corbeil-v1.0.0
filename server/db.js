const { PrismaClient } = require('@prisma/client');

// Plus besoin de config externe, Prisma 6/7 lira DATABASE_URL
// directement depuis les variables d'environnement de Render.
const prisma = new PrismaClient();

module.exports = prisma;
