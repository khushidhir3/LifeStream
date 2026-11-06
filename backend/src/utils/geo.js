const config = require('../config');

function distanceKm(lat1, lon1, lat2, lon2) {
  if ([lat1, lon1, lat2, lon2].some((v) => v === null || v === undefined || Number.isNaN(Number(v)))) return null;
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

// Geocoding through OpenStreetMap Nominatim (free, no key).
// Usage policy: max 1 request/second and a descriptive User-Agent, so results are cached
// and calls are serialized. Failures never block the caller; they just return null.
const cache = new Map();
let queue = Promise.resolve();
let lastCall = 0;

async function geocode(parts) {
  if (!config.geocodingEnabled) return null;
  const query = parts.filter(Boolean).join(', ').trim();
  if (!query) return null;
  const key = query.toLowerCase();
  if (cache.has(key)) return cache.get(key);

  const run = async () => {
    const wait = Math.max(0, 1100 - (Date.now() - lastCall));
    if (wait) await new Promise((r) => setTimeout(r, wait));
    lastCall = Date.now();
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'LifeStream-BloodDonorNetwork/1.0', 'Accept-Language': 'en' },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const hit = Array.isArray(data) && data[0];
      const result = hit ? { latitude: Number(hit.lat), longitude: Number(hit.lon) } : null;
      cache.set(key, result);
      return result;
    } catch {
      return null;
    }
  };

  const p = queue.then(run, run);
  queue = p.catch(() => {});
  return p;
}

module.exports = { distanceKm, geocode };
