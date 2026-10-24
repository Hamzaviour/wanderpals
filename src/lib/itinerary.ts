import { addMinutes, estimateLeg, haversineKm, minutesOf } from "./geo";
import type { Day, Itinerary, Leg, Stop, TransitProfile } from "./types";

export const DAY_START = "09:00";

export function legBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }, profile: TransitProfile): Leg {
  const km = haversineKm(a.lat, a.lng, b.lat, b.lng);
  // short hops never fly; a rental car only kicks in beyond town
  return km < 60 ? estimateLeg(km, { ...profile, drive: profile.drive && km > 15 }) : estimateLeg(km, profile);
}

/** Re-time a day's stops in order, honoring travel time between them. */
export function rescheduleDay(day: Day, profile: TransitProfile): Day {
  let clock = day.arrival ? addMinutes(DAY_START, Math.min(day.arrival.minutes, 300)) : DAY_START;
  const stops: Stop[] = [];
  day.stops.forEach((s, i) => {
    if (i > 0) clock = addMinutes(clock, legBetween(stops[i - 1], s, profile).minutes);
    // dinner and nights out wait for the evening
    const evening = i > 0 && i === day.stops.length - 1 && (s.kind === "night" || (s.kind === "food" && s.durationMin >= 90));
    if (evening && minutesOf(clock) < 18 * 60) clock = "18:30";
    stops.push({ ...s, time: clock });
    clock = addMinutes(clock, s.durationMin);
  });
  return { ...day, stops };
}

/** Recompute arrival legs between cities, then re-time every day. */
export function reflow(it: Itinerary): Itinerary {
  const days = it.days.map((d, i) => {
    const prev = it.days[i - 1];
    let arrival = d.arrival;
    if (!prev || prev.cityId === d.cityId) arrival = undefined;
    else arrival = { ...legBetween(prev, d, it.transit), from: prev.city };
    return rescheduleDay({ ...d, arrival }, it.transit);
  });
  return { ...it, days };
}

export function dayTravelMinutes(day: Day, profile: TransitProfile) {
  let total = day.arrival?.minutes ?? 0;
  for (let i = 1; i < day.stops.length; i++) total += legBetween(day.stops[i - 1], day.stops[i], profile).minutes;
  return total;
}

export function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}
