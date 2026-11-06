// Partner API (sellable). Authenticate with header `x-api-key: ls_live_...`.
// Keys are created by an admin in the dashboard (API Keys tab).
const express = require('express');
const prisma = require('../prismaClient');
const { apiKeyAuth } = require('../middleware/apiKey');
const { asyncHandler, HttpError, parseId } = require('../utils/http');
const v = require('../utils/validation');
const { searchDonors, serializeDonor } = require('../services/donors');
const { createRequest, serializeRequest } = require('./requests');
const { searchBloodBanks } = require('../services/bloodBanks');

const router = express.Router();
router.use(apiKeyAuth);

router.get('/', (req, res) => res.json({ name: 'LifeStream Partner API', version: 'v1', key: req.apiKey.name }));

router.get('/donors', asyncHandler(async (req, res) => {
  res.json(await searchDonors(req.query, { includeContact: req.apiKey.canViewContacts }));
}));

router.get('/donors/:id', asyncHandler(async (req, res) => {
  const d = await prisma.donor.findUnique({ where: { id: parseId(req.params.id) }, include: { _count: { select: { donations: true } } } });
  if (!d || d.status === 'rejected') throw new HttpError(404, 'Donor not found');
  res.json(serializeDonor(d, { includeContact: req.apiKey.canViewContacts }));
}));

// Live count of available donors per blood type, optionally near a point.
router.get('/availability', asyncHandler(async (req, res) => {
  const out = {};
  for (const t of v.BLOOD_TYPES) {
    const r = await searchDonors({ ...req.query, bloodType: t, available: 'true', limit: 1 });
    out[t] = r.pagination.total;
  }
  res.json({ availableDonors: out });
}));

router.get('/requests', asyncHandler(async (req, res) => {
  const where = { status: { in: ['pending', 'assigned'] } };
  const bt = v.normalizeBloodType(req.query.bloodType);
  if (bt) where.bloodType = bt;
  const rows = await prisma.bloodRequest.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ data: rows.map((r) => serializeRequest(r)) });
}));

// Create a blood request; matching donors are alerted automatically.
router.post('/requests', asyncHandler(async (req, res) => {
  const { request, matchedDonors } = await createRequest(req.body || {});
  res.status(201).json({ ...serializeRequest(request, { includeContact: true }), matchedDonors });
}));

router.get('/requests/:id', asyncHandler(async (req, res) => {
  const r = await prisma.bloodRequest.findUnique({ where: { id: parseId(req.params.id) }, include: { _count: { select: { responses: true } } } });
  if (!r) throw new HttpError(404, 'Request not found');
  res.json(serializeRequest(r, { includeContact: true }));
}));

router.get('/inventory', asyncHandler(async (req, res) => {
  res.json({ data: await prisma.inventory.findMany({ orderBy: { bloodType: 'asc' } }) });
}));

router.get('/blood-banks', asyncHandler(async (req, res) => {
  const { state, city, lat, lng, radius, limit } = req.query;
  if (!state && !city && (lat == null || lng == null)) throw new HttpError(400, 'Provide city/state or lat & lng');
  const out = await searchBloodBanks({ state, city, latitude: lat, longitude: lng, radiusKm: Number(radius) || 25, limit });
  if (!out.count && out.errors) {
    return res.status(503).json({ error: 'The blood bank directory is temporarily unavailable. Please try again in a few minutes.', details: out.errors });
  }
  res.json(out);
}));

router.get('/compatibility', (req, res) => {
  const bt = v.normalizeBloodType(req.query.bloodType);
  if (!bt) return res.status(400).json({ error: 'bloodType query parameter is required (e.g. O+)' });
  res.json({ bloodType: bt, canReceiveFrom: v.COMPATIBLE_DONORS[bt], canDonateTo: v.CAN_DONATE_TO[bt] });
});

module.exports = router;
