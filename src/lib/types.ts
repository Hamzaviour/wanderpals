// The itinerary is the single source of truth: the globe, the departure board,
// the budget meter and the flyover all render from this shape.

export type StopKind = "sight" | "food" | "hike" | "culture" | "night" | "shop" | "relax";

export type TransitMode = "walk" | "metro" | "train" | "bus" | "car" | "ferry" | "flight";

export type PalId = "momo" | "pip" | "lux" | "dot" | "zuzu";

export interface Stop {
  id: string;
  name: string;
  kind: StopKind;
  lat: number;
  lng: number;
  /** "09:30" local time */
  time: string;
  durationMin: number;
  /** estimated cost in USD for one traveler */
  cost: number;
  blurb: string;
  /** set when the user dragged the pin somewhere new */
  moved?: boolean;
}

export interface Leg {
  mode: TransitMode;
  minutes: number;
  km: number;
  cost: number;
}

export interface Weather {
  hi: number;
  lo: number;
  rainyDays: number;
  source: "open-meteo" | "typical";
}

export interface Day {
  day: number;
  cityId: string;
  city: string;
  lat: number;
  lng: number;
  title: string;
  stops: Stop[];
  /** how you got to this city (absent on day 1 and on days staying put) */
  arrival?: Leg & { from: string };
  /** room per night, USD (0 on the last day) */
  lodging: number;
  /** everyday meals per person, USD */
  meals: number;
  weather?: Weather;
}

export interface TransitProfile {
  fastRail?: boolean;
  drive?: boolean;
  busOnly?: boolean;
  flightAbove?: number;
}

export interface Itinerary {
  id: string;
  title: string;
  destination: string;
  month: string;
  travelers: number;
  budgetLimit: number;
  interests: StopKind[];
  pals: PalId[];
  days: Day[];
  /** spare activities friends can vote into the plan */
  ideas: Idea[];
  createdAt: number;
  plannedBy: "wanderpals-engine" | "ai-scout";
  transit: TransitProfile;
  notes: string[];
}

export interface Idea {
  id: string;
  cityId: string;
  city: string;
  stop: Omit<Stop, "time">;
}

export interface Budget {
  lodging: number;
  food: number;
  activities: number;
  transit: number;
  total: number;
  limit: number;
}

export interface PlanStep {
  id: string;
  tool: "parse" | "places" | "route" | "weather" | "wiki" | "budget" | "compose" | "ai";
  label: string;
  detail?: string;
  status: "running" | "done" | "skipped";
}

export type PlanEvent =
  | { type: "step"; step: PlanStep }
  | { type: "itinerary"; itinerary: Itinerary }
  | { type: "error"; message: string };
