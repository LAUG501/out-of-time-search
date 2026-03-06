import { NextResponse } from "next/server";

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

const START: [number, number] = [-110.94078, 32.31165];
const EXITS: Array<{ id: string; label: string; end: [number, number]; color: string }> = [
  { id: "route-a", label: "Possible Route A", end: [-110.93712, 32.30428], color: "#f97316" },
  { id: "route-b", label: "Possible Route B", end: [-110.9464, 32.3056], color: "#22c55e" },
  { id: "route-c", label: "Possible Route C", end: [-110.9318, 32.3089], color: "#38bdf8" },
];

async function fetchRoute(start: [number, number], end: [number, number]) {
  const waypoints = `${start[0]},${start[1]};${end[0]},${end[1]}`;
  const url = `${OSRM_BASE}/${waypoints}?overview=full&geometries=geojson`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "out-of-time-search/1.0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    routes?: Array<{ geometry?: { coordinates?: [number, number][] } }>;
  };

  const coordinates = payload.routes?.[0]?.geometry?.coordinates;
  if (!coordinates || coordinates.length < 2) {
    return null;
  }

  return coordinates;
}

export async function GET() {
  try {
    const routes = [] as Array<{ id: string; label: string; color: string; coordinates: [number, number][] }>;

    for (const routeDef of EXITS) {
      const coords = await fetchRoute(START, routeDef.end);
      if (coords) {
        routes.push({
          id: routeDef.id,
          label: routeDef.label,
          color: routeDef.color,
          coordinates: coords,
        });
      }
    }

    if (!routes.length) {
      return NextResponse.json({ mode: "fallback", routes: [] });
    }

    return NextResponse.json({ mode: "osrm", routes });
  } catch {
    return NextResponse.json({ mode: "fallback", routes: [] });
  }
}
