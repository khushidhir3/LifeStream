const prisma = require('../prismaClient');

exports.createDonor = async (req, res) => {
  try {
    const { name, bloodType, city, contact } = req.body;
    const userId = req.user?.userId || null;
    if (!name || !bloodType || !contact) return res.status(400).json({ error: 'name, bloodType and contact are required' });
    const donor = await prisma.donor.create({ data: { name, bloodType, city, contact, userId } });
    res.json(donor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getDonors = async (req, res) => {
  try {
    const { bloodType, city, name } = req.query;
    const where = {};
    if (bloodType) where.bloodType = bloodType;
    if (city) where.city = city;
    if (name) where.name = { contains: name, mode: 'insensitive' };
    const donors = await prisma.donor.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(donors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getDonor = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const donor = await prisma.donor.findUnique({ where: { id } });
    if (!donor) return res.status(404).json({ error: 'Not found' });
    res.json(donor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
