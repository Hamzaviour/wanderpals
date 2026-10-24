import type { StopKind, Weather } from "../types";
import type { Place } from "../data/destinations";

// Free, keyless public APIs. Every call has a short timeout and the planner
// degrades gracefully when one is slow or down.

const UA = "Wanderpals/1.0 (open-source trip planner demo)";

async function getJSON<T>(url: string, ms = 5000): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(ms),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Typical weather for a month, from last year's daily observations (Open-Meteo archive). */
export async function typicalWeather(lat: number, lng: number, monthIdx: number): Promise<Weather | null> {
  const year = new Date().getFullYear() - 1;
  const mm = String(monthIdx + 1).padStart(2, "0");
  const last = new Date(year, monthIdx + 1, 0).getDate();
  const url =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${lat.toFixed(3)}&longitude=${lng.toFixed(3)}` +
    `&start_date=${year}-${mm}-01&end_date=${year}-${mm}-${last}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
  const data = await getJSON<{
    daily?: { temperature_2m_max: (number | null)[]; temperature_2m_min: (number | null)[]; precipitation_sum: (number | null)[] };
  }>(url);
  if (!data?.daily) return null;
  const avg = (xs: (number | null)[]) => {
    const v = xs.filter((x): x is number => typeof x === "number");
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN;
  };
  const hi = avg(data.daily.temperature_2m_max);
  const lo = avg(data.daily.temperature_2m_min);
  if (Number.isNaN(hi)) return null;
  const rainyDays = data.daily.precipitation_sum.filter((x) => (x ?? 0) >= 1).length;
  return { hi: Math.round(hi), lo: Math.round(lo), rainyDays, source: "open-meteo" };
}

export interface GeoHit {
  name: string;
  lat: number;
  lng: number;
  country?: string;
}

export async function geocode(q: string): Promise<GeoHit | null> {
  const data = await getJSON<{ lat: string; lon: string; name?: string; display_name: string; address?: { country?: string } }[]>(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&accept-language=en&q=${encodeURIComponent(q)}`,
  );
  const hit = data?.[0];
  if (!hit) return null;
  return {
    name: hit.name || hit.display_name.split(",")[0],
    lat: Number(hit.lat),
    lng: Number(hit.lon),
    country: hit.address?.country,
  };
}

const KIND_RULES: [StopKind, RegExp][] = [
  ["food", /\b(market|restaurant|cafe|café|bakery|brewery|winery|food hall|bazaar)\b/i],
  ["hike", /\b(mount|mountain|hill|trail|peak|volcano|canyon|gorge|falls|waterfall|national park|forest|ridge)\b/i],
  ["relax", /\b(park|garden|beach|lake|spa|bath|springs?|lagoon|bay)\b/i],
  ["culture", /\b(museum|gallery|temple|shrine|church|cathedral|basilica|mosque|palace|castle|fort|monastery|abbey|ruins|theatre|theater|library|tomb)\b/i],
  ["night", /\b(bar|club|pub|nightlife|night market|district)\b/i],
  ["shop", /\b(mall|shopping|street|arcade|souk)\b/i],
];

export function classify(title: string, extract = ""): StopKind {
  for (const [kind, re] of KIND_RULES) if (re.test(title)) return kind;
  for (const [kind, re] of KIND_RULES) if (re.test(extract)) return kind;
  return "sight";
}

const BORING = /\b(station|school|university|hospital|district|ward|prefecture|county|municipality|railway|airport|street|road|avenue|bridge|company|building|office|hotel|embassy|cemetery|stadium|high school|list of)\b/i;

/** Notable places near a point, from Wikipedia's geosearch. */
export async function wikiPlaces(lat: number, lng: number, radiusM = 10000): Promise<Place[]> {
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=geosearch` +
    `&ggscoord=${lat}%7C${lng}&ggsradius=${radiusM}&ggslimit=40` +
    `&prop=coordinates%7Cextracts%7Cpageprops&exintro=1&explaintext=1&exsentences=1&exlimit=20`;
  const data = await getJSON<{
    query?: { pages: Record<string, { title: string; coordinates?: { lat: number; lon: number }[]; extract?: string; index?: number }> };
  }>(url, 6000);
  if (!data?.query) return [];
  return Object.values(data.query.pages)
    .filter((pg) => pg.coordinates?.length && !BORING.test(pg.title))
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((pg) => {
      const kind = classify(pg.title, pg.extract);
      const blurb = (pg.extract ?? "").replace(/\s*\(.*?\)\s*/g, " ").trim();
      return {
        name: pg.title,
        kind,
        lat: pg.coordinates![0].lat,
        lng: pg.coordinates![0].lon,
        cost: kind === "culture" ? 12 : kind === "food" ? 18 : kind === "night" ? 25 : 0,
        durationMin: kind === "hike" ? 150 : kind === "relax" ? 75 : 90,
        blurb: blurb.length > 140 ? blurb.slice(0, 137).trimEnd() + "…" : blurb || "A local favorite worth a look.",
      };
    });
}

/** Name a dropped pin: nearest Wikipedia place, else the OpenStreetMap address. */
export async function nameSpot(lat: number, lng: number): Promise<{ name: string; blurb: string; kind: StopKind }> {
  const near = await wikiPlaces(lat, lng, 1500);
  if (near[0]) return { name: near[0].name, blurb: near[0].blurb, kind: near[0].kind };
  const rev = await getJSON<{ name?: string; display_name?: string; address?: Record<string, string> }>(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=16&accept-language=en&lat=${lat}&lon=${lng}`,
  );
  const a = rev?.address ?? {};
  const name = rev?.name || a.neighbourhood || a.suburb || a.village || a.town || a.city || "Somewhere new";
  return { name, blurb: "A spot you picked yourself. Explore and see what you find.", kind: "sight" };
}
