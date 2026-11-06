const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../prismaClient');
const { auth, signToken } = require('../middleware/auth');
const { HttpError, asyncHandler, parseId } = require('../utils/http');
const v = require('../utils/validation');
const { donorDataFrom, sessionPayload } = require('./auth');
const { notify, notifyAdmins } = require('../utils/notify');
const { eligibility } = require('../services/donors');

const router = express.Router();
router.use(auth);

router.get('/', asyncHandler(async (req, res) => res.json(await sessionPayload(req.user.userId))));

// Update name/phone and (if present) donor profile fields in one call.
router.patch('/', asyncHandler(async (req, res) => {
  const b = req.body || {};
  const userId = req.user.userId;
  const userData = {};
  if (b.firstName !== undefined) {
    const f = v.str(b.firstName, 60);
    if (!f) throw new HttpError(400, 'First name is required', { field: 'firstName' });
    userData.firstName = f;
  }
  if (b.lastName !== undefined) userData.lastName = v.str(b.lastName, 60) || '';
  if (b.phone !== undefined) {
    if (b.phone && !v.isPhone(b.phone)) throw new HttpError(400, 'Please enter a valid phone number', { field: 'phone' });
    userData.phone = v.str(b.phone, 20);
  }
  if (b.email !== undefined) {
    const email = String(b.email).trim().toLowerCase();
    if (!v.isEmail(email)) throw new HttpError(400, 'Please enter a valid email address', { field: 'email' });
    const taken = await prisma.user.findFirst({ where: { email, id: { not: userId } } });
    if (taken) throw new HttpError(409, 'That email is already in use', { field: 'email' });
    userData.email = email;
  }

  const user = await prisma.user.update({ where: { id: userId }, data: userData, include: { donor: true } });

  if (user.donor) {
    const donorData = await donorDataFrom(b, { partial: true });
    donorData.name = `${user.firstName} ${user.lastName}`.trim();
    donorData.email = user.email;
    if (user.phone) donorData.phone = user.phone;
    await prisma.donor.update({ where: { id: user.donor.id }, data: donorData });
  }
  res.json(await sessionPayload(userId));
}));

// Turn an existing account into a donor profile.
router.post('/donor', asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { donor: true } });
  if (user.donor) throw new HttpError(409, 'You already have a donor profile');
  const phone = req.body.phone || user.phone;
  if (!v.isPhone(phone || '')) throw new HttpError(400, 'Please enter a valid phone number', { field: 'phone' });
  const data = await donorDataFrom(req.body);
  await prisma.donor.create({
    data: { ...data, userId, name: `${user.firstName} ${user.lastName}`.trim(), email: user.email, phone },
  });
  await notifyAdmins({ type: 'account', title: 'New donor registered', message: `${user.firstName} ${user.lastName} is awaiting verification.`, link: '/admin-dashboard' });
  res.status(201).json(await sessionPayload(userId));
}));

router.patch('/settings', asyncHandler(async (req, res) => {
  const b = req.body || {};
  const data = {};
  if (b.notifyEmail !== undefined) data.notifyEmail = Boolean(b.notifyEmail);
  if (b.notifyRequests !== undefined) data.notifyRequests = Boolean(b.notifyRequests);
  const user = await prisma.user.update({ where: { id: req.user.userId }, data, include: { donor: true } });
  if (b.isAvailable !== undefined && user.donor) {
    await prisma.donor.update({ where: { id: user.donor.id }, data: { isAvailable: Boolean(b.isAvailable) } });
  }
  res.json(await sessionPayload(req.user.userId));
}));

router.post('/change-password', asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body || {};
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!(await bcrypt.compare(String(currentPassword || ''), user.password))) {
    throw new HttpError(400, 'Current password is incorrect', { field: 'currentPassword' });
  }
  v.assertPassword(newPassword);
  if (confirmPassword !== undefined && confirmPassword !== newPassword) throw new HttpError(400, 'Passwords do not match', { field: 'confirmPassword' });
  if (await bcrypt.compare(newPassword, user.password)) throw new HttpError(400, 'New password must be different from the current one');

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(newPassword, 12), tokenVersion: { increment: 1 } },
  });
  await notify(user.id, { type: 'account', title: 'Password changed', message: 'Your password was changed. Other devices have been signed out.' });
  // Issue a fresh token so this device stays signed in.
  res.json({ message: 'Password updated', token: signToken(updated) });
}));

router.delete('/', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!(await bcrypt.compare(String(req.body?.password || ''), user.password))) {
    throw new HttpError(400, 'Password is incorrect', { field: 'password' });
  }
  if (user.role === 'admin' && (await prisma.user.count({ where: { role: 'admin' } })) <= 1) {
    throw new HttpError(400, 'You are the only admin. Promote another admin first.');
  }
  await prisma.user.delete({ where: { id: user.id } });
  res.json({ message: 'Account deleted' });
}));

// ---- Donation history ----

router.get('/donations', asyncHandler(async (req, res) => {
  const donor = await prisma.donor.findUnique({ where: { userId: req.user.userId } });
  if (!donor) return res.json({ data: [] });
  const data = await prisma.donation.findMany({ where: { donorId: donor.id }, orderBy: { date: 'desc' } });
  res.json({ data, ...eligibility(donor) });
}));

router.post('/donations', asyncHandler(async (req, res) => {
  const donor = await prisma.donor.findUnique({ where: { userId: req.user.userId } });
  if (!donor) throw new HttpError(400, 'Create a donor profile first');
  const date = v.parseDate(req.body.date) || new Date();
  if (date === undefined || date > new Date()) throw new HttpError(400, 'Donation date cannot be in the future', { field: 'date' });
  const units = Math.min(Math.max(Number.parseInt(req.body.units, 10) || 1, 1), 4);

  const donation = await prisma.donation.create({
    data: { donorId: donor.id, date, units, location: v.str(req.body.location, 150), notes: v.str(req.body.notes, 500) },
  });
  if (!donor.lastDonationDate || date > donor.lastDonationDate) {
    await prisma.donor.update({ where: { id: donor.id }, data: { lastDonationDate: date } });
  }
  res.status(201).json(donation);
}));

router.delete('/donations/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const donor = await prisma.donor.findUnique({ where: { userId: req.user.userId } });
  const donation = donor && (await prisma.donation.findFirst({ where: { id, donorId: donor.id } }));
  if (!donation) throw new HttpError(404, 'Donation not found');
  if (donation.verified) throw new HttpError(400, 'Verified donations can only be removed by an admin');
  await prisma.donation.delete({ where: { id } });
  const latest = await prisma.donation.findFirst({ where: { donorId: donor.id }, orderBy: { date: 'desc' } });
  await prisma.donor.update({ where: { id: donor.id }, data: { lastDonationDate: latest?.date || null } });
  res.json({ ok: true });
}));

module.exports = router;
