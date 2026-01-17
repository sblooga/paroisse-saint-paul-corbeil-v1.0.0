const { PrismaClient } = require('@prisma/client');

// Prisma 7 récupérera automatiquement la config depuis prisma.config.js
const prisma = new PrismaClient();

module.exports = prisma;
