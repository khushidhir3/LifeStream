require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

function withProtocol(url) {
  if (!url) return url;
  if (url === '*') return url;
  return /^https?:\/\//.test(url) ? url.replace(/\/$/, '') : `https://${url.replace(/\/$/, '')}`;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && isProd) {
  throw new Error('JWT_SECRET must be set in production');
}

const clientUrls = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((u) => withProtocol(u.trim()))
  .filter(Boolean);

module.exports = {
  isProd,
  port: Number(process.env.PORT) || 4000,
  jwtSecret: JWT_SECRET || 'dev_only_insecure_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrls,
  // Used to build links in emails (password reset etc.)
  appUrl: withProtocol(process.env.APP_URL) || (clientUrls[0] !== '*' ? clientUrls[0] : 'http://localhost:5173'),
  isPostgres: (process.env.DATABASE_URL || '').startsWith('postgres'),
  adminAccessCode: process.env.ADMIN_ACCESS_CODE || '',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || 'LifeStream <no-reply@lifestream.local>',
  },
  dataGovIn: {
    apiKey: process.env.DATA_GOV_IN_API_KEY || '',
    bloodBankResourceId: process.env.DATA_GOV_IN_BLOOD_BANK_RESOURCE_ID || '',
  },
  geocodingEnabled: process.env.GEOCODING_ENABLED !== 'false',
};
