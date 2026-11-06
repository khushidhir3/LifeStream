const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const config = require('../config');

function signToken(user) {
  return jwt.sign({ userId: user.id, role: user.role, v: user.tokenVersion }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

async function resolveUser(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return { error: 'No token provided' };
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    return { error: 'Session expired, please sign in again' };
  }
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.isActive) return { error: 'Account not found or disabled' };
  if ((payload.v ?? 0) !== user.tokenVersion) return { error: 'Session expired, please sign in again' };
  return { user };
}

// Requires a valid session. Sets req.user = { userId, role, record }.
async function auth(req, res, next) {
  try {
    const { user, error } = await resolveUser(req);
    if (error) return res.status(401).json({ error });
    req.user = { userId: user.id, role: user.role, record: user };
    next();
  } catch (err) {
    next(err);
  }
}

// Attaches the user when a valid token is present, but never rejects.
async function optionalAuth(req, res, next) {
  try {
    if (req.headers.authorization) {
      const { user } = await resolveUser(req);
      if (user) req.user = { userId: user.id, role: user.role, record: user };
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = auth;
module.exports.auth = auth;
module.exports.optionalAuth = optionalAuth;
module.exports.signToken = signToken;
