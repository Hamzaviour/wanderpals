import AIClient from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Country } from "../data/destinations";
import type { TripRequest } from "./parse";

// Optional upgrade: with AI_SCOUT_API_KEY and AI_SCOUT_MODEL set, a hosted model
// scouts cities and places for any destination on Earth. Scheduling, routing and
// budgeting stay in the deterministic engine so the globe always gets the same
// typed shape.

const PlaceSchema = z.object({
  name: z.string(),
  kind: z.enum(["sight", "food", "hike", "culture", "night", "shop", "relax"]),
  lat: z.number(),
  lng: z.number(),
  cost: z.number().describe("per-person USD estimate"),
  durationMin: z.number(),
  blurb: z.string().describe("one playful sentence, under 90 characters"),
});

const ScoutSchema = z.object({
  country: z.string(),
  fastRail: z.boolean(),
  drive: z.boolean().describe("true when a rental car is the normal way to get around"),
  flightAbove: z.number().describe("km beyond which travelers usually fly between cities"),
  cities: z.array(
    z.object({
      name: z.string(),
      lat: z.number(),
      lng: z.number(),
      days: z.number(),
      lodging: z.number().describe("mid-range room per night, USD"),
      foodPerDay: z.number().describe("everyday meals per person per day, USD"),
      places: z.array(PlaceSchema),
    }),
  ),
});

export const aiScoutEnabled = () => Boolean(process.env.AI_SCOUT_API_KEY && process.env.AI_SCOUT_MODEL);

export async function scoutWithAI(req: TripRequest): Promise<{ country: Country; days: Map<string, number> } | null> {
  const client = new AIClient({ apiKey: process.env.AI_SCOUT_API_KEY });
  const response = await client.messages.parse({
    model: process.env.AI_SCOUT_MODEL!,
    max_tokens: 16000,
    output_config: { effort: "low", format: zodOutputFormat(ScoutSchema) },
    system:
      "You scout trips for a playful travel planner. Pick cities in a sensible travel order and real, well-known places with accurate coordinates. " +
      "Give each city 1.5x as many places as it has days times three, weighted toward the traveler's interests. Costs are honest per-person USD estimates.",
    messages: [
      {
        role: "user",
        content:
          `Trip wish: "${req.raw}"\n` +
          `Parsed: ${req.days} days in ${req.month}, budget $${req.budget} for ${req.travelers} traveler(s), interests: ${req.interests.join(", ")}.\n` +
          `The day counts across cities must add up to ${req.days}.`,
      },
    ],
  });
  if (response.stop_reason === "refusal") return null;
  const out = response.parsed_output;
  if (!out?.cities.length) return null;

  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const days = new Map<string, number>();
  const country: Country = {
    id: slug(out.country),
    name: out.country,
    aliases: [],
    fastRail: out.fastRail,
    drive: out.drive,
    flightAbove: out.flightAbove,
    route: out.cities.map((c) => slug(c.name)),
    cities: out.cities.map((c) => {
      days.set(slug(c.name), Math.max(1, Math.round(c.days)));
      return { id: slug(c.name), name: c.name, lat: c.lat, lng: c.lng, lodging: c.lodging, foodPerDay: c.foodPerDay, places: c.places };
    }),
  };
  return { country, days };
}
