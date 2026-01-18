const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { neonConfig, Pool } = require('@neondatabase/serverless');

const connectionString = (process.env.DATABASE_URL || '').trim();

if (!connectionString) {
  throw new Error('DATABASE_URL manquant (variable vide ou non définie)');
}

// Logging non sensible pour diagnostiquer la connexion
console.log(`[db] DATABASE_URL length=${connectionString.length}, prefix=${connectionString.slice(0, 12)}`);
if (connectionString.includes(' ')) {
  console.warn('[db] Attention: DATABASE_URL contient des espaces');
}

// Active le cache de connexion HTTP pour limiter le nombre de connexions côté Neon
neonConfig.fetchConnectionCache = true;

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
