const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentification requise' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Session expirée ou invalide' });
  }
};
