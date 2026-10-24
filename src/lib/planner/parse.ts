import type { PalId, StopKind } from "../types";

export interface TripRequest {
  raw: string;
  days: number;
  month: string;
  budget: number;
  budgetGiven: boolean;
  travelers: number;
  interests: StopKind[];
  destination: string;
}

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, twenty: 20,
};

const INTEREST_WORDS: [StopKind, RegExp][] = [
  ["food", /\b(food|foodie|eat|eating|ramen|sushi|taco|tacos|cuisine|culinary|pasta|street food|wine|coffee|markets?)\b/],
  ["hike", /\b(hik(e|es|ing)|trek(king)?|trails?|nature|outdoors?|mountains?|adventure|waterfalls?|walks?|desert|dunes|glaciers?)\b/],
  ["culture", /\b(culture|history|historic|museums?|art|temples?|ruins|architecture|castles?)\b/],
  ["night", /\b(nightlife|party|parties|bars?|clubs?|drinks|cocktails|night)\b/],
  ["shop", /\b(shop(ping)?|souks?|vintage|crafts)\b/],
  ["relax", /\b(relax(ing)?|spa|onsen|hot springs?|beach(es)?|chill|slow|lagoon)\b/],
  ["sight", /\b(photos?|photography|sightseeing|views?|instagram|scenery|landscapes?)\b/],
];

export const PAL_FOR_KIND: Record<StopKind, PalId> = {
  food: "momo",
  hike: "pip",
  sight: "lux",
  culture: "dot",
  night: "zuzu",
  shop: "zuzu",
  relax: "pip",
};

function toNumber(s: string) {
  const n = NUMBER_WORDS[s.toLowerCase()];
  return n ?? Number(s);
}

export function parseRequest(raw: string, now = new Date()): TripRequest {
  const t = raw.toLowerCase();

  let days = 7;
  const dayMatch = t.match(/\b(\d{1,2}|[a-z]+)[\s-]*(days?|nights?)\b/);
  if (dayMatch && !Number.isNaN(toNumber(dayMatch[1]))) days = toNumber(dayMatch[1]);
  else if (/\btwo weeks|fortnight\b/.test(t)) days = 14;
  else if (/\b(a|one) week\b|\bweek\b/.test(t)) days = 7;
  else if (/\bweekend\b/.test(t)) days = 3;
  days = Math.max(1, Math.min(21, days));

  const monthIdx = MONTHS.findIndex((m) => t.includes(m.toLowerCase()) || t.includes(m.slice(0, 3).toLowerCase() + " "));
  const month = monthIdx >= 0 ? MONTHS[monthIdx] : MONTHS[(now.getMonth() + 1) % 12];

  let budget = 0;
  const money =
    t.match(/\$\s?([\d,.]+)\s*(k)?/) ??
    t.match(/([\d,.]+)\s*(k)?\s*(dollars|usd|bucks|\$)/) ??
    t.match(/budget\D{0,12}([\d,.]+)\s*(k)?/);
  if (money) {
    budget = Number(money[1].replace(/,/g, ""));
    if (money[2] === "k") budget *= 1000;
  }
  const budgetGiven = budget > 0;
  if (!budgetGiven) budget = days * 160;

  let travelers = 1;
  const people = t.match(/\b(\d|two|three|four|five|six)\s*(people|friends|of us|travell?ers|adults|pals)\b/);
  if (people) travelers = toNumber(people[1]);
  else if (/\b(couple|partner|wife|husband|girlfriend|boyfriend|honeymoon|with my (mom|dad|friend|sister|brother))\b/.test(t)) travelers = 2;
  travelers = Math.max(1, Math.min(8, travelers));

  const interests = INTEREST_WORDS.filter(([, re]) => re.test(t)).map(([k]) => k);
  if (interests.length === 0) interests.push("sight", "food", "culture");

  // destination: strip the bits we already understood, keep the place-ish words
  const destination =
    raw.match(/\b(?:in|to|around|across|visit(?:ing)?)\s+([A-Z][\p{L}'’.-]+(?:\s+[A-Z][\p{L}'’.-]+){0,3})/u)?.[1] ??
    raw.match(/([A-Z][\p{L}'’.-]+(?:\s+[A-Z][\p{L}'’.-]+){0,2})/u)?.[1] ??
    raw.trim();

  return { raw, days, month, budget, budgetGiven, travelers, interests, destination };
}

export function palsFor(interests: StopKind[]): PalId[] {
  const set = new Set<PalId>(interests.map((k) => PAL_FOR_KIND[k]));
  set.add("lux");
  const order: PalId[] = ["lux", "momo", "pip", "dot", "zuzu"];
  return order.filter((p) => set.has(p)).slice(0, 4);
}
