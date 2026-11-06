const crypto = require('crypto');
const prisma = require('../prismaClient');

const hashKey = (key) => crypto.createHash('sha256').update(key).digest('hex');

function generateKey() {
  const raw = `ls_live_${crypto.randomBytes(24).toString('base64url')}`;
  return { raw, prefix: raw.slice(0, 12), keyHash: hashKey(raw) };
}

// Authenticates partner requests with an `x-api-key` header (or `?api_key=`)
// and enforces the key's daily request limit.
async function apiKeyAuth(req, res, next) {
  try {
    const raw = req.get('x-api-key') || req.query.api_key;
    if (!raw) return res.status(401).json({ error: 'Missing API key. Send it in the x-api-key header.' });
    const key = await prisma.apiKey.findUnique({ where: { keyHash: hashKey(String(raw)) } });
    if (!key || !key.active) return res.status(401).json({ error: 'Invalid or revoked API key' });

    const today = new Date().toISOString().slice(0, 10);
    const usedToday = key.usageDay === today ? key.usageToday : 0;
    if (usedToday >= key.dailyLimit) {
      return res.status(429).json({ error: `Daily limit of ${key.dailyLimit} requests reached` });
    }
    await prisma.apiKey.update({
      where: { id: key.id },
      data: { usageDay: today, usageToday: usedToday + 1, requestCount: { increment: 1 }, lastUsedAt: new Date() },
    });
    res.set('X-RateLimit-Limit', String(key.dailyLimit));
    res.set('X-RateLimit-Remaining', String(key.dailyLimit - usedToday - 1));
    req.apiKey = key;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { apiKeyAuth, generateKey, hashKey };
