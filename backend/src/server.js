const config = require('./config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const prisma = require('./prismaClient');
const { HttpError } = require('./utils/http');

const app = express();
app.set('trust proxy', 1); // behind Render / other proxies, so rate limits see the real IP
app.use(helmet());
const devOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
app.use(cors({
  origin: config.clientUrls.includes('*')
    ? '*'
    : (origin, cb) => cb(null, !origin || config.clientUrls.includes(origin) || (!config.isProd && devOrigin.test(origin))),
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));
app.use(express.json({ limit: '200kb' }));

// General limit on everything, plus a much stricter one on sign-in style endpoints.
app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait a few minutes and try again.' },
});
app.use(['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password'], authLimiter);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/me', require('./routes/me'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/donors', require('./routes/donors'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/v1', require('./routes/v1'));
app.use('/api', require('./routes/public'));

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: 'up' });
  } catch {
    res.status(503).json({ ok: false, db: 'down' });
  }
});

app.use('/api', (req, res) => res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message, ...err.details });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
  if (err.code === 'P2002') return res.status(409).json({ error: 'Already exists' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

if (require.main === module) {
  app.listen(config.port, () => console.log(`LifeStream API running on port ${config.port}`));
}

module.exports = app;
