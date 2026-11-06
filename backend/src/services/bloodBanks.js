const config = require('../config');
const { distanceKm, geocode } = require('../utils/geo');

// Blood bank / blood donation centre lookup from two external sources:
//  1. data.gov.in (Government of India Open Data) – needs a free API key and the
//     resource id of the "blood bank directory" dataset (set in .env).
//  2. OpenStreetMap via the Overpass API – free, no key, works worldwide. Used when
//     data.gov.in is not configured, or as a fallback when it fails.

const cache = new Map();
const TTL_MS = 6 * 60 * 60 * 1000;

function cached(key, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  const value = fn().then((v) => v, (e) => { cache.delete(key); throw e; });
  cache.set(key, { at: Date.now(), value });
  return value;
}

// data.gov.in field names differ between dataset versions, so match loosely.
function pick(record, ...needles) {
  const keys = Object.keys(record);
  for (const n of needles) {
    const k = keys.find((key) => key.toLowerCase().replace(/^_+/, '').includes(n));
    if (k && record[k] && String(record[k]).trim() && String(record[k]).toUpperCase() !== 'NA') return String(record[k]).trim();
  }
  return null;
}

function fromDataGovIn(r) {
  const lat = Number(pick(r, 'latitude'));
  const lng = Number(pick(r, 'longitude'));
  return {
    source: 'data.gov.in',
    name: pick(r, 'blood_bank_name', 'bank_name', 'name'),
    category: pick(r, 'category'),
    address: pick(r, 'address'),
    city: pick(r, 'city', 'district'),
    district: pick(r, 'district'),
    state: pick(r, 'state'),
    pincode: pick(r, 'pincode', 'pin'),
    phone: pick(r, 'mobile', 'contact', 'phone', 'helpline'),
    email: pick(r, 'email'),
    website: pick(r, 'website'),
    latitude: Number.isFinite(lat) && lat !== 0 ? lat : null,
    longitude: Number.isFinite(lng) && lng !== 0 ? lng : null,
  };
}

async function searchDataGovIn({ state, city, limit }) {
  const { apiKey, bloodBankResourceId } = config.dataGovIn;
  const params = new URLSearchParams({ 'api-key': apiKey, format: 'json', limit: String(limit) });
  if (state) params.set('filters[state]', state);
  if (city) params.set('filters[district]', city);
  const url = `https://api.data.gov.in/resource/${bloodBankResourceId}?${params}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`data.gov.in responded ${res.status}`);
  const json = await res.json();
  return (json.records || []).map(fromDataGovIn).filter((b) => b.name);
}

async function searchOverpass({ latitude, longitude, radiusKm }) {
  const r = Math.round(Math.min(radiusKm, 100) * 1000);
  const q = `[out:json][timeout:20];(
    nwr["healthcare"="blood_donation"](around:${r},${latitude},${longitude});
    nwr["amenity"="blood_bank"](around:${r},${latitude},${longitude});
    nwr["healthcare"="blood_bank"](around:${r},${latitude},${longitude});
  );out center 100;`;
  // Public Overpass servers are sometimes busy, so try mirrors in turn.
  const mirrors = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
  let json = null;
  let lastErr = null;
  for (const url of mirrors) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'LifeStream-BloodDonorNetwork/1.0' },
        body: `data=${encodeURIComponent(q)}`,
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`Overpass responded ${res.status}`);
      json = await res.json();
      break;
    } catch (err) {
      lastErr = err;
    }
  }
  if (!json) throw lastErr || new Error('Blood bank lookup failed');
  return (json.elements || [])
    .map((e) => {
      const t = e.tags || {};
      const lat = e.lat ?? e.center?.lat;
      const lng = e.lon ?? e.center?.lon;
      return {
        source: 'openstreetmap',
        name: t.name || t['name:en'] || 'Blood donation centre',
        category: t.operator || t['operator:type'] || null,
        address: [t['addr:housenumber'], t['addr:street'], t['addr:suburb']].filter(Boolean).join(', ') || null,
        city: t['addr:city'] || null,
        district: t['addr:district'] || null,
        state: t['addr:state'] || null,
        pincode: t['addr:postcode'] || null,
        phone: t.phone || t['contact:phone'] || null,
        email: t.email || t['contact:email'] || null,
        website: t.website || t['contact:website'] || null,
        latitude: lat ?? null,
        longitude: lng ?? null,
      };
    });
}

async function searchBloodBanks({ state, city, latitude, longitude, radiusKm = 25, limit = 50 }) {
  limit = Math.min(Math.max(Number(limit) || 50, 1), 200);
  let lat = latitude != null ? Number(latitude) : null;
  let lng = longitude != null ? Number(longitude) : null;
  let results = [];
  let source = null;
  const errors = [];

  if (config.dataGovIn.apiKey && config.dataGovIn.bloodBankResourceId && (state || city)) {
    try {
      results = await cached(`dg:${state}:${city}:${limit}`, () => searchDataGovIn({ state, city, limit }));
      source = 'data.gov.in';
    } catch (err) {
      errors.push(err.message);
    }
  }

  if (!results.length) {
    if ((lat == null || lng == null) && (city || state)) {
      const g = await geocode([city, state, 'India']);
      if (g) { lat = g.latitude; lng = g.longitude; }
    }
    if (lat != null && lng != null) {
      try {
        const key = `osm:${lat.toFixed(2)}:${lng.toFixed(2)}:${radiusKm}`;
        results = await cached(key, () => searchOverpass({ latitude: lat, longitude: lng, radiusKm }));
        source = 'openstreetmap';
      } catch (err) {
        errors.push(err.message);
      }
    }
  }

  if (lat != null && lng != null) {
    results = results
      .map((b) => ({ ...b, distanceKm: distanceKm(lat, lng, b.latitude, b.longitude) }))
      .sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9));
  }

  return { source, count: results.length, results: results.slice(0, limit), errors: errors.length ? errors : undefined };
}

module.exports = { searchBloodBanks };
