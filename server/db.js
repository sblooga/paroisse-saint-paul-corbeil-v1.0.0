const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { neonConfig, Pool } = require('@neondatabase/serverless');

const connectionString = (process.env.DATABASE_URL || '').trim();

if (!connectionString) {
  throw new Error('DATABASE_URL manquant (variable vide ou non définie)');
}

// Active le cache de connexion HTTP pour limiter le nombre de connexions côté Neon
neonConfig.fetchConnectionCache = true;

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
