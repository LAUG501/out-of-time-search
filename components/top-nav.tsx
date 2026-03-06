"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard", primary: true },
  { href: "/cases", label: "Cases", primary: true },
  { href: "/forum", label: "Forum", primary: true },
  { href: "/mission-control", label: "Mission Control", primary: true },
  { href: "/build-your-case", label: "Build a Case", primary: false },
  { href: "/blog", label: "Blog", primary: false },
  { href: "/credits", label: "Credits", primary: false },
  { href: "/contribute", label: "Contribute", primary: false },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 text-sm md:flex" aria-label="Primary">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-2.5 py-1.5 transition-colors ${
              active
                ? "bg-primary/15 text-foreground"
                : link.primary
                  ? "text-foreground/85 hover:bg-muted hover:text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
