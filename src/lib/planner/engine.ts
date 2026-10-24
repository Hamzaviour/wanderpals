import { computeBudget } from "../budget";
import { COUNTRIES, findCity, findCountry, type City, type Country, type Place } from "../data/destinations";
import { reflow, uid } from "../itinerary";
import type { PlanStep, Day, Idea, Itinerary, PlanEvent, Stop, StopKind, TransitProfile } from "../types";
import { MONTHS, palsFor, parseRequest, type TripRequest } from "./parse";
import { aiScoutEnabled, scoutWithAI } from "./ai-scout";
import { geocode, typicalWeather, wikiPlaces } from "./tools";

type Emit = (e: PlanEvent) => void;

const KIND_WORD: Record<StopKind, string> = {
  food: "Snacks",
  hike: "Trails",
  culture: "History",
  sight: "Views",
  night: "Late nights",
  shop: "Treasure hunting",
  relax: "Slow time",
};

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Small deterministic hash so the same request plans the same trip. */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

class Steps {
  constructor(private emit: Emit) {}
  async run<T>(tool: PlanStep["tool"], label: string, fn: () => Promise<{ value: T; detail?: string }>): Promise<T> {
    const id = uid("s");
    this.emit({ type: "step", step: { id, tool, label, status: "running" } });
    const started = Date.now();
    const { value, detail } = await fn();
    // keep each step on screen long enough for the board to flap
    const elapsed = Date.now() - started;
    if (elapsed < 420) await pause(420 - elapsed);
    this.emit({ type: "step", step: { id, tool, label, detail, status: "done" } });
    return value;
  }
}

function placeScore(pl: Place, interests: StopKind[], salt: string) {
  return (interests.includes(pl.kind) ? 3 : 1) + hash(salt + pl.name) * 0.9;
}

function chooseCities(country: Country, req: TripRequest) {
  const byId = new Map(country.cities.map((c) => [c.id, c]));
  const route = country.route.map((id) => byId.get(id)!).filter(Boolean);
  const score = (c: City) => c.places.reduce((s, pl) => s + (req.interests.includes(pl.kind) ? 2 : 0.5), 0);
  const n = Math.max(1, Math.min(route.length, Math.round(req.days / 2.3)));
  const keep = new Set<City>([route[0]]);
  [...route.slice(1)].sort((a, b) => score(b) - score(a)).slice(0, n - 1).forEach((c) => keep.add(c));
  const cities = route.filter((c) => keep.has(c));

  // every city gets a day, the rest are shared out by how much it suits you
  const alloc = cities.map(() => 1);
  let left = req.days - cities.length;
  const weights = cities.map(score);
  while (left > 0) {
    let best = 0;
    let bestVal = -Infinity;
    cities.forEach((_, i) => {
      const v = weights[i] / (alloc[i] + 0.5);
      if (v > bestVal) {
        bestVal = v;
        best = i;
      }
    });
    alloc[best]++;
    left--;
  }
  return cities.map((city, i) => ({ city, days: alloc[i] }));
}

function wanderStop(city: City, n: number): Place {
  const angle = n * 2.1;
  return {
    name: n % 2 ? `Neighborhood wander in ${city.name}` : `Free afternoon in ${city.name}`,
    kind: "relax",
    lat: city.lat + Math.sin(angle) * 0.008,
    lng: city.lng + Math.cos(angle) * 0.008,
    cost: 0,
    durationMin: 150,
    blurb: "No plan on purpose. Follow whatever smells good.",
  };
}

function planCityDays(
  city: City,
  count: number,
  startDay: number,
  req: TripRequest,
  arrivalMinutes: number,
): { days: Day[]; leftovers: Place[] } {
  const pool = [...city.places].sort(
    (a, b) => placeScore(b, req.interests, req.raw) - placeScore(a, req.interests, req.raw),
  );
  const used = new Set<Place>();
  const take = (pred: (pl: Place) => boolean) => {
    const pl = pool.find((x) => !used.has(x) && pred(x));
    if (pl) used.add(pl);
    return pl;
  };
  const days: Day[] = [];
  // deal places out evenly so the last day in a city isn't left with scraps
  const perDay = Math.max(2, Math.min(4, Math.ceil(pool.length / count)));
  for (let i = 0; i < count; i++) {
    const travelDay = i === 0 && arrivalMinutes > 200;
    const picks: Place[] = [];
    const cap = travelDay ? Math.min(perDay, 2) : perDay;
    let budgetMin = travelDay ? 300 : 540;
    const evening = take((pl) => pl.kind === "night" || (pl.kind === "food" && pl.durationMin >= 90));
    if (evening) budgetMin -= evening.durationMin;
    while (budgetMin > 60 && picks.length < cap - (evening ? 1 : 0)) {
      const lastKind = picks.at(-1)?.kind;
      const pl =
        take((x) => x.kind !== "night" && x.kind !== lastKind && x.durationMin <= budgetMin) ??
        take((x) => x.kind !== "night" && x.durationMin <= budgetMin);
      if (!pl) break;
      picks.push(pl);
      budgetMin -= pl.durationMin + 30;
    }
    if (picks.length === 0) picks.push(wanderStop(city, startDay + i));
    orderByDistance(picks);
    if (evening) picks.push(evening);
    const stops: Stop[] = picks.map((pl) => ({
      id: uid("p"),
      name: pl.name,
      kind: pl.kind,
      lat: pl.lat,
      lng: pl.lng,
      time: "09:00",
      durationMin: pl.durationMin,
      cost: pl.cost,
      blurb: pl.blurb,
    }));
    const kinds = [...new Set(stops.map((s) => s.kind))];
    days.push({
      day: startDay + i,
      cityId: city.id,
      city: city.name,
      lat: city.lat,
      lng: city.lng,
      title: kinds.slice(0, 2).map((k) => KIND_WORD[k]).join(" & "),
      stops,
      lodging: city.lodging,
      meals: city.foodPerDay,
    });
  }
  return { days, leftovers: pool.filter((pl) => !used.has(pl)) };
}

/** Nearest-neighbor ordering so a day doesn't zigzag across town. */
function orderByDistance(picks: Place[]) {
  for (let i = 1; i < picks.length; i++) {
    const prev = picks[i - 1];
    let best = i;
    for (let j = i + 1; j < picks.length; j++) {
      const dj = (picks[j].lat - prev.lat) ** 2 + (picks[j].lng - prev.lng) ** 2;
      const db = (picks[best].lat - prev.lat) ** 2 + (picks[best].lng - prev.lng) ** 2;
      if (dj < db) best = j;
    }
    [picks[i], picks[best]] = [picks[best], picks[i]];
  }
}

function trimToBudget(it: Itinerary): Itinerary {
  let budget = computeBudget(it);
  if (budget.total <= it.budgetLimit) return it;
  const notes: string[] = [];
  const days = it.days.map((d) => ({ ...d, stops: [...d.stops] }));
  // 1) swap the priciest activities for free things in the same city
  const pricey = days
    .flatMap((d) => d.stops.map((s) => ({ d, s })))
    .filter(({ s }) => s.cost >= 20)
    .sort((a, b) => b.s.cost - a.s.cost);
  const ideas = [...it.ideas];
  for (const { d, s } of pricey) {
    if (budget.total <= it.budgetLimit) break;
    const freeIdx = ideas.findIndex((x) => x.cityId === d.cityId && x.stop.cost < s.cost / 3);
    if (freeIdx < 0) continue;
    const swap = ideas.splice(freeIdx, 1)[0];
    d.stops[d.stops.indexOf(s)] = { ...swap.stop, id: uid("p"), time: s.time };
    ideas.push({ id: uid("i"), cityId: d.cityId, city: d.city, stop: { ...s } });
    notes.push(`Swapped ${s.name} for ${swap.stop.name} to save ${"$" + Math.round((s.cost - swap.stop.cost) * it.travelers)}.`);
    budget = computeBudget({ ...it, days, ideas });
  }
  let next = { ...it, days, ideas };
  // 2) still over: switch to hostels and guesthouses
  if (budget.total > it.budgetLimit) {
    next = { ...next, days: next.days.map((d) => ({ ...d, lodging: Math.round(d.lodging * 0.55) })) };
    notes.push("Booked cozy guesthouses and hostels instead of hotels.");
    budget = computeBudget(next);
  }
  if (budget.total > it.budgetLimit) {
    notes.push(`Still about $${budget.total - it.budgetLimit} over. Drop a day or bump the budget and I'll redo it.`);
  }
  return { ...next, notes: [...next.notes, ...notes] };
}

async function buildFromCountry(
  steps: Steps,
  req: TripRequest,
  country: Country,
  onlyCity?: City,
  fixedDays?: Map<string, number>,
): Promise<Itinerary> {
  const plan = await steps.run("places", `Scouting places in ${onlyCity?.name ?? country.name}`, async () => {
    const chosen = onlyCity
      ? [{ city: onlyCity, days: req.days }]
      : fixedDays
        ? country.cities.map((city) => ({ city, days: fixedDays.get(city.id) ?? 1 }))
        : chooseCities(country, req);
    return {
      value: chosen,
      detail: chosen.map((c) => `${c.city.name} ×${c.days}`).join(" → "),
    };
  });

  const profile: TransitProfile = {
    fastRail: country.fastRail,
    drive: country.drive,
    busOnly: country.busOnly,
    flightAbove: country.flightAbove,
  };

  const built = await steps.run("route", "Routing between stops", async () => {
    const days: Day[] = [];
    const ideas: Idea[] = [];
    let prev: City | undefined;
    for (const { city, days: n } of plan) {
      const arrival = prev ? reflowArrival(prev, city, profile) : 0;
      const { days: cityDays, leftovers } = planCityDays(city, n, days.length + 1, req, arrival);
      days.push(...cityDays);
      leftovers.forEach((pl) => ideas.push({ id: uid("i"), cityId: city.id, city: city.name, stop: { id: uid("p"), ...pl } }));
      prev = city;
    }
    const legs = plan.length - 1;
    return { value: { days, ideas }, detail: legs ? `${legs} city hops, ${days.reduce((s, d) => s + d.stops.length, 0)} stops` : `${days.reduce((s, d) => s + d.stops.length, 0)} stops` };
  });

  const it = await assemble(steps, req, onlyCity ? `${onlyCity.name}, ${country.name}` : country.name, built.days, built.ideas, profile);
  return fixedDays ? { ...it, plannedBy: "ai-scout" } : it;
}

function reflowArrival(a: City, b: City, profile: TransitProfile) {
  const it = reflow({
    days: [
      { day: 1, cityId: a.id, city: a.name, lat: a.lat, lng: a.lng, title: "", stops: [], lodging: 0, meals: 0 },
      { day: 2, cityId: b.id, city: b.name, lat: b.lat, lng: b.lng, title: "", stops: [], lodging: 0, meals: 0 },
    ],
    transit: profile,
  } as unknown as Itinerary);
  return it.days[1].arrival?.minutes ?? 0;
}

async function assemble(
  steps: Steps,
  req: TripRequest,
  destination: string,
  days: Day[],
  ideas: Idea[],
  profile: TransitProfile,
): Promise<Itinerary> {
  const monthIdx = MONTHS.indexOf(req.month);
  const cityIds = [...new Set(days.map((d) => d.cityId))];
  const weather = await steps.run("weather", `Checking ${req.month} weather`, async () => {
    const results = await Promise.all(
      cityIds.map(async (id) => {
        const d = days.find((x) => x.cityId === id)!;
        return [id, await typicalWeather(d.lat, d.lng, monthIdx)] as const;
      }),
    );
    const map = new Map(results);
    const first = results.find(([, w]) => w)?.[1];
    return {
      value: map,
      detail: first ? `Typically ${first.lo}–${first.hi}°C, ${first.rainyDays} wet days` : "Weather service is napping, skipped",
    };
  });

  const it0: Itinerary = {
    id: uid("t"),
    title: `${req.days} ${req.days === 1 ? "day" : "days"} in ${destination.split(",")[0]}`,
    destination,
    month: req.month,
    travelers: req.travelers,
    budgetLimit: req.budget,
    interests: req.interests,
    pals: palsFor(req.interests),
    days: days.map((d, i) => ({
      ...d,
      lodging: i === days.length - 1 ? 0 : d.lodging,
      weather: weather.get(d.cityId) ?? undefined,
    })),
    ideas,
    createdAt: Date.now(),
    plannedBy: "wanderpals-engine",
    transit: profile,
    notes: req.budgetGiven ? [] : [`No budget given, so I assumed about $${req.budget}.`],
  };

  return steps.run("budget", "Balancing the budget", async () => {
    const it = trimToBudget(reflow(it0));
    const b = computeBudget(it);
    return { value: it, detail: `$${b.total.toLocaleString("en-US")} of $${b.limit.toLocaleString("en-US")}` };
  });
}

async function buildFromAnywhere(steps: Steps, req: TripRequest): Promise<Itinerary> {
  const hit = await steps.run("places", `Finding ${req.destination} on the map`, async () => {
    const h = await geocode(req.destination);
    return { value: h, detail: h ? `${h.name}${h.country ? ", " + h.country : ""}` : "Not found" };
  });
  if (!hit) throw new Error(`I couldn't find "${req.destination}" on the map. Try a city or country name.`);

  const places = await steps.run("wiki", "Reading up on what's nearby", async () => {
    let found = await wikiPlaces(hit.lat, hit.lng, 10000);
    if (found.length < 8) found = [...found, ...(await wikiPlaces(hit.lat, hit.lng, 30000))];
    const seen = new Set<string>();
    found = found.filter((pl) => !seen.has(pl.name) && seen.add(pl.name));
    return { value: found, detail: `${found.length} notable places` };
  });

  const name = hit.name.replace(/^(City|County|Municipality) of /i, "");
  const city: City = {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    lat: hit.lat,
    lng: hit.lng,
    lodging: 100,
    foodPerDay: 30,
    places,
  };
  const country: Country = { id: "x", name: hit.country ?? hit.name, aliases: [], route: [city.id], cities: [city] };
  const plan = planCityDays(city, req.days, 1, req, 0);
  await steps.run("route", "Routing between stops", async () => ({
    value: null,
    detail: `${plan.days.reduce((s, d) => s + d.stops.length, 0)} stops around ${city.name}`,
  }));
  const ideas = plan.leftovers.map((pl) => ({ id: uid("i"), cityId: city.id, city: city.name, stop: { id: uid("p"), ...pl } }));
  return assemble(steps, req, `${city.name}${country.name !== city.name ? ", " + country.name : ""}`, plan.days, ideas, {});
}

export async function planTrip(raw: string, emit: Emit): Promise<Itinerary> {
  const steps = new Steps(emit);
  const req = await steps.run("parse", "Reading your wish", async () => {
    const r = parseRequest(raw);
    return {
      value: r,
      detail: `${r.days} days · ${r.month} · $${r.budget.toLocaleString("en-US")}${r.travelers > 1 ? ` · ${r.travelers} travelers` : ""} · ${r.interests.join(", ")}`,
    };
  });
  if (aiScoutEnabled()) {
    const scouted = await steps.run("ai", "Asking the AI scout", async () => {
      try {
        const s = await scoutWithAI(req);
        return { value: s, detail: s ? s.country.cities.map((c) => c.name).join(" → ") : "No answer, using the built-in planner" };
      } catch {
        return { value: null, detail: "AI scout is unreachable, using the built-in planner" };
      }
    });
    if (scouted) {
      const total = [...scouted.days.values()].reduce((a, b) => a + b, 0);
      if (total !== req.days) req.days = total;
      return buildFromCountry(steps, req, scouted.country, undefined, scouted.days);
    }
  }
  const cityHit = findCity(raw);
  const country = findCountry(raw);
  // a named city wins when it's the whole point ("3 days in Kyoto"); a country name wins otherwise
  if (cityHit && (!country || country.id === cityHit.country.id) && !country?.aliases.some((a) => raw.toLowerCase().includes(a) && a !== cityHit.city.name.toLowerCase())) {
    return buildFromCountry(steps, req, cityHit.country, cityHit.city);
  }
  if (country) return buildFromCountry(steps, req, country);
  return buildFromAnywhere(steps, req);
}

export { COUNTRIES };
