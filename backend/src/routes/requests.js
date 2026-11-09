const express = require('express');
const rateLimit = require('express-rate-limit');
const prisma = require('../prismaClient');
const { auth, optionalAuth } = require('../middleware/auth');
const { HttpError, asyncHandler, parseId, pagination } = require('../utils/http');
const v = require('../utils/validation');
const { geocode, distanceKm } = require('../utils/geo');
const { notify, notifyAdmins } = require('../utils/notify');
const { notifyMatchingDonors, eligibility, ci } = require('../services/donors');

const router = express.Router();
const URGENCY = ['routine', 'high', 'critical'];

function serializeRequest(r, { includeContact = false, origin } = {}) {
  const out = {
    id: r.id,
    publicId: `REQ-${String(r.id).padStart(5, '0')}`,
    patientName: r.patientName,
    bloodType: r.bloodType,
    units: r.units,
    hospital: r.hospital,
    city: r.city,
    urgency: r.urgency,
    status: r.status,
    notes: r.notes,
    neededBy: r.neededBy,
    createdAt: r.createdAt,
    responseCount: r._count?.responses ?? undefined,
    contactName: r.contactName,
    contactPhone: includeContact ? r.contactPhone : v.maskPhone(r.contactPhone),
    contactEmail: includeContact ? r.contactEmail : v.maskEmail(r.contactEmail),
  };
  if (origin) out.distanceKm = distanceKm(origin.latitude, origin.longitude, r.latitude, r.longitude);
  return out;
}

// Validates a request body and stores it, then alerts matching donors and admins.
async function createRequest(body, createdById = null) {
  v.requireFields(body, ['patientName', 'bloodType', 'hospital', 'city', 'contactName', 'contactPhone']);
  const bloodType = v.normalizeBloodType(body.bloodType);
  if (!bloodType) throw new HttpError(400, 'Invalid blood group', { field: 'bloodType' });
  if (!v.isPhone(body.contactPhone)) throw new HttpError(400, 'Invalid contact phone', { field: 'contactPhone' });
  if (body.contactEmail && !v.isEmail(body.contactEmail)) throw new HttpError(400, 'Invalid contact email', { field: 'contactEmail' });
  const urgency = URGENCY.includes(String(body.urgency).toLowerCase()) ? String(body.urgency).toLowerCase() : 'routine';
  const units = Math.min(Math.max(Number.parseInt(body.units, 10) || 1, 1), 20);
  const neededBy = v.parseDate(body.neededBy);
  if (neededBy === undefined) throw new HttpError(400, 'Invalid "needed by" date', { field: 'neededBy' });

  const city = v.str(body.city, 100);
  const hospital = v.str(body.hospital, 150);
  const loc = (await geocode([hospital, city, 'India'])) || (await geocode([city, 'India']));

  const request = await prisma.bloodRequest.create({
    data: {
      patientName: v.str(body.patientName, 100),
      bloodType, units, hospital, city, urgency, neededBy,
      contactName: v.str(body.contactName, 100),
      contactPhone: v.str(body.contactPhone, 20),
      contactEmail: v.str(body.contactEmail, 254),
      notes: v.str(body.notes, 1000),
      latitude: loc?.latitude ?? null,
      longitude: loc?.longitude ?? null,
      createdById,
    },
  });

  const matched = await notifyMatchingDonors(request);
  await notifyAdmins({
    type: 'request',
    title: `New ${urgency} request: ${bloodType}`,
    message: `${units} unit(s) for ${request.patientName} at ${hospital}, ${city}. ${matched} matching donor(s) alerted.`,
    link: '/admin-dashboard',
  });
  return { request, matchedDonors: matched };
}

const createLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests created. Please try again later.' } });

router.post('/', createLimiter, optionalAuth, asyncHandler(async (req, res) => {
  const { request, matchedDonors } = await createRequest(req.body || {}, req.user?.userId ?? null);
  res.status(201).json({ ...serializeRequest(request, { includeContact: true }), matchedDonors });
}));

// Open requests (public). Filter by bloodType, city, urgency.
router.get('/', asyncHandler(async (req, res) => {
  const { limit, skip, page } = pagination(req.query);
  const where = { status: { in: ['pending', 'assigned'] } };
  const bt = v.normalizeBloodType(req.query.bloodType);
  if (bt) where.bloodType = bt;
  if (req.query.city) where.city = ci(String(req.query.city));
  if (URGENCY.includes(req.query.urgency)) where.urgency = req.query.urgency;
  const [rows, total] = await Promise.all([
    prisma.bloodRequest.findMany({ where, orderBy: [{ createdAt: 'desc' }], take: limit, skip, include: { _count: { select: { responses: true } } } }),
    prisma.bloodRequest.count({ where }),
  ]);
  res.json({ data: rows.map((r) => serializeRequest(r)), pagination: { page, limit, total } });
}));

// Requests the signed-in donor can help with, nearest/most urgent first.
router.get('/matches', auth, asyncHandler(async (req, res) => {
  const donor = await prisma.donor.findUnique({ where: { userId: req.user.userId } });
  if (!donor) return res.json({ data: [], reason: 'no-donor-profile' });
  const recipientTypes = v.CAN_DONATE_TO[donor.bloodType] || [];
  const rows = await prisma.bloodRequest.findMany({
    where: { status: { in: ['pending', 'assigned'] }, bloodType: { in: recipientTypes } },
    include: { responses: { where: { donorId: donor.id }, select: { id: true } }, _count: { select: { responses: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  const origin = donor.latitude != null ? { latitude: donor.latitude, longitude: donor.longitude } : null;
  const rank = { critical: 0, high: 1, routine: 2 };
  const data = rows
    .map((r) => ({ ...serializeRequest(r, { includeContact: r.responses.length > 0, origin }), responded: r.responses.length > 0, assignedToMe: r.assignedDonorId === donor.id }))
    .filter((r) => r.distanceKm == null ? r.city.toLowerCase() === donor.city.toLowerCase() : r.distanceKm <= 100)
    .sort((a, b) => rank[a.urgency] - rank[b.urgency] || (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9));
  res.json({ data: data.slice(0, 50), ...eligibility(donor) });
}));

router.get('/mine', auth, asyncHandler(async (req, res) => {
  const rows = await prisma.bloodRequest.findMany({
    where: { createdById: req.user.userId },
    orderBy: { createdAt: 'desc' },
    include: { responses: { include: { donor: true } }, _count: { select: { responses: true } } },
  });
  res.json({
    data: rows.map((r) => ({
      ...serializeRequest(r, { includeContact: true }),
      responders: r.responses.map((x) => ({ donorId: x.donorId, name: x.donor.name, bloodType: x.donor.bloodType, phone: x.donor.phone, email: x.donor.email, message: x.message, at: x.createdAt })),
    })),
  });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const r = await prisma.bloodRequest.findUnique({ where: { id: parseId(req.params.id) }, include: { _count: { select: { responses: true } } } });
  if (!r) throw new HttpError(404, 'Request not found');
  res.json(serializeRequest(r));
}));

// A donor offers to help. They get the requester's contact; the requester and admins are notified.
router.post('/:id/respond', auth, asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const donor = await prisma.donor.findUnique({ where: { userId: req.user.userId } });
  if (!donor) throw new HttpError(400, 'Only registered donors can respond. Complete your donor profile first.');
  const r = await prisma.bloodRequest.findUnique({ where: { id } });
  if (!r || !['pending', 'assigned'].includes(r.status)) throw new HttpError(404, 'This request is no longer open');
  if (!(v.COMPATIBLE_DONORS[r.bloodType] || []).includes(donor.bloodType)) {
    throw new HttpError(400, `Your blood type (${donor.bloodType}) is not compatible with ${r.bloodType}`);
  }
  if (!eligibility(donor).eligible) throw new HttpError(400, 'You are not yet eligible to donate again');

  await prisma.requestResponse.upsert({
    where: { requestId_donorId: { requestId: id, donorId: donor.id } },
    update: { message: v.str(req.body?.message, 300) },
    create: { requestId: id, donorId: donor.id, message: v.str(req.body?.message, 300) },
  });
  const msg = `${donor.name} (${donor.bloodType}, ${donor.phone}) offered to donate for ${r.patientName}.`;
  if (r.createdById) await notify(r.createdById, { type: 'response', title: 'A donor responded to your request', message: msg, link: '/dashboard', email: true });
  await notifyAdmins({ type: 'response', title: `Donor responded to REQ-${String(id).padStart(5, '0')}`, message: msg, link: '/admin-dashboard' });
  res.json({ ok: true, contact: { name: r.contactName, phone: r.contactPhone, email: r.contactEmail, hospital: r.hospital, city: r.city } });
}));

// The creator can cancel or mark their own request as fulfilled.
router.patch('/:id/status', auth, asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const r = await prisma.bloodRequest.findUnique({ where: { id } });
  if (!r) throw new HttpError(404, 'Request not found');
  if (r.createdById !== req.user.userId && req.user.role !== 'admin') throw new HttpError(403, 'Not allowed');
  const status = String(req.body?.status);
  if (!['cancelled', 'completed'].includes(status)) throw new HttpError(400, 'Status must be cancelled or completed');
  const updated = await prisma.bloodRequest.update({ where: { id }, data: { status } });
  res.json(serializeRequest(updated, { includeContact: true }));
}));

module.exports = router;
module.exports.createRequest = createRequest;
module.exports.serializeRequest = serializeRequest;
