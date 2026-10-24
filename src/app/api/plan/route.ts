import { planTrip } from "@/lib/planner/engine";
import type { PlanEvent } from "@/lib/types";

export const maxDuration = 30;

// Streams the planner's tool steps as newline-delimited JSON, then the itinerary.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { prompt?: string };
  const prompt = (body.prompt ?? "").trim().slice(0, 400);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: PlanEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      if (!prompt) {
        send({ type: "error", message: "Tell me where you'd like to go first." });
        controller.close();
        return;
      }
      try {
        const itinerary = await planTrip(prompt, send);
        send({ type: "itinerary", itinerary });
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : "Something went sideways. Try again?" });
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
