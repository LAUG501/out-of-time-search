"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { portalRoutes } from "@/lib/routes";

export function NavDropdown() {
  const pathname = usePathname();
  const primary = portalRoutes.filter((route) =>
    [
      "/cases",
      "/mission-control",
      "/arizona-cases",
      "/cold-cases",
      "/how-to-use",
      "/build-your-case",
      "/reward-workflow",
      "/did-you-know",
      "/agency-contacts",
      "/site-map",
      "/register",
      "/login",
    ].includes(route.path)
  );

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:text-foreground">
        Portal
        <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 top-9 z-50 w-[34rem] rounded-lg border border-border bg-card p-2 shadow-lg">
        <div className="grid grid-cols-2 gap-1">
        {primary.map((route) => (
          <Link
            key={route.path}
            href={route.path}
            className={`block rounded-md px-2.5 py-1.5 text-sm hover:bg-muted ${pathname === route.path || pathname.startsWith(`${route.path}/`) ? "bg-muted" : ""}`}
            aria-current={pathname === route.path ? "page" : undefined}
          >
            <p className="font-medium">{route.title}</p>
            <p className="truncate text-xs text-muted-foreground">{route.description}</p>
          </Link>
        ))}
        </div>
      </div>
    </details>
  );
}
