import Link from "next/link";

import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";

type UserMenuProps = {
  name?: string | null;
  email?: string | null;
  role?: string;
};

function initialsFromName(value: string): string {
  const parts = value.trim().split(/\s+/).slice(0, 2);
  if (parts.length === 0) {
    return "U";
  }
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

export function UserMenu({ name, email, role }: UserMenuProps) {
  const displayName = name || email || "Contributor";
  const initials = initialsFromName(displayName);
  const isAdmin = role === "admin";

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 hover:bg-muted">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
          {initials}
        </span>
        <span className="hidden max-w-32 truncate text-xs text-muted-foreground sm:inline">{displayName}</span>
      </summary>

      <div className="absolute right-0 top-11 z-50 w-64 rounded-lg border border-border bg-card p-2 shadow-lg">
        <div className="mb-2 border-b border-border pb-2">
          <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{email || "No email"}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{role || "contributor"}</p>
        </div>

        <div className="space-y-1 text-sm">
          <Link href="/dashboard" className="block rounded-md px-2 py-1.5 hover:bg-muted">
            Dashboard
          </Link>
          <Link href="/forum" className="block rounded-md px-2 py-1.5 hover:bg-muted">
            Forum
          </Link>
          <Link href="/cases" className="block rounded-md px-2 py-1.5 hover:bg-muted">
            National Cases
          </Link>
          <Link href="/mission-control" className="block rounded-md px-2 py-1.5 hover:bg-muted">
            Mission Control
          </Link>
          {isAdmin ? (
            <>
              <Link href="/admin" className="block rounded-md px-2 py-1.5 hover:bg-muted">
                Admin Studio
              </Link>
              <Link href="/settings" className="block rounded-md px-2 py-1.5 hover:bg-muted">
                Content Settings
              </Link>
              <Link href="/backend" className="block rounded-md px-2 py-1.5 hover:bg-muted">
                Backend Ops
              </Link>
            </>
          ) : null}
        </div>

        <form
          className="mt-2"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button variant="outline" size="sm" className="w-full" type="submit">
            Sign out
          </Button>
        </form>
      </div>
    </details>
  );
}
