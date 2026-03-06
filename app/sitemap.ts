import type { MetadataRoute } from "next";

import { portalRoutes } from "@/lib/routes";

const base = "http://localhost:5050";

export default function sitemap(): MetadataRoute.Sitemap {
  return portalRoutes.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: route.path === "/" ? 1 : 0.8,
  }));
}
