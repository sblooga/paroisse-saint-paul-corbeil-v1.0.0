const { PrismaClient } = require('@prisma/client');

const connectionString = (process.env.DATABASE_URL || '').trim();

if (!connectionString) {
  throw new Error('DATABASE_URL manquant (variable vide ou non définie)');
}

// Logging non sensible pour diagnostiquer la connexion
console.log(`[db] DATABASE_URL length=${connectionString.length}, prefix=${connectionString.slice(0, 12)}`);
if (connectionString.includes(' ')) {
  console.warn('[db] Attention: DATABASE_URL contient des espaces');
}

// Utilisation du client Prisma standard (driver PostgreSQL natif)
const prisma = new PrismaClient();

module.exports = prisma;
