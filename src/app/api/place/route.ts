import { nameSpot } from "@/lib/planner/tools";

export const maxDuration = 30;

// Names a pin the traveler dropped somewhere new.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return Response.json({ error: "lat and lng are required" }, { status: 400 });
  }
  return Response.json(await nameSpot(lat, lng));
}
