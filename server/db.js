const { PrismaClient } = require('@prisma/client');
// On s'assure que l'URL est bien passée au client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
module.exports = prisma;
