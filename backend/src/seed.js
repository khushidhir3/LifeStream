require('dotenv').config();
const prisma = require('./prismaClient');
const bcrypt = require('bcryptjs');

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@local';
  const adminPassword = process.env.SEED_ADMIN_PASS || 'admin123';

  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    admin = await prisma.user.create({ data: { email: adminEmail, password: hashed, role: 'admin' } });
    console.log('Created admin:', adminEmail);
  } else {
    console.log('Admin already exists:', adminEmail);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
