const config = require('../config');
const { distanceKm, geocode, nominatim } = require('../utils/geo');

// Blood bank / blood donation centre lookup from two external sources:
//  1. data.gov.in (Government of India Open Data) – needs a free API key and the
//     resource id of the "blood bank directory" dataset (set in .env).
//  2. OpenStreetMap via Nominatim – free, no key. Used when data.gov.in is not
//     configured, or as a fallback when it fails. Many Indian blood banks on
//     OpenStreetMap carry phone, email, opening hours and government/private type.

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

const first = (...vals) => vals.find((x) => x && String(x).trim()) || null;
const titleCase = (x) => (!x ? null : x.toLowerCase() === 'ngo' ? 'NGO' : x.charAt(0).toUpperCase() + x.slice(1));

async function searchOpenStreetMap({ latitude, longitude, radiusKm }) {
  const r = Math.min(Math.max(radiusKm, 1), 100);
  const dLat = r / 111;
  const dLng = r / (111 * Math.cos((latitude * Math.PI) / 180));
  const rows = await nominatim({
    q: 'blood bank',
    limit: '40',
    countrycodes: 'in',
    viewbox: [longitude - dLng, latitude + dLat, longitude + dLng, latitude - dLat].join(','),
    bounded: '1',
    extratags: '1',
    addressdetails: '1',
  });
  return (Array.isArray(rows) ? rows : [])
    .filter((e) => ['blood_bank', 'blood_donation'].includes(e.type))
    .map((e) => {
      const t = e.extratags || {};
      const a = e.address || {};
      const kind = titleCase(t['operator:type']);
      return {
        source: 'openstreetmap',
        name: e.name || 'Blood bank',
        category: [kind, t.opening_hours === '24/7' ? 'Open 24/7' : null].filter(Boolean).join(' · ') || null,
        address: [a.house_number, a.road, a.suburb || a.neighbourhood].filter(Boolean).join(', ') || null,
        city: first(a.city, a.town, a.village),
        district: first(a.state_district, a.county),
        state: a.state || null,
        pincode: a.postcode || null,
        phone: first(t['contact:phone'], t.phone, t['contact:mobile'], t['contact:helpline']),
        email: first(t['contact:email'], t.email),
        website: first(t['contact:website'], t.website),
        latitude: Number(e.lat),
        longitude: Number(e.lon),
      };
    })
    .filter((b) => distanceKm(latitude, longitude, b.latitude, b.longitude) <= r);
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
        results = await cached(key, () => searchOpenStreetMap({ latitude: lat, longitude: lng, radiusKm }));
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
