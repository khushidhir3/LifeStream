// Seeds the first admin account and empty inventory rows.
// Set SEED_DEMO=true to also add sample donors/requests (for demos only, never on a live site).
const config = require('./config');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const prisma = require('./prismaClient');
const { BLOOD_TYPES } = require('./utils/validation');

async function seedAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@lifestream.local').toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin already exists:', email);
    return;
  }
  let password = process.env.SEED_ADMIN_PASS;
  if (!password) {
    if (config.isProd) {
      password = `${crypto.randomBytes(9).toString('base64url')}A1!`;
      console.log('SEED_ADMIN_PASS not set. Generated admin password (change it after first login):', password);
    } else {
      password = 'Admin@12345';
    }
  }
  await prisma.user.create({
    data: { email, password: await bcrypt.hash(password, 12), role: 'admin', firstName: 'LifeStream', lastName: 'Admin' },
  });
  console.log('Created admin:', email);
}

async function seedInventory() {
  for (const bloodType of BLOOD_TYPES) {
    await prisma.inventory.upsert({ where: { bloodType }, update: {}, create: { bloodType, units: 0 } });
  }
}

const DEMO = [
  ['Rajesh', 'Kumar', 'O+', 'Male', 'Chandigarh', 'Chandigarh', 30.7415, 76.7681, 95],
  ['Priya', 'Singh', 'A+', 'Female', 'Mohali', 'Punjab', 30.7046, 76.7179, 130],
  ['Amit', 'Sharma', 'B+', 'Male', 'Chandigarh', 'Chandigarh', 30.7333, 76.7794, 40],
  ['Neha', 'Patel', 'O-', 'Female', 'Panchkula', 'Haryana', 30.6942, 76.8606, 200],
  ['Vikram', 'Reddy', 'AB+', 'Male', 'Mohali', 'Punjab', 30.6800, 76.7221, 100],
  ['Sonia', 'Verma', 'O-', 'Female', 'Chandigarh', 'Chandigarh', 30.7200, 76.8100, null],
  ['Arjun', 'Mehta', 'A-', 'Male', 'Delhi', 'Delhi', 28.6139, 77.2090, 120],
  ['Kavya', 'Iyer', 'B-', 'Female', 'Delhi', 'Delhi', 28.5355, 77.3910, 150],
];

async function seedDemo() {
  if (await prisma.donor.count()) {
    console.log('Donors already present, skipping demo data');
    return;
  }
  const password = await bcrypt.hash('Donor@12345', 12);
  for (const [i, [firstName, lastName, bloodType, gender, city, state, latitude, longitude, daysAgo]] of DEMO.entries()) {
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const lastDonationDate = daysAgo ? new Date(Date.now() - daysAgo * 864e5) : null;
    const user = await prisma.user.create({
      data: {
        email, password, firstName, lastName, phone: `+91 90000 000${String(i).padStart(2, '0')}`,
        donor: {
          create: {
            name: `${firstName} ${lastName}`, email, phone: `+91 90000 000${String(i).padStart(2, '0')}`,
            bloodType, gender, city, state, latitude, longitude, lastDonationDate,
            dateOfBirth: new Date(1990 + i, i, 10), weight: 60 + i * 2,
            status: i % 3 === 2 ? 'pending' : 'verified',
          },
        },
      },
      include: { donor: true },
    });
    if (lastDonationDate) {
      for (let k = 0; k <= i % 3; k += 1) {
        await prisma.donation.create({
          data: { donorId: user.donor.id, date: new Date(lastDonationDate.getTime() - k * 150 * 864e5), location: 'PGIMER Blood Bank', verified: true },
        });
      }
    }
  }
  await prisma.bloodRequest.createMany({
    data: [
      { patientName: 'Suresh Rao', bloodType: 'O-', units: 2, hospital: 'PGIMER', city: 'Chandigarh', latitude: 30.7649, longitude: 76.7759, urgency: 'critical', contactName: 'Ramesh Rao', contactPhone: '+91 90000 11111' },
      { patientName: 'Anjali Gupta', bloodType: 'AB+', units: 1, hospital: 'Fortis Hospital', city: 'Mohali', latitude: 30.6942, longitude: 76.7344, urgency: 'routine', contactName: 'Anil Gupta', contactPhone: '+91 90000 22222' },
      { patientName: 'Rahul Verma', bloodType: 'A+', units: 3, hospital: 'GMCH Sector 32', city: 'Chandigarh', latitude: 30.7046, longitude: 76.7752, urgency: 'high', contactName: 'Meena Verma', contactPhone: '+91 90000 33333' },
    ],
  });
  const units = { 'A+': 45, 'A-': 8, 'B+': 60, 'B-': 4, 'AB+': 25, 'AB-': 2, 'O+': 90, 'O-': 6 };
  for (const [bloodType, u] of Object.entries(units)) {
    await prisma.inventory.update({ where: { bloodType }, data: { units: u } });
  }
  console.log('Demo data added (donor logins use password Donor@12345)');
}

async function main() {
  await seedAdmin();
  await seedInventory();
  if (process.env.SEED_DEMO === 'true') await seedDemo();
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
