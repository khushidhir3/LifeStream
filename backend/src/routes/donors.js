const express = require('express');
const prisma = require('../prismaClient');
const { auth } = require('../middleware/auth');
const { HttpError, asyncHandler, parseId } = require('../utils/http');
const { searchDonors, serializeDonor } = require('../services/donors');
const { notify } = require('../utils/notify');

const router = express.Router();

// Public search. Contact details are masked; use POST /:id/contact (signed in) to reveal them.
router.get('/', asyncHandler(async (req, res) => {
  res.json(await searchDonors(req.query));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const donor = await prisma.donor.findUnique({
    where: { id: parseId(req.params.id) },
    include: { _count: { select: { donations: true } } },
  });
  if (!donor || donor.status === 'rejected') throw new HttpError(404, 'Donor not found');
  res.json(serializeDonor(donor));
}));

// Reveals a donor's phone/email to a signed-in user and tells the donor who asked.
router.post('/:id/contact', auth, asyncHandler(async (req, res) => {
  const donor = await prisma.donor.findUnique({ where: { id: parseId(req.params.id) } });
  if (!donor || donor.status === 'rejected') throw new HttpError(404, 'Donor not found');
  const me = req.user.record;
  if (donor.userId && donor.userId !== me.id) {
    await notify(donor.userId, {
      type: 'info',
      title: 'Someone viewed your contact details',
      message: `${`${me.firstName} ${me.lastName}`.trim() || 'A LifeStream user'} (${me.email}) may contact you about a blood donation.${req.body?.reason ? ` Reason: ${String(req.body.reason).slice(0, 200)}` : ''}`,
    });
  }
  res.json({ id: donor.id, name: donor.name, phone: donor.phone, email: donor.email });
}));

module.exports = router;
