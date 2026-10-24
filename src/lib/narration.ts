import { formatMinutes } from "./geo";
import type { Day, Itinerary, PalId, StopKind } from "./types";

const NAMES: Record<PalId, string> = { momo: "Momo", pip: "Pip", lux: "Lux", dot: "Dot", zuzu: "Zuzu" };
const PAL_FOR: Record<StopKind, PalId> = { food: "momo", hike: "pip", sight: "lux", culture: "dot", night: "zuzu", shop: "zuzu", relax: "pip" };

const MODE_WORD = { walk: "a stroll", metro: "a quick metro ride", train: "a train ride", bus: "a bus ride", car: "a road trip", ferry: "a ferry hop", flight: "a flight" } as const;

export function introLine(it: Itinerary) {
  const cities = [...new Set(it.days.map((d) => d.city))];
  return `Welcome aboard! ${it.title}, with ${cities.length > 1 ? `${cities.length} stops: ${cities.join(", ")}` : `all of it in ${cities[0]}`}. Buckle up, pals.`;
}

export function dayLine(day: Day, it: Itinerary) {
  const parts: string[] = [];
  parts.push(`Day ${day.day}, ${day.city}.`);
  if (day.arrival) parts.push(`${formatMinutes(day.arrival.minutes)} of ${MODE_WORD[day.arrival.mode]} from ${day.arrival.from}.`);
  const first = day.stops[0];
  if (first) parts.push(`We start at ${first.name}.`);
  const star = day.stops.find((s) => it.pals.includes(PAL_FOR[s.kind]) && s !== first);
  if (star) parts.push(`${NAMES[PAL_FOR[star.kind]]} can't wait for ${star.name}.`);
  const last = day.stops.at(-1);
  if (last && last !== first && last !== star) parts.push(`And we end the day at ${last.name}.`);
  if (day.weather) parts.push(`Expect around ${day.weather.hi} degrees.`);
  return parts.join(" ");
}

export function stopLine(day: Day, index: number) {
  const s = day.stops[index];
  return `${s.time}. ${s.name}. ${s.blurb}`;
}

export function outroLine(it: Itinerary) {
  return `That's the trip! ${it.days.length} days, ${it.days.reduce((n, d) => n + d.stops.length, 0)} adventures. Where to next, pal?`;
}
