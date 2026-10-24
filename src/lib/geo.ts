import type { Leg, TransitMode } from "./types";

const R = 6371;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Points along the great circle between a and b, as [lng, lat] pairs. */
export function greatCircle(a: [number, number], b: [number, number], steps = 64): [number, number][] {
  const [lng1, lat1] = a.map(rad) as [number, number];
  const [lng2, lat2] = b.map(rad) as [number, number];
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2,
      ),
    );
  if (d === 0) return [a, b];
  const out: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
    const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    out.push([deg(Math.atan2(y, x)), deg(Math.atan2(z, Math.sqrt(x * x + y * y)))]);
  }
  return out;
}

/**
 * Rough door-to-door estimate. Speeds include waiting and boarding, so they
 * read slow on paper; they are labeled as estimates everywhere in the UI.
 */
export function estimateLeg(
  km: number,
  opts: { fastRail?: boolean; drive?: boolean; busOnly?: boolean; flightAbove?: number } = {},
): Leg {
  let mode: TransitMode;
  let minutes: number;
  let cost: number;
  const flightAbove = opts.flightAbove ?? 650;
  if (km < 1.4) {
    mode = "walk";
    minutes = (km / 4.5) * 60;
    cost = 0;
  } else if (opts.drive && km < 900) {
    // rental car split between travelers, fuel included
    mode = "car";
    minutes = 5 + (km / 70) * 60;
    cost = 8 + km * 0.22;
  } else if (km < 30) {
    mode = "metro";
    minutes = 10 + (km / 24) * 60;
    cost = 1.5 + km * 0.12;
  } else if (km < flightAbove) {
    mode = opts.busOnly || (km < 90 && !opts.fastRail) ? "bus" : "train";
    const speed = opts.fastRail ? 190 : mode === "bus" ? 65 : 85;
    minutes = 25 + (km / speed) * 60;
    cost = opts.fastRail ? 15 + km * 0.26 : 6 + km * 0.09;
  } else {
    mode = "flight";
    minutes = 150 + (km / 750) * 60;
    cost = 60 + km * 0.09;
  }
  return { mode, minutes: Math.round(minutes), km: Math.round(km * 10) / 10, cost: Math.round(cost) };
}

export function formatMinutes(min: number) {
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function addMinutes(time: string, min: number) {
  const [h, m] = time.split(":").map(Number);
  const t = h * 60 + m + Math.round(min / 5) * 5;
  const hh = Math.floor(t / 60) % 24;
  const mm = t % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function minutesOf(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
