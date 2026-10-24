import type { Budget, Itinerary } from "./types";

export function computeBudget(it: Itinerary): Budget {
  const rooms = Math.ceil(it.travelers / 2);
  let lodging = 0;
  let food = 0;
  let activities = 0;
  let transit = 0;
  for (const day of it.days) {
    lodging += day.lodging * rooms;
    food += day.meals * it.travelers;
    if (day.arrival) transit += day.arrival.cost * it.travelers;
    for (const s of day.stops) {
      if (s.kind === "food") food += s.cost * it.travelers;
      else activities += s.cost * it.travelers;
    }
    // local hops between stops: metro fares add up
    transit += Math.max(0, day.stops.length - 1) * 2 * it.travelers;
  }
  const total = Math.round(lodging + food + activities + transit);
  return {
    lodging: Math.round(lodging),
    food: Math.round(food),
    activities: Math.round(activities),
    transit: Math.round(transit),
    total,
    limit: it.budgetLimit,
  };
}

export function formatUSD(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}
