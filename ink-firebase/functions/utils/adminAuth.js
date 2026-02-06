const jwt = require('jsonwebtoken');

const ADMIN_SECRET = process.env.ADMIN_PASSWORD || process.env.ADMIN_JWT_SECRET || 'ink-admin-secret-change-in-production';
const JWT_EXPIRY = '24h';

function signAdminToken() {
  return jwt.sign(
    { role: 'admin', iat: Math.floor(Date.now() / 1000) },
    ADMIN_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

function verifyAdminToken(token) {
  try {
    const decoded = jwt.verify(token, ADMIN_SECRET);
    return decoded && decoded.role === 'admin';
  } catch (e) {
    return false;
  }
}

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.slice(7);
  if (!verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  next();
}

module.exports = { signAdminToken, verifyAdminToken, requireAdmin };
