const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const prisma = require('../prismaClient');
const config = require('../config');
const { auth, signToken } = require('../middleware/auth');
const { HttpError, asyncHandler } = require('../utils/http');
const v = require('../utils/validation');
const { geocode } = require('../utils/geo');
const { sendMail, isConfigured: mailConfigured } = require('../utils/mailer');
const { notify, notifyAdmins } = require('../utils/notify');
const { serializeDonor } = require('../services/donors');

const router = express.Router();

function serializeUser(u) {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    firstName: u.firstName,
    lastName: u.lastName,
    name: `${u.firstName} ${u.lastName}`.trim() || u.email.split('@')[0],
    phone: u.phone,
    notifyEmail: u.notifyEmail,
    notifyRequests: u.notifyRequests,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  };
}

async function sessionPayload(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { donor: { include: { _count: { select: { donations: true } } } } },
  });
  const unread = await prisma.notification.count({ where: { userId, read: false } });
  return {
    user: serializeUser(user),
    donor: user.donor ? serializeDonor(user.donor, { includeContact: true, includePrivate: true }) : null,
    unreadNotifications: unread,
  };
}

// Builds and validates donor fields from a request body. `partial` allows updates.
async function donorDataFrom(body, { partial = false } = {}) {
  const data = {};
  const has = (k) => body[k] !== undefined;

  if (!partial || has('bloodType')) {
    const bt = v.normalizeBloodType(body.bloodType);
    if (!bt) throw new HttpError(400, 'Please select a valid blood group', { field: 'bloodType' });
    data.bloodType = bt;
  }
  if (!partial || has('city')) {
    const city = v.str(body.city, 100);
    if (!city) throw new HttpError(400, 'City is required', { field: 'city' });
    data.city = city;
  }
  if (has('dateOfBirth')) {
    const dob = v.parseDate(body.dateOfBirth);
    if (dob === undefined) throw new HttpError(400, 'Invalid date of birth', { field: 'dateOfBirth' });
    if (dob) {
      const age = v.ageFrom(dob);
      if (age < 18 || age > 65) throw new HttpError(400, 'Donors must be between 18 and 65 years old', { field: 'dateOfBirth' });
    }
    data.dateOfBirth = dob;
  }
  if (has('weight')) {
    if (body.weight === '' || body.weight === null) data.weight = null;
    else {
      const w = Number(body.weight);
      if (!Number.isFinite(w) || w < 30 || w > 300) throw new HttpError(400, 'Please enter a valid weight in kg', { field: 'weight' });
      if (w < 45) throw new HttpError(400, 'Donors must weigh at least 45 kg', { field: 'weight' });
      data.weight = w;
    }
  }
  if (has('lastDonationDate')) {
    const d = v.parseDate(body.lastDonationDate);
    if (d === undefined || (d && d > new Date())) throw new HttpError(400, 'Last donation date cannot be in the future', { field: 'lastDonationDate' });
    data.lastDonationDate = d;
  }
  if (has('gender')) {
    const g = v.str(body.gender, 20);
    if (g && !['Male', 'Female', 'Other'].includes(g)) throw new HttpError(400, 'Invalid gender', { field: 'gender' });
    data.gender = g;
  }
  if (has('emergencyPhone') && body.emergencyPhone && !v.isPhone(body.emergencyPhone)) {
    throw new HttpError(400, 'Invalid emergency contact phone', { field: 'emergencyPhone' });
  }
  if (has('medicalConditions')) {
    data.medicalConditions = Array.isArray(body.medicalConditions)
      ? body.medicalConditions.join(', ').slice(0, 500) || null
      : v.str(body.medicalConditions);
  }
  for (const k of ['address', 'state', 'zipCode', 'medications', 'allergies', 'emergencyName', 'emergencyRelation', 'emergencyPhone']) {
    if (has(k)) data[k] = v.str(body[k], k === 'address' ? 300 : 120);
  }
  if (has('isAvailable')) data.isAvailable = Boolean(body.isAvailable);

  if (data.city !== undefined || data.address !== undefined || data.state !== undefined) {
    const loc = await geocode([data.city ?? body.city, data.state ?? body.state, 'India']);
    if (loc) Object.assign(data, loc);
  }
  return data;
}

router.post('/register', asyncHandler(async (req, res) => {
  const b = req.body || {};
  v.requireFields(b, ['firstName', 'email', 'password']);
  const email = String(b.email).trim().toLowerCase();
  if (!v.isEmail(email)) throw new HttpError(400, 'Please enter a valid email address', { field: 'email' });
  v.assertPassword(b.password);
  if (b.confirmPassword !== undefined && b.confirmPassword !== b.password) {
    throw new HttpError(400, 'Passwords do not match', { field: 'confirmPassword' });
  }
  if (!b.termsAccepted || !b.privacyAccepted) {
    throw new HttpError(400, 'You must accept the Terms of Service and Privacy Policy', { field: 'termsAccepted' });
  }
  const asDonor = b.registerAsDonor !== false;
  if (asDonor) {
    v.requireFields(b, ['phone', 'bloodType', 'city']);
    if (!v.isPhone(b.phone)) throw new HttpError(400, 'Please enter a valid phone number', { field: 'phone' });
  }

  if (await prisma.user.findUnique({ where: { email } })) {
    throw new HttpError(409, 'An account with this email already exists', { field: 'email' });
  }
  const donorData = asDonor ? await donorDataFrom(b) : null;
  const firstName = v.str(b.firstName, 60);
  const lastName = v.str(b.lastName, 60) || '';

  const user = await prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(b.password, 12),
      firstName,
      lastName,
      phone: v.str(b.phone, 20),
      role: 'user', // never trust a role from the client
      lastLoginAt: new Date(),
      donor: donorData
        ? { create: { ...donorData, name: `${firstName} ${lastName}`.trim(), email, phone: v.str(b.phone, 20) } }
        : undefined,
    },
  });

  await notify(user.id, {
    type: 'account',
    title: 'Welcome to LifeStream',
    message: asDonor
      ? 'Your donor profile is live. An admin will verify it shortly. You will be notified when someone nearby needs your blood type.'
      : 'Your account has been created.',
    link: '/dashboard',
  });
  if (asDonor) {
    await notifyAdmins({ type: 'account', title: 'New donor registered', message: `${firstName} ${lastName} (${donorData.bloodType}, ${donorData.city}) is awaiting verification.`, link: '/admin-dashboard' });
  }
  sendMail({
    to: email,
    subject: 'Welcome to LifeStream',
    text: `Hi ${firstName},\n\nThank you for registering with LifeStream. You can sign in at ${config.appUrl}/login.\n\nEvery drop counts.`,
  }).catch(() => {});

  res.status(201).json({ token: signToken(user), ...(await sessionPayload(user.id)) });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { password, adminCode, portal } = req.body || {};
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email || !password) throw new HttpError(400, 'Email and password are required');

  const user = await prisma.user.findUnique({ where: { email } });
  // Same message for unknown email and wrong password, so accounts can't be probed.
  const ok = user && (await bcrypt.compare(String(password), user.password));
  if (!ok) throw new HttpError(401, 'Incorrect email or password');
  if (!user.isActive) throw new HttpError(403, 'This account has been disabled. Please contact support.');

  if (portal === 'admin') {
    if (user.role !== 'admin') throw new HttpError(403, 'This account does not have admin access');
    if (config.adminAccessCode) {
      const a = Buffer.from(String(adminCode || ''));
      const b = Buffer.from(config.adminAccessCode);
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new HttpError(401, 'Invalid security code');
    }
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  res.json({ token: signToken(user), ...(await sessionPayload(user.id)) });
}));

router.get('/me', auth, asyncHandler(async (req, res) => {
  res.json(await sessionPayload(req.user.userId));
}));

router.get('/admin-code-required', (req, res) => res.json({ required: Boolean(config.adminAccessCode) }));

router.post('/forgot-password', asyncHandler(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!v.isEmail(email)) throw new HttpError(400, 'Please enter a valid email address');
  const generic = { message: 'If an account exists for that email, a reset link has been sent.' };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return res.json(generic);

  const token = crypto.randomBytes(32).toString('hex');
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetTokenHash: crypto.createHash('sha256').update(token).digest('hex'),
      resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  const url = `${config.appUrl}/reset-password?token=${token}`;
  await sendMail({
    to: email,
    subject: 'Reset your LifeStream password',
    text: `Hi ${user.firstName || ''},\n\nWe received a request to reset your password. This link is valid for 1 hour:\n\n${url}\n\nIf you didn't ask for this, you can ignore this email.`,
  });
  // Without SMTP in development, hand the link back so the flow can still be tested.
  if (!config.isProd && !mailConfigured()) return res.json({ ...generic, devResetUrl: url });
  res.json(generic);
}));

router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, password, confirmPassword } = req.body || {};
  if (!token) throw new HttpError(400, 'Reset token is missing');
  v.assertPassword(password);
  if (confirmPassword !== undefined && confirmPassword !== password) throw new HttpError(400, 'Passwords do not match');

  const hash = crypto.createHash('sha256').update(String(token)).digest('hex');
  const user = await prisma.user.findFirst({ where: { resetTokenHash: hash, resetTokenExpires: { gt: new Date() } } });
  if (!user) throw new HttpError(400, 'This reset link is invalid or has expired. Please request a new one.');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await bcrypt.hash(password, 12),
      resetTokenHash: null,
      resetTokenExpires: null,
      tokenVersion: { increment: 1 }, // sign out all other sessions
    },
  });
  await notify(user.id, { type: 'account', title: 'Password changed', message: 'Your password was reset. If this was not you, contact support immediately.' });
  res.json({ message: 'Password updated. You can now sign in.' });
}));

module.exports = router;
module.exports.donorDataFrom = donorDataFrom;
module.exports.sessionPayload = sessionPayload;
module.exports.serializeUser = serializeUser;
