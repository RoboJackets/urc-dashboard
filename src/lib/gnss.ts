// GNSS coordinate parsing + formatting.
// URC judges may provide coordinates as decimal degrees (DD),
// degrees decimal minutes (DDM), or degrees minutes seconds (DMS),
// optionally with hemisphere letters. All three are accepted here.

export interface ParsedCoord {
  value: number; // decimal degrees, signed
  format: "DD" | "DDM" | "DMS";
}

const FLOAT = /^[+-]?\d+(\.\d+)?$/;

function applyHemisphere(v: number, hemi: string | undefined): number | null {
  if (!hemi) return v;
  const h = hemi.toUpperCase();
  if (h === "N" || h === "E") return Math.abs(v);
  if (h === "S" || h === "W") return -Math.abs(v);
  return null;
}

/**
 * Parse a single latitude or longitude field.
 * Accepted forms:
 *   DD:   "38.411" | "-110.786" | "38.411 N" | "N 38.411"
 *   DDM:  "38 24.66 N" | "38° 24.66' N"
 *   DMS:  "38 24 39.6 N" | "38° 24' 39.6\" N"
 * Returns null when the input cannot be interpreted.
 */
export function parseCoord(input: string, isLat: boolean): ParsedCoord | null {
  let s = input.trim().toUpperCase();
  if (!s) return null;

  // strip degree/minute/second symbols to plain separators
  s = s
    .replace(/[°º]/g, " ")
    .replace(/['′’]/g, " ")
    .replace(/["″”]/g, " ")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // pull hemisphere letter if present (leading or trailing)
  let hemi: string | undefined;
  const hemiMatch = s.match(/^([NSEW])\s+|\s+([NSEW])$/);
  if (hemiMatch) {
    hemi = hemiMatch[1] ?? hemiMatch[2];
    s = s.replace(/^[NSEW]\s+|\s+[NSEW]$/, "").trim();
  }

  const parts = s.split(" ").filter(Boolean);
  if (parts.length < 1 || parts.length > 3) return null;
  if (!parts.every((p) => FLOAT.test(p))) return null;

  const nums = parts.map(Number);
  const [d, m = 0, sec = 0] = nums;
  const sign = d < 0 ? -1 : 1;
  const absDeg = Math.abs(d);

  // sanity: minutes/seconds < 60; sign only on degrees
  if (m >= 60 || sec >= 60 || m < 0 || sec < 0) return null;

  let value = absDeg + m / 60 + sec / 3600;
  const limit = isLat ? 90 : 180;
  if (value > limit) return null;
  value *= sign;

  const applied = applyHemisphere(value, hemi);
  if (applied === null) return null;

  const format = parts.length === 1 ? "DD" : parts.length === 2 ? "DDM" : "DMS";
  return { value: applied, format };
}

export interface ParsedLatLng {
  lat: number;
  lng: number;
}

/**
 * Parse a combined "lat, lng" / "lat lng" entry, or two separate fields.
 * Accepts the same per-component formats as parseCoord.
 */
export function parseLatLng(input: string): ParsedLatLng | null {
  const s = input.trim();
  if (!s) return null;

  // try comma-split first (e.g. "38.411, -110.786" or "38 24.66 N, 110 47.16 W")
  const commaParts = s.split(/,(?![^,]*,)/); // split on first comma only
  if (commaParts.length === 2) {
    const lat = parseCoord(commaParts[0], true);
    const lng = parseCoord(commaParts[1], false);
    if (lat && lng) return { lat: lat.value, lng: lng.value };
  }

  // try hemisphere letters as the split point: "...N ...W"
  const hemiSplit = s.match(/^(.*?[NS])\s+(.+)$/i);
  if (hemiSplit) {
    const lat = parseCoord(hemiSplit[1], true);
    const lng = parseCoord(hemiSplit[2], false);
    if (lat && lng) return { lat: lat.value, lng: lng.value };
  }

  // two plain decimals
  const nums = s.match(/[+-]?\d+(\.\d+)?/g);
  if (nums && nums.length === 2) {
    const lat = parseCoord(nums[0], true);
    const lng = parseCoord(nums[1], false);
    if (lat && lng) return { lat: lat.value, lng: lng.value };
  }

  return null;
}

/** Format decimal degrees as signed DD with a fixed precision. */
export function formatDD(v: number, digits = 6): string {
  return v.toFixed(digits);
}

/** Format decimal degrees as DD with hemisphere letter. */
export function formatHemisphere(v: number, isLat: boolean, digits = 6): string {
  const hemi = isLat ? (v >= 0 ? "N" : "S") : v >= 0 ? "E" : "W";
  return `${Math.abs(v).toFixed(digits)} ${hemi}`;
}
