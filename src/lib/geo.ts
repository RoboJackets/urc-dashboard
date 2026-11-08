// Great-circle distance and initial bearing between WGS 84 coordinates.
// Uses a spherical Earth (mean radius), which is within ~0.5% of the
// ellipsoidal distance — ample for the sub-kilometre ranges at URC.

const EARTH_RADIUS_M = 6371008.8;
const COMPASS_POINTS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

export interface DistanceBearing {
  meters: number;
  /** initial bearing from the origin, degrees clockwise from true north [0, 360) */
  bearingDeg: number;
}

export function distanceBearing(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): DistanceBearing {
  const phi1 = toRad(fromLat);
  const phi2 = toRad(toLat);
  const dPhi = phi2 - phi1;
  const dLambda = toRad(toLng - fromLng);

  const a = Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  const meters = 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));

  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  const bearingDeg = (toDeg(Math.atan2(y, x)) + 360) % 360;

  return { meters, bearingDeg };
}

export function compassPoint(bearingDeg: number): string {
  return COMPASS_POINTS[Math.round(bearingDeg / 45) % COMPASS_POINTS.length];
}

/** e.g. "312 m @ 047° NE" or "1.24 km @ 182° S" (true bearing) */
export function formatDistanceBearing({ meters, bearingDeg }: DistanceBearing): string {
  const dist = meters >= 1000 ? `${(meters / 1000).toFixed(2)} km` : `${meters.toFixed(meters < 10 ? 1 : 0)} m`;
  return `${dist} @ ${bearingDeg.toFixed(0).padStart(3, "0")}° ${compassPoint(bearingDeg)}`;
}
