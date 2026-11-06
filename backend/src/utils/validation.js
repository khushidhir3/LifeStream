const { HttpError } = require('./http');

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Recipient blood type -> donor blood types that can safely give to it.
const COMPATIBLE_DONORS = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': BLOOD_TYPES,
};

// Donor blood type -> recipient blood types it can give to.
const CAN_DONATE_TO = Object.fromEntries(
  BLOOD_TYPES.map((d) => [d, BLOOD_TYPES.filter((r) => COMPATIBLE_DONORS[r].includes(d))])
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9][0-9\s-]{8,16}$/;

function isEmail(v) {
  return typeof v === 'string' && v.length <= 254 && EMAIL_RE.test(v.trim());
}

function isPhone(v) {
  return typeof v === 'string' && PHONE_RE.test(v.trim());
}

// Returns a list of unmet rules; empty list means the password is strong enough.
function passwordProblems(pw) {
  const problems = [];
  if (typeof pw !== 'string' || pw.length < 8) problems.push('at least 8 characters');
  if (typeof pw === 'string' && pw.length > 128) problems.push('at most 128 characters');
  if (!/[a-z]/.test(pw || '')) problems.push('a lowercase letter');
  if (!/[A-Z]/.test(pw || '')) problems.push('an uppercase letter');
  if (!/[0-9]/.test(pw || '')) problems.push('a number');
  if (!/[^A-Za-z0-9]/.test(pw || '')) problems.push('a special character');
  return problems;
}

function assertPassword(pw) {
  const problems = passwordProblems(pw);
  if (problems.length) {
    throw new HttpError(400, `Password must contain ${problems.join(', ')}`, { field: 'password' });
  }
}

function normalizeBloodType(v) {
  if (typeof v !== 'string') return null;
  const t = v.trim().toUpperCase().replace(/\s/g, '').replace('POS', '+').replace('NEG', '-');
  return BLOOD_TYPES.includes(t) ? t : null;
}

function str(v, max = 500) {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

function requireFields(body, fields) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || String(body[f]).trim() === '');
  if (missing.length) {
    throw new HttpError(400, `Missing required field(s): ${missing.join(', ')}`, { fields: missing });
  }
}

function ageFrom(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

function parseDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

// India (NBTC) guidance: 90 days between whole-blood donations for men, 120 for women.
function donationGapDays(gender) {
  return String(gender || '').toLowerCase() === 'female' ? 120 : 90;
}

function nextEligibleDate(lastDonationDate, gender) {
  if (!lastDonationDate) return null;
  const d = new Date(lastDonationDate);
  d.setDate(d.getDate() + donationGapDays(gender));
  return d;
}

function maskPhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return '••••••';
  return `${phone.trim().slice(0, 4)}••••••${digits.slice(-2)}`;
}

function maskEmail(email) {
  if (!email) return null;
  const [user, domain] = email.split('@');
  return `${user.slice(0, 2)}•••@${domain}`;
}

module.exports = {
  BLOOD_TYPES,
  COMPATIBLE_DONORS,
  CAN_DONATE_TO,
  isEmail,
  isPhone,
  passwordProblems,
  assertPassword,
  normalizeBloodType,
  str,
  requireFields,
  ageFrom,
  parseDate,
  donationGapDays,
  nextEligibleDate,
  maskPhone,
  maskEmail,
};
