const express = require('express');
const prisma = require('../prismaClient');
const { auth } = require('../middleware/auth');
const { asyncHandler, parseId, pagination } = require('../utils/http');

const router = express.Router();
router.use(auth);

router.get('/', asyncHandler(async (req, res) => {
  const { limit, skip, page } = pagination(req.query, { defaultLimit: 20 });
  const where = { userId: req.user.userId, ...(req.query.unread === 'true' ? { read: false } : {}) };
  const [data, total, unread] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit, skip }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId: req.user.userId, read: false } }),
  ]);
  res.json({ data, unread, pagination: { page, limit, total } });
}));

router.get('/unread-count', asyncHandler(async (req, res) => {
  res.json({ unread: await prisma.notification.count({ where: { userId: req.user.userId, read: false } }) });
}));

router.patch('/read-all', asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: req.user.userId, read: false }, data: { read: true } });
  res.json({ ok: true });
}));

router.patch('/:id/read', asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({ where: { id: parseId(req.params.id), userId: req.user.userId }, data: { read: true } });
  res.json({ ok: true });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await prisma.notification.deleteMany({ where: { id: parseId(req.params.id), userId: req.user.userId } });
  res.json({ ok: true });
}));

router.delete('/', asyncHandler(async (req, res) => {
  await prisma.notification.deleteMany({ where: { userId: req.user.userId } });
  res.json({ ok: true });
}));

module.exports = router;
