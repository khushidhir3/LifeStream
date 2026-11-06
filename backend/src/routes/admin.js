const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../prismaClient');
const { auth } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { HttpError, asyncHandler, parseId, pagination } = require('../utils/http');
const v = require('../utils/validation');
const { notify } = require('../utils/notify');
const { serializeDonor, ci, notifyMatchingDonors } = require('../services/donors');
const { serializeRequest, createRequest } = require('./requests');
const { donorDataFrom } = require('./auth');
const { generateKey } = require('../middleware/apiKey');

const router = express.Router();
router.use(auth, isAdmin);

const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

// ---------- Overview ----------

router.get('/stats', asyncHandler(async (req, res) => {
  const today = startOfDay();
  const [donors, verified, pending, users, openReq, critical, completedToday, donationsToday, messages, byType] = await Promise.all([
    prisma.donor.count(),
    prisma.donor.count({ where: { status: 'verified' } }),
    prisma.donor.count({ where: { status: 'pending' } }),
    prisma.user.count(),
    prisma.bloodRequest.count({ where: { status: { in: ['pending', 'assigned'] } } }),
    prisma.bloodRequest.count({ where: { status: { in: ['pending', 'assigned'] }, urgency: 'critical' } }),
    prisma.bloodRequest.count({ where: { status: 'completed', updatedAt: { gte: today } } }),
    prisma.donation.count({ where: { date: { gte: today } } }),
    prisma.contactMessage.count({ where: { status: 'new' } }),
    prisma.donor.groupBy({ by: ['bloodType'], _count: { _all: true } }),
  ]);

  // Last 7 days of activity: new donors, new requests and donations per day.
  const since = startOfDay(new Date(Date.now() - 6 * 864e5));
  const [d7, r7, dn7] = await Promise.all([
    prisma.donor.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.bloodRequest.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.donation.findMany({ where: { date: { gte: since } }, select: { date: true } }),
  ]);
  const week = Array.from({ length: 7 }, (_, i) => {
    const day = startOfDay(new Date(since.getTime() + i * 864e5));
    const next = new Date(day.getTime() + 864e5);
    const inDay = (t) => t >= day && t < next;
    return {
      date: `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`,
      label: day.toLocaleDateString('en-IN', { weekday: 'short' }),
      donors: d7.filter((x) => inDay(x.createdAt)).length,
      requests: r7.filter((x) => inDay(x.createdAt)).length,
      donations: dn7.filter((x) => inDay(x.date)).length,
    };
  });

  res.json({
    donors, verified, pending, users,
    openRequests: openReq, criticalRequests: critical, completedToday, donationsToday,
    newMessages: messages,
    donorsByBloodType: Object.fromEntries(byType.map((g) => [g.bloodType, g._count._all])),
    week,
  });
}));

// ---------- Donors ----------

router.get('/donors', asyncHandler(async (req, res) => {
  const { limit, skip, page } = pagination(req.query, { defaultLimit: 25 });
  const where = { AND: [] };
  if (['pending', 'verified', 'rejected'].includes(req.query.status)) where.AND.push({ status: req.query.status });
  const bt = v.normalizeBloodType(req.query.bloodType);
  if (bt) where.AND.push({ bloodType: bt });
  if (req.query.q) {
    const q = String(req.query.q).trim();
    where.AND.push({ OR: [{ name: ci(q) }, { city: ci(q) }, { email: ci(q) }, { phone: ci(q) }] });
  }
  const [rows, total] = await Promise.all([
    prisma.donor.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit, skip, include: { _count: { select: { donations: true } } } }),
    prisma.donor.count({ where }),
  ]);
  res.json({ data: rows.map((d) => serializeDonor(d, { includeContact: true, includePrivate: true })), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

// Add a donor directly (e.g. walk-in at a camp). No login account is created.
router.post('/donors', asyncHandler(async (req, res) => {
  const b = req.body || {};
  v.requireFields(b, ['name', 'phone', 'bloodType', 'city']);
  if (!v.isPhone(b.phone)) throw new HttpError(400, 'Invalid phone number', { field: 'phone' });
  if (b.email && !v.isEmail(b.email)) throw new HttpError(400, 'Invalid email', { field: 'email' });
  const data = await donorDataFrom(b);
  const donor = await prisma.donor.create({
    data: { ...data, name: v.str(b.name, 120), phone: v.str(b.phone, 20), email: v.str(b.email, 254), status: b.status === 'pending' ? 'pending' : 'verified' },
  });
  res.status(201).json(serializeDonor(donor, { includeContact: true, includePrivate: true }));
}));

router.patch('/donors/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const existing = await prisma.donor.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, 'Donor not found');
  const b = req.body || {};
  const data = await donorDataFrom(b, { partial: true });
  if (b.name !== undefined) data.name = v.str(b.name, 120) || existing.name;
  if (b.phone !== undefined) {
    if (!v.isPhone(b.phone)) throw new HttpError(400, 'Invalid phone number', { field: 'phone' });
    data.phone = v.str(b.phone, 20);
  }
  if (b.status !== undefined) {
    if (!['pending', 'verified', 'rejected'].includes(b.status)) throw new HttpError(400, 'Invalid status');
    data.status = b.status;
  }
  const donor = await prisma.donor.update({ where: { id }, data, include: { _count: { select: { donations: true } } } });
  if (b.status && b.status !== existing.status && donor.userId) {
    await notify(donor.userId, {
      type: 'account',
      title: b.status === 'verified' ? 'Your donor profile is verified' : `Donor profile ${b.status}`,
      message: b.status === 'verified' ? 'You now show as a verified donor in search results. Thank you!' : 'Please contact support if you think this is a mistake.',
      link: '/dashboard',
      email: true,
    });
  }
  res.json(serializeDonor(donor, { includeContact: true, includePrivate: true }));
}));

router.delete('/donors/:id', asyncHandler(async (req, res) => {
  await prisma.donor.delete({ where: { id: parseId(req.params.id) } });
  res.json({ ok: true });
}));

router.get('/donors/:id/donations', asyncHandler(async (req, res) => {
  res.json({ data: await prisma.donation.findMany({ where: { donorId: parseId(req.params.id) }, orderBy: { date: 'desc' } }) });
}));

router.post('/donors/:id/donations', asyncHandler(async (req, res) => {
  const donorId = parseId(req.params.id);
  const donor = await prisma.donor.findUnique({ where: { id: donorId } });
  if (!donor) throw new HttpError(404, 'Donor not found');
  const date = v.parseDate(req.body.date) || new Date();
  const donation = await prisma.donation.create({
    data: { donorId, date, units: Math.max(1, Number.parseInt(req.body.units, 10) || 1), location: v.str(req.body.location, 150), notes: v.str(req.body.notes, 500), verified: true },
  });
  if (!donor.lastDonationDate || date > donor.lastDonationDate) await prisma.donor.update({ where: { id: donorId }, data: { lastDonationDate: date } });
  if (donor.userId) await notify(donor.userId, { type: 'account', title: 'Donation recorded', message: `A donation on ${date.toDateString()} was added to your record. Thank you for saving lives!`, link: '/dashboard' });
  res.status(201).json(donation);
}));

// ---------- Requests ----------

router.get('/requests', asyncHandler(async (req, res) => {
  const { limit, skip, page } = pagination(req.query, { defaultLimit: 25 });
  const where = {};
  if (['pending', 'assigned', 'completed', 'cancelled'].includes(req.query.status)) where.status = req.query.status;
  if (['routine', 'high', 'critical'].includes(req.query.urgency)) where.urgency = req.query.urgency;
  if (req.query.q) {
    const q = String(req.query.q).trim();
    where.OR = [{ patientName: ci(q) }, { hospital: ci(q) }, { city: ci(q) }];
  }
  const [rows, total] = await Promise.all([
    prisma.bloodRequest.findMany({
      where, orderBy: { createdAt: 'desc' }, take: limit, skip,
      include: { assignedDonor: true, responses: { include: { donor: true } }, _count: { select: { responses: true } } },
    }),
    prisma.bloodRequest.count({ where }),
  ]);
  res.json({
    data: rows.map((r) => ({
      ...serializeRequest(r, { includeContact: true }),
      assignedDonor: r.assignedDonor ? { id: r.assignedDonor.id, name: r.assignedDonor.name, bloodType: r.assignedDonor.bloodType, phone: r.assignedDonor.phone } : null,
      responders: r.responses.map((x) => ({ donorId: x.donorId, name: x.donor.name, bloodType: x.donor.bloodType, phone: x.donor.phone, at: x.createdAt })),
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}));

router.post('/requests', asyncHandler(async (req, res) => {
  const { request, matchedDonors } = await createRequest(req.body || {}, req.user.userId);
  res.status(201).json({ ...serializeRequest(request, { includeContact: true }), matchedDonors });
}));

// Update status and/or assign a donor.
router.patch('/requests/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const r = await prisma.bloodRequest.findUnique({ where: { id } });
  if (!r) throw new HttpError(404, 'Request not found');
  const b = req.body || {};
  const data = {};
  if (b.status !== undefined) {
    if (!['pending', 'assigned', 'completed', 'cancelled'].includes(b.status)) throw new HttpError(400, 'Invalid status');
    data.status = b.status;
  }
  if (b.urgency !== undefined) {
    if (!['routine', 'high', 'critical'].includes(b.urgency)) throw new HttpError(400, 'Invalid urgency');
    data.urgency = b.urgency;
  }
  if (b.assignedDonorId !== undefined) {
    if (b.assignedDonorId === null) data.assignedDonorId = null;
    else {
      const donor = await prisma.donor.findUnique({ where: { id: parseId(b.assignedDonorId) } });
      if (!donor) throw new HttpError(404, 'Donor not found');
      if (!(v.COMPATIBLE_DONORS[r.bloodType] || []).includes(donor.bloodType)) throw new HttpError(400, `${donor.bloodType} cannot donate to ${r.bloodType}`);
      data.assignedDonorId = donor.id;
      if (!data.status) data.status = 'assigned';
      if (donor.userId) {
        await notify(donor.userId, {
          type: 'request', title: 'You have been assigned to a blood request',
          message: `Please contact ${r.contactName} (${r.contactPhone}) at ${r.hospital}, ${r.city} for ${r.patientName} (${r.bloodType}).`,
          link: '/dashboard', email: true,
        });
      }
    }
  }
  const updated = await prisma.bloodRequest.update({ where: { id }, data });
  if (data.status && data.status !== r.status && r.createdById) {
    await notify(r.createdById, { type: 'request', title: `Your request is now ${data.status}`, message: `Request for ${r.patientName} (${r.bloodType}) at ${r.hospital}.`, link: '/dashboard' });
  }
  res.json(serializeRequest(updated, { includeContact: true }));
}));

router.post('/requests/:id/rebroadcast', asyncHandler(async (req, res) => {
  const r = await prisma.bloodRequest.findUnique({ where: { id: parseId(req.params.id) } });
  if (!r) throw new HttpError(404, 'Request not found');
  res.json({ matchedDonors: await notifyMatchingDonors(r) });
}));

router.delete('/requests/:id', asyncHandler(async (req, res) => {
  await prisma.bloodRequest.delete({ where: { id: parseId(req.params.id) } });
  res.json({ ok: true });
}));

// ---------- Inventory ----------

router.get('/inventory', asyncHandler(async (req, res) => {
  const rows = await prisma.inventory.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.bloodType, r]));
  res.json({ data: v.BLOOD_TYPES.map((t) => map[t] || { bloodType: t, units: 0, updatedAt: null }) });
}));

router.put('/inventory', asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  for (const it of items) {
    const t = v.normalizeBloodType(it.bloodType);
    const units = Number.parseInt(it.units, 10);
    if (!t || !Number.isInteger(units) || units < 0 || units > 100000) throw new HttpError(400, `Invalid inventory row for ${it.bloodType}`);
    await prisma.inventory.upsert({ where: { bloodType: t }, update: { units }, create: { bloodType: t, units } });
  }
  const rows = await prisma.inventory.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.bloodType, r]));
  res.json({ data: v.BLOOD_TYPES.map((t) => map[t] || { bloodType: t, units: 0 }) });
}));

// ---------- Users ----------

router.get('/users', asyncHandler(async (req, res) => {
  const { limit, skip, page } = pagination(req.query, { defaultLimit: 25 });
  const where = req.query.q ? { OR: [{ email: ci(String(req.query.q)) }, { firstName: ci(String(req.query.q)) }, { lastName: ci(String(req.query.q)) }] } : {};
  const [rows, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit, skip, select: { id: true, email: true, role: true, firstName: true, lastName: true, phone: true, isActive: true, createdAt: true, lastLoginAt: true, donor: { select: { id: true, bloodType: true, status: true } } } }),
    prisma.user.count({ where }),
  ]);
  res.json({ data: rows, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

router.post('/users', asyncHandler(async (req, res) => {
  const b = req.body || {};
  v.requireFields(b, ['email', 'password', 'firstName']);
  const email = String(b.email).trim().toLowerCase();
  if (!v.isEmail(email)) throw new HttpError(400, 'Invalid email');
  v.assertPassword(b.password);
  if (await prisma.user.findUnique({ where: { email } })) throw new HttpError(409, 'Email already in use');
  const user = await prisma.user.create({
    data: { email, password: await bcrypt.hash(b.password, 12), firstName: v.str(b.firstName, 60), lastName: v.str(b.lastName, 60) || '', role: b.role === 'admin' ? 'admin' : 'user' },
    select: { id: true, email: true, role: true, firstName: true, lastName: true },
  });
  res.status(201).json(user);
}));

router.patch('/users/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const b = req.body || {};
  const data = {};
  if (b.role !== undefined) {
    if (!['user', 'admin'].includes(b.role)) throw new HttpError(400, 'Invalid role');
    if (id === req.user.userId && b.role !== 'admin') throw new HttpError(400, 'You cannot remove your own admin role');
    data.role = b.role;
  }
  if (b.isActive !== undefined) {
    if (id === req.user.userId) throw new HttpError(400, 'You cannot disable your own account');
    data.isActive = Boolean(b.isActive);
    if (!data.isActive) data.tokenVersion = { increment: 1 };
  }
  const user = await prisma.user.update({ where: { id }, data, select: { id: true, email: true, role: true, isActive: true } });
  res.json(user);
}));

router.delete('/users/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === req.user.userId) throw new HttpError(400, 'You cannot delete your own account here');
  await prisma.user.delete({ where: { id } });
  res.json({ ok: true });
}));

// ---------- Contact messages ----------

router.get('/messages', asyncHandler(async (req, res) => {
  const { limit, skip, page } = pagination(req.query, { defaultLimit: 25 });
  const where = ['new', 'read', 'resolved'].includes(req.query.status) ? { status: req.query.status } : {};
  const [data, total] = await Promise.all([
    prisma.contactMessage.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit, skip }),
    prisma.contactMessage.count({ where }),
  ]);
  res.json({ data, pagination: { page, limit, total } });
}));

router.patch('/messages/:id', asyncHandler(async (req, res) => {
  if (!['new', 'read', 'resolved'].includes(req.body?.status)) throw new HttpError(400, 'Invalid status');
  res.json(await prisma.contactMessage.update({ where: { id: parseId(req.params.id) }, data: { status: req.body.status } }));
}));

router.delete('/messages/:id', asyncHandler(async (req, res) => {
  await prisma.contactMessage.delete({ where: { id: parseId(req.params.id) } });
  res.json({ ok: true });
}));

// ---------- Partner API keys ----------

const keyView = (k) => ({ id: k.id, name: k.name, prefix: k.prefix, active: k.active, canViewContacts: k.canViewContacts, dailyLimit: k.dailyLimit, requestCount: k.requestCount, usageToday: k.usageDay === new Date().toISOString().slice(0, 10) ? k.usageToday : 0, lastUsedAt: k.lastUsedAt, createdAt: k.createdAt });

router.get('/api-keys', asyncHandler(async (req, res) => {
  res.json({ data: (await prisma.apiKey.findMany({ orderBy: { createdAt: 'desc' } })).map(keyView) });
}));

router.post('/api-keys', asyncHandler(async (req, res) => {
  const name = v.str(req.body?.name, 100);
  if (!name) throw new HttpError(400, 'Give the key a name (e.g. the partner hospital)');
  const { raw, prefix, keyHash } = generateKey();
  const key = await prisma.apiKey.create({
    data: { name, prefix, keyHash, ownerId: req.user.userId, dailyLimit: Math.max(1, Number.parseInt(req.body?.dailyLimit, 10) || 1000), canViewContacts: Boolean(req.body?.canViewContacts) },
  });
  // The full key is only ever shown once.
  res.status(201).json({ ...keyView(key), key: raw });
}));

router.patch('/api-keys/:id', asyncHandler(async (req, res) => {
  const data = {};
  if (req.body?.active !== undefined) data.active = Boolean(req.body.active);
  if (req.body?.canViewContacts !== undefined) data.canViewContacts = Boolean(req.body.canViewContacts);
  if (req.body?.dailyLimit !== undefined) data.dailyLimit = Math.max(1, Number.parseInt(req.body.dailyLimit, 10) || 1000);
  res.json(keyView(await prisma.apiKey.update({ where: { id: parseId(req.params.id) }, data })));
}));

router.delete('/api-keys/:id', asyncHandler(async (req, res) => {
  await prisma.apiKey.delete({ where: { id: parseId(req.params.id) } });
  res.json({ ok: true });
}));

module.exports = router;
