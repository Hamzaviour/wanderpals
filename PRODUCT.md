# Product

## Platform

web

## Stack

Next.js App Router + TypeScript + Tailwind CSS. MapLibre GL JS globe on free OpenFreeMap vector tiles. Built-in planner engine over a curated destination dataset, enriched with free no-key APIs (Open-Meteo weather, Wikipedia summaries). Browser Web Speech API for narration. Trips persist in localStorage and travel as shareable URLs. Optional upgrade path: an AI model (configured with env vars) can scout places; never required.

## Users

People daydreaming about or actively planning a multi-stop trip (inferred: young, casual travelers and portfolio viewers / hiring managers watching the demo). Job: turn one sentence ("10 days in Japan in April, I love food and hiking, budget 2000 dollars") into a day-by-day plan they can see, tweak, and share.

## Product Purpose

Replace "20 open tabs" trip planning with one conversation that produces a typed itinerary plotted on a 3D globe, previewable as a cinematic narrated flyover. Success (user's words): people "feel really good and enjoyable", feel happiness and smile.

## Positioning

Tool-using planner + geospatial 3D + characters. The globe renders purely from the itinerary JSON, so every planner update re-renders the map. Little traveler avatars live on the globe and travel the route with you.

## Operating Context

Desktop browser first (demo / portfolio), must work on phones. Core loop: type a sentence, watch arcs draw between stops, scroll days in a glass itinerary panel that drives the camera, drag a pin to replan with live budget and travel-time updates, press play for a flyover with narration, vote on activities with friends on a trip board, share a link.

## Capabilities and Constraints

- No paid keys, no accounts. Everything must run with `npm run dev` out of the box.
- Planner is a deterministic tool-calling loop (parse request, pick destination, choose stops, route, weather, budget) over a curated dataset; it must be honest that it is not live web search.
- Collaborative boards: no Liveblocks key, so voting is local + cross-tab (BroadcastChannel) and shareable via link. Real multi-user sync is an open decision.
- Prices are estimates and must be labeled as estimates.

## Brand Commitments

User allowed renaming. User asked for characters: little traveler avatars on the globe.

## Evidence on Hand

Project brief: `07-wanderglobe.pdf`. No testimonials, customers, real prices, or press exist; do not fabricate them.

## Product Principles

1. Joy first: every interaction should make someone smile.
2. The map is the itinerary: one JSON source of truth drives globe, timeline, budget, and flyover.
3. Show, don't list: travel time and connections are visible, not buried in text.
4. Honest numbers: costs and times are estimates and say so.
5. Free forever to run: no key gates the core experience.
