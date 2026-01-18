const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to require a valid Bearer token
function requireAuth(req, res, next) {
  if (!JWT_SECRET) {
    return res.status(500).json({ message: 'JWT non configuré côté serveur' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
}

// Middleware factory to enforce role-based access
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    if (req.user.role === 'ADMIN' || req.user.role === role) {
      return next();
    }
    return res.status(403).json({ message: 'Accès refusé' });
  };
}

module.exports = { requireAuth, requireRole };
