"use client";

import { useEffect, useMemo, useState } from "react";
import Map, { Layer, Marker, NavigationControl, Popup, Source } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  anchorPins,
  corridorPolygon,
  ringCameraFovPolygon,
  ringNeighborFovPolygon,
  routeCoordinates,
  timelineSeed,
  type MapPin,
} from "@/lib/mock-data";

type SelectedFeature = {
  id: string;
  label: string;
  note: string;
  source: string;
  confidence?: number;
  coords: [number, number];
  url?: string;
};

function pinStyle(kind: MapPin["kind"]) {
  if (kind === "home") {
    return "bg-emerald-500 ring-emerald-500/35";
  }
  if (kind === "ring") {
    return "bg-cyan-500 ring-cyan-500/35";
  }
  if (kind === "traffic") {
    return "bg-amber-500 ring-amber-500/35";
  }
  if (kind === "vehicle") {
    return "bg-white ring-slate-700/40";
  }
  return "bg-rose-500 ring-rose-500/35";
}

export function MissionMap() {
  const [showHome, setShowHome] = useState(true);
  const [showRing, setShowRing] = useState(true);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showClues, setShowClues] = useState(true);
  const [showPossibleRoutes, setShowPossibleRoutes] = useState(true);
  const [showCorridor, setShowCorridor] = useState(false);
  const [showFov, setShowFov] = useState(true);
  const [showVehicle, setShowVehicle] = useState(true);
  const [routePaths, setRoutePaths] = useState<
    Array<{ id: string; label: string; color: string; coordinates: [number, number][] }>
  >([
    {
      id: "route-a",
      label: "Possible Route A",
      color: "#f97316",
      coordinates: routeCoordinates,
    },
  ]);

  const [selected, setSelected] = useState<SelectedFeature | null>(null);
  const [carStep, setCarStep] = useState(0);
  const [syncInfo, setSyncInfo] = useState<{ index: number; total: number; timestamp: string } | null>(null);

  useEffect(() => {
    async function loadRoadRoute() {
      try {
        const response = await fetch("/api/route", { cache: "no-store" });
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as {
          routes?: Array<{ id: string; label: string; color: string; coordinates: [number, number][] }>;
        };
        if (payload.routes && payload.routes.length) {
          setRoutePaths(payload.routes.slice(0, 3));
        }
      } catch {
        // fallback to static routeCoordinates
      }
    }

    loadRoadRoute();
  }, []);

  useEffect(() => {
    function onMissionPlayhead(event: Event) {
      const custom = event as CustomEvent<{ index: number; total: number; timestamp: string }>;
      const detail = custom.detail;
      if (!detail || !routePaths[0]?.coordinates?.length || detail.total <= 1) {
        return;
      }

      const routeLength = routePaths[0].coordinates.length;
      const mapped = Math.round((detail.index / (detail.total - 1)) * (routeLength - 1));
      setCarStep(Math.max(0, Math.min(routeLength - 1, mapped)));
      setSyncInfo(detail);
    }

    if (typeof window !== "undefined") {
      window.addEventListener("mission-playhead", onMissionPlayhead as EventListener);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("mission-playhead", onMissionPlayhead as EventListener);
      }
    };
  }, [routePaths]);

  useEffect(() => {
    const activeRoute = routePaths[0]?.coordinates || [];
    if (activeRoute.length < 2 || syncInfo) {
      return;
    }

    const timer = setInterval(() => {
      setCarStep((prev) => (prev + 1) % activeRoute.length);
    }, 1200);

    return () => clearInterval(timer);
  }, [routePaths, syncInfo]);

  function showFeature(feature: SelectedFeature) {
    setSelected(feature);
  }

  const routeGeoJsonList = useMemo(
    () =>
      routePaths.map((route) => ({
        id: route.id,
        label: route.label,
        color: route.color,
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: route.coordinates,
              },
              properties: {},
            },
          ],
        },
      })),
    [routePaths]
  );

  const corridorGeoJson = useMemo(
    () => ({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [corridorPolygon],
          },
          properties: {},
        },
      ],
    }),
    []
  );

  const ringFovGeoJson = useMemo(
    () => ({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [ringCameraFovPolygon],
          },
          properties: {},
        },
      ],
    }),
    []
  );

  const ringNeighborFovGeoJson = useMemo(
    () => ({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [ringNeighborFovPolygon],
          },
          properties: {},
        },
      ],
    }),
    []
  );

  const homePins = useMemo(() => anchorPins.filter((pin) => pin.kind === "home"), []);
  const ringPins = useMemo(() => anchorPins.filter((pin) => pin.kind === "ring"), []);
  const trafficPins = useMemo(() => anchorPins.filter((pin) => pin.kind === "traffic"), []);
  const vehiclePins = useMemo(() => anchorPins.filter((pin) => pin.kind === "vehicle"), []);
  const ringFocusId = useMemo(() => {
    if (!syncInfo) {
      return "";
    }
    return syncInfo.index % 2 === 0 ? "ring-back-door" : "ring-neighbor-backway";
  }, [syncInfo]);

  return (
    <div className="relative h-[680px] overflow-hidden rounded-xl border border-border shadow-glow">
      <Map
        initialViewState={{
          longitude: -110.9405426,
          latitude: 32.3120044,
          zoom: 16.1,
          pitch: 56,
          bearing: 18,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      >
        <NavigationControl position="top-right" />

        {showCorridor ? (
          <Source id="corridor" type="geojson" data={corridorGeoJson as GeoJSON.FeatureCollection}>
            <Layer
              id="route-corridor-fill"
              type="fill"
              paint={{
                "fill-color": "#f97316",
                "fill-opacity": 0.12,
              }}
            />
          </Source>
        ) : null}

        {showFov ? (
          <Source id="ring-fov" type="geojson" data={ringFovGeoJson as GeoJSON.FeatureCollection}>
            <Layer
              id="ring-fov-fill"
              type="fill"
              paint={{
                "fill-color": "#06b6d4",
                "fill-opacity": 0.2,
              }}
            />
            <Layer
              id="ring-fov-outline"
              type="line"
              paint={{
                "line-color": "#22d3ee",
                "line-width": 1.2,
              }}
            />
          </Source>
        ) : null}

        {showFov ? (
          <Source id="ring-neighbor-fov" type="geojson" data={ringNeighborFovGeoJson as GeoJSON.FeatureCollection}>
            <Layer
              id="ring-neighbor-fov-fill"
              type="fill"
              paint={{
                "fill-color": "#06b6d4",
                "fill-opacity": 0.14,
              }}
            />
            <Layer
              id="ring-neighbor-fov-outline"
              type="line"
              paint={{
                "line-color": "#67e8f9",
                "line-width": 1.1,
                "line-dasharray": [2, 2],
              }}
            />
          </Source>
        ) : null}

        {showPossibleRoutes
          ? routeGeoJsonList.map((route) => (
              <Source key={route.id} id={route.id} type="geojson" data={route.data as GeoJSON.FeatureCollection}>
                <Layer
                  id={`${route.id}-line`}
                  type="line"
                  paint={{
                    "line-color": route.color,
                    "line-width": 4,
                    "line-opacity": 0.95,
                  }}
                />
              </Source>
            ))
          : null}

        {showHome
          ? homePins.map((pin) => (
              <Marker key={pin.id} longitude={pin.coords[0]} latitude={pin.coords[1]}>
                <button
                  onMouseEnter={() =>
                    showFeature({
                      id: pin.id,
                      label: pin.label,
                      note: pin.note,
                      source: "Case Anchor",
                      coords: pin.coords,
                      url: "https://www.google.com/maps",
                    })
                  }
                  onMouseLeave={() => setSelected(null)}
                  className={`h-4 w-4 rounded-full ${pinStyle(pin.kind)} ring-4 ${ringFocusId === pin.id ? "animate-pulse" : ""}`}
                  aria-label={pin.label}
                />
              </Marker>
            ))
          : null}

        {showRing
          ? ringPins.map((pin) => (
              <Marker key={pin.id} longitude={pin.coords[0]} latitude={pin.coords[1]}>
                <button
                  onMouseEnter={() =>
                    showFeature({
                      id: pin.id,
                      label: pin.label,
                      note: pin.note,
                      source: "Ring Camera Node",
                      coords: pin.coords,
                      url: "https://www.google.com/maps",
                    })
                  }
                  onMouseLeave={() => setSelected(null)}
                  className={`h-4 w-4 rounded-full ${pinStyle(pin.kind)} ring-4`}
                  aria-label={pin.label}
                />
              </Marker>
            ))
          : null}

        {showTraffic
          ? trafficPins.map((pin) => (
              <Marker key={pin.id} longitude={pin.coords[0]} latitude={pin.coords[1]}>
                <button
                  onMouseEnter={() =>
                    showFeature({
                      id: pin.id,
                      label: pin.label,
                      note: pin.note,
                      source: "Traffic Camera",
                      coords: pin.coords,
                      url: pin.url,
                    })
                  }
                  onMouseLeave={() => setSelected(null)}
                  className="h-4 w-4 rounded-sm bg-amber-500 ring-4 ring-amber-500/35"
                  aria-label={pin.label}
                />
              </Marker>
            ))
          : null}

        {showVehicle
          ? vehiclePins.map((pin) => (
              <Marker key={pin.id} longitude={pin.coords[0]} latitude={pin.coords[1]}>
                <button
                  onMouseEnter={() =>
                    showFeature({
                      id: pin.id,
                      label: pin.label,
                      note: pin.note,
                      source: "Vehicle Descriptor",
                      coords: pin.coords,
                      url: pin.url,
                    })
                  }
                  onMouseLeave={() => setSelected(null)}
                  className="h-4 w-4 rounded-full border border-slate-800 bg-white ring-4 ring-slate-700/40"
                  aria-label={pin.label}
                />
              </Marker>
            ))
          : null}

        {showClues
          ? timelineSeed.map((event) => (
              <Marker key={event.id} longitude={event.coords[0]} latitude={event.coords[1]}>
                <button
                  onMouseEnter={() =>
                    showFeature({
                      id: event.id,
                      label: event.title,
                      note: event.details,
                      source: event.source,
                      confidence: event.confidence,
                      coords: event.coords,
                    })
                  }
                  onMouseLeave={() => setSelected(null)}
                  className="h-3 w-3 rounded-full bg-rose-500 ring-4 ring-rose-500/30"
                  aria-label={event.title}
                />
              </Marker>
            ))
          : null}

        {showVehicle && routePaths[0]?.coordinates?.length ? (
          <Marker
            longitude={routePaths[0].coordinates[carStep][0]}
            latitude={routePaths[0].coordinates[carStep][1]}
          >
            <div className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-900 ring-2 ring-slate-700/30">
              White Kia Soul
            </div>
          </Marker>
        ) : null}

        {selected ? (
          <Popup
            longitude={selected.coords[0]}
            latitude={selected.coords[1]}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            className="mission-popup"
          >
            <div className="w-[190px] rounded-md border border-border bg-card p-2 text-[11px] shadow-lg">
              <p className="truncate font-semibold">{selected.label}</p>
              <p className="truncate text-[10px] text-muted-foreground">{selected.source}</p>
              {selected.confidence ? (
                <p className="mt-1 text-[10px] text-muted-foreground">Confidence {selected.confidence}%</p>
              ) : null}
              {selected.url ? (
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-[10px] font-semibold text-primary hover:underline"
                >
                  Open source
                </a>
              ) : null}
            </div>
          </Popup>
        ) : null}
      </Map>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/18 via-transparent to-slate-950/30" />

      <aside className="absolute left-3 top-3 bottom-3 z-20 w-[min(18rem,calc(100%-1.5rem))] max-h-[calc(100%-1.5rem)] overflow-y-auto rounded-lg border-2 border-border bg-background p-3 text-xs shadow-xl">
        <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/80">Layer Controls</p>
        <p className="mt-1 text-sm font-semibold text-foreground">Turn map signals on/off</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 text-foreground"><input type="checkbox" checked={showHome} onChange={(e) => setShowHome(e.target.checked)} /> Home Pin</label>
          <label className="flex items-center gap-2 text-foreground"><input type="checkbox" checked={showRing} onChange={(e) => setShowRing(e.target.checked)} /> Ring Cameras (door + neighbor)</label>
          <label className="flex items-center gap-2 text-foreground"><input type="checkbox" checked={showTraffic} onChange={(e) => setShowTraffic(e.target.checked)} /> Ring / Camera Zones</label>
          <label className="flex items-center gap-2 text-foreground"><input type="checkbox" checked={showClues} onChange={(e) => setShowClues(e.target.checked)} /> Clue Points</label>
          <label className="flex items-center gap-2 text-foreground"><input type="checkbox" checked={showPossibleRoutes} onChange={(e) => setShowPossibleRoutes(e.target.checked)} /> Possible Routes (max 3)</label>
          <label className="flex items-center gap-2 text-foreground"><input type="checkbox" checked={showVehicle} onChange={(e) => setShowVehicle(e.target.checked)} /> White Kia Soul Pin</label>
          <label className="flex items-center gap-2 text-foreground"><input type="checkbox" checked={showCorridor} onChange={(e) => setShowCorridor(e.target.checked)} /> Broad Area</label>
          <label className="col-span-2 flex items-center gap-2 text-foreground"><input type="checkbox" checked={showFov} onChange={(e) => setShowFov(e.target.checked)} /> Ring Camera Field-of-View</label>
        </div>
        <details className="mt-3 rounded-md border border-border bg-card p-2" open>
          <summary className="cursor-pointer text-[10px] uppercase tracking-[0.16em] text-foreground/80">Public Camera Links</summary>
          <div className="mt-2 space-y-1">
            {trafficPins.map((pin) => (
              <a
                key={pin.id}
                href={pin.url || "https://www.az511.com/"}
                target="_blank"
                rel="noreferrer"
                className="block truncate text-[11px] text-primary hover:underline"
              >
                {pin.label}
              </a>
            ))}
          </div>
        </details>
        <details className="mt-3 rounded-md border border-border bg-card p-2 text-[11px] text-muted-foreground">
          <summary className="cursor-pointer font-semibold text-foreground">Vehicle Path Notes</summary>
          <p className="mt-1">- Last known visual pin: "Vehicle of Interest: White Kia Soul".</p>
          <p>- Route endpoints are hypothesis exits, not confirmed stop locations.</p>
          <p>- Toggle clues + traffic cams to compare line-of-sight and exits.</p>
          <p className="mt-1 flex items-center gap-1.5"><img src="/media/camera-fov-badge.svg" alt="camera" className="h-3.5 w-3.5" /> Home Identifier: Nancy Home (anchor pin).</p>
          <p className="flex items-center gap-1.5"><img src="/media/camera-fov-badge.svg" alt="camera" className="h-3.5 w-3.5" /> Neighbor Identifier: Backway camera direction included.</p>
          <div className="mt-2 space-y-1">
            {routePaths.slice(0, 3).map((route) => (
              <p key={route.id} className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: route.color }} />
                {route.label}
              </p>
            ))}
          </div>
        </details>
        <details className="mt-3 rounded-md border border-border bg-card p-2 text-[11px] text-muted-foreground" open>
          <summary className="cursor-pointer font-semibold text-foreground">Playback Sync</summary>
          <p className="mt-1">Timeline and vehicle animation are synced from first event to now.</p>
          <p>
            Current time: {syncInfo ? new Date(syncInfo.timestamp).toLocaleString() : "waiting for timeline"}
          </p>
          <p>
            Progress: {syncInfo ? `${syncInfo.index + 1} / ${syncInfo.total}` : "--"}
          </p>
        </details>
      </aside>
    </div>
  );
}
