const express = require('express');
const rateLimit = require('express-rate-limit');
const prisma = require('../prismaClient');
const { asyncHandler, HttpError } = require('../utils/http');
const v = require('../utils/validation');
const { notifyAdmins } = require('../utils/notify');
const { searchBloodBanks } = require('../services/bloodBanks');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

// Live numbers for the home page.
router.get('/stats', asyncHandler(async (req, res) => {
  const [donors, verified, donations, units, fulfilled, open, cities] = await Promise.all([
    prisma.donor.count({ where: { status: { not: 'rejected' } } }),
    prisma.donor.count({ where: { status: 'verified' } }),
    prisma.donation.count(),
    prisma.donation.aggregate({ _sum: { units: true } }),
    prisma.bloodRequest.count({ where: { status: 'completed' } }),
    prisma.bloodRequest.count({ where: { status: { in: ['pending', 'assigned'] } } }),
    prisma.donor.findMany({ distinct: ['city'], select: { city: true } }),
  ]);
  const totalRequests = fulfilled + open;
  res.json({
    donors,
    verifiedDonors: verified,
    donations,
    // One whole-blood unit can help up to three patients (red cells, plasma, platelets).
    livesImpacted: (units._sum.units || 0) * 3,
    requestsFulfilled: fulfilled,
    openRequests: open,
    cities: cities.length,
    fulfilmentRate: totalRequests ? Math.round((fulfilled / totalRequests) * 100) : 0,
  });
}));

router.get('/compatibility', (req, res) => {
  const bt = v.normalizeBloodType(req.query.bloodType);
  if (req.query.bloodType && !bt) return res.status(400).json({ error: 'Invalid blood group' });
  if (bt) return res.json({ bloodType: bt, canReceiveFrom: v.COMPATIBLE_DONORS[bt], canDonateTo: v.CAN_DONATE_TO[bt] });
  res.json(Object.fromEntries(v.BLOOD_TYPES.map((t) => [t, { canReceiveFrom: v.COMPATIBLE_DONORS[t], canDonateTo: v.CAN_DONATE_TO[t] }])));
});

router.get('/inventory', asyncHandler(async (req, res) => {
  const rows = await prisma.inventory.findMany({ orderBy: { bloodType: 'asc' } });
  res.json({ data: rows });
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

const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, message: { error: 'Too many messages. Please try again later.' } });

router.post('/contact', contactLimiter, asyncHandler(async (req, res) => {
  const b = req.body || {};
  v.requireFields(b, ['name', 'email', 'message']);
  if (!v.isEmail(b.email)) throw new HttpError(400, 'Please enter a valid email address', { field: 'email' });
  if (b.phone && !v.isPhone(b.phone)) throw new HttpError(400, 'Please enter a valid phone number', { field: 'phone' });
  const msg = await prisma.contactMessage.create({
    data: {
      name: v.str(b.name, 100),
      email: String(b.email).trim().toLowerCase(),
      phone: v.str(b.phone, 20),
      subject: v.str(b.subject, 150),
      inquiryType: v.str(b.inquiryType, 60),
      message: v.str(b.message, 5000),
    },
  });
  await notifyAdmins({ type: 'info', title: 'New contact message', message: `${msg.name}: ${msg.subject || msg.inquiryType || msg.message.slice(0, 60)}`, link: '/admin-dashboard' });
  sendMail({ to: msg.email, subject: 'We received your message', text: `Hi ${msg.name},\n\nThanks for contacting LifeStream. Our team will get back to you shortly.\n\nYour message:\n${msg.message}` }).catch(() => {});
  res.status(201).json({ ok: true, id: msg.id });
}));

module.exports = router;
