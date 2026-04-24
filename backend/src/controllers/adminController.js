const prisma = require('../prismaClient');

exports.listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.user.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
