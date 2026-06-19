/**
 * Calculate the Haversine distance between two geographic points.
 * Returns distance in meters.
 * @param {number} lat1 Latitude of point 1
 * @param {number} lng1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lng2 Longitude of point 2
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371e3; // Earth's radius in meters
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lng2 - lng1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

module.exports = { haversineDistance };
