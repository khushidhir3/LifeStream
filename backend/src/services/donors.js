const prisma = require('../prismaClient');
const config = require('../config');
const { distanceKm, geocode } = require('../utils/geo');
const {
  COMPATIBLE_DONORS, normalizeBloodType, nextEligibleDate, maskPhone, maskEmail,
} = require('../utils/validation');
const { notify } = require('../utils/notify');

const ci = (value) => (config.isPostgres ? { contains: value, mode: 'insensitive' } : { contains: value });

function eligibility(donor) {
  const next = nextEligibleDate(donor.lastDonationDate, donor.gender);
  const eligible = !next || next <= new Date();
  return { eligible, nextEligibleDate: next };
}

function publicId(id) {
  return `LS-${String(id).padStart(6, '0')}`;
}

// Public view of a donor. Contact details are masked unless includeContact is true.
function serializeDonor(d, { includeContact = false, includePrivate = false, origin } = {}) {
  const { eligible, nextEligibleDate: next } = eligibility(d);
  const donationCount = d._count?.donations ?? d.donations?.length ?? 0;
  const out = {
    id: d.id,
    publicId: publicId(d.id),
    name: d.name,
    bloodType: d.bloodType,
    city: d.city,
    state: d.state,
    gender: d.gender,
    isAvailable: d.isAvailable,
    eligibleNow: eligible,
    nextEligibleDate: next,
    available: d.isAvailable && eligible,
    verified: d.status === 'verified',
    status: d.status,
    lastDonationDate: d.lastDonationDate,
    donationCount,
    memberSince: d.createdAt,
    phone: includeContact ? d.phone : maskPhone(d.phone),
    email: includeContact ? d.email : maskEmail(d.email),
  };
  if (origin && origin.latitude != null) {
    out.distanceKm = distanceKm(origin.latitude, origin.longitude, d.latitude, d.longitude);
  }
  if (includePrivate) {
    Object.assign(out, {
      userId: d.userId,
      address: d.address,
      zipCode: d.zipCode,
      dateOfBirth: d.dateOfBirth,
      weight: d.weight,
      latitude: d.latitude,
      longitude: d.longitude,
      medicalConditions: d.medicalConditions,
      medications: d.medications,
      allergies: d.allergies,
      emergencyName: d.emergencyName,
      emergencyRelation: d.emergencyRelation,
      emergencyPhone: d.emergencyPhone,
      updatedAt: d.updatedAt,
    });
  }
  return out;
}

/**
 * Donor search shared by the website and the partner API.
 * query: bloodType, compatibleWith, city, state, q, available, verified,
 *        lat, lng, radius (km), sort ("distance" | "recent" | "donations"), page, limit
 */
async function searchDonors(query, { includeContact = false, includeUnverified = true } = {}) {
  const where = { AND: [] };
  const bloodType = normalizeBloodType(query.bloodType);
  const compatibleWith = normalizeBloodType(query.compatibleWith);
  if (compatibleWith) where.AND.push({ bloodType: { in: COMPATIBLE_DONORS[compatibleWith] } });
  else if (bloodType) where.AND.push({ bloodType });
  if (query.city) where.AND.push({ city: ci(String(query.city).trim()) });
  if (query.state) where.AND.push({ state: ci(String(query.state).trim()) });
  if (query.q) {
    const q = String(query.q).trim();
    where.AND.push({ OR: [{ name: ci(q) }, { city: ci(q) }, { state: ci(q) }, { address: ci(q) }] });
  }
  if (query.verified === 'true' || !includeUnverified) where.AND.push({ status: 'verified' });
  else where.AND.push({ status: { not: 'rejected' } });
  where.AND.push({ OR: [{ userId: null }, { user: { isActive: true } }] });

  const rows = await prisma.donor.findMany({
    where,
    include: { _count: { select: { donations: true } } },
    orderBy: { createdAt: 'desc' },
    take: 2000,
  });

  let origin = null;
  if (query.lat != null && query.lng != null && query.lat !== '' && query.lng !== '') {
    origin = { latitude: Number(query.lat), longitude: Number(query.lng) };
    if (!Number.isFinite(origin.latitude) || !Number.isFinite(origin.longitude)) origin = null;
  } else if (query.near) {
    origin = await geocode([String(query.near)]);
  }

  let list = rows.map((d) => serializeDonor(d, { includeContact, origin }));
  if (query.available === 'true') list = list.filter((d) => d.available);
  if (query.available === 'false') list = list.filter((d) => !d.available);

  const radius = Number(query.radius);
  if (origin && Number.isFinite(radius) && radius > 0) {
    list = list.filter((d) => d.distanceKm != null && d.distanceKm <= radius);
  }

  const sort = query.sort || (origin ? 'distance' : 'recent');
  if (sort === 'distance') list.sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9));
  if (sort === 'donations') list.sort((a, b) => b.donationCount - a.donationCount);
  // Available donors first, keeping the chosen order otherwise.
  list.sort((a, b) => Number(b.available) - Number(a.available));

  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 24));
  const total = list.length;
  return {
    data: list.slice((page - 1) * limit, page * limit),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    origin,
  };
}

// Finds donors who could fulfil a request and notifies them in-app (and by email if critical).
async function notifyMatchingDonors(request) {
  const types = COMPATIBLE_DONORS[request.bloodType] || [request.bloodType];
  const donors = await prisma.donor.findMany({
    where: {
      bloodType: { in: types },
      isAvailable: true,
      status: { not: 'rejected' },
      userId: { not: null },
      user: { isActive: true, notifyRequests: true },
    },
  });
  const matches = donors.filter((d) => {
    if (!eligibility(d).eligible) return false;
    const km = distanceKm(request.latitude, request.longitude, d.latitude, d.longitude);
    if (km != null) return km <= 50;
    return d.city && request.city && d.city.trim().toLowerCase() === request.city.trim().toLowerCase();
  });
  await Promise.all(
    matches.slice(0, 200).map((d) =>
      notify(d.userId, {
        type: 'request',
        title: `${request.urgency === 'critical' ? 'URGENT: ' : ''}${request.bloodType} blood needed in ${request.city}`,
        message: `${request.units} unit(s) needed at ${request.hospital}. You are a compatible donor.`,
        link: '/dashboard',
        email: request.urgency !== 'routine',
      })
    )
  );
  return matches.length;
}

module.exports = { serializeDonor, searchDonors, notifyMatchingDonors, eligibility, publicId, ci };
