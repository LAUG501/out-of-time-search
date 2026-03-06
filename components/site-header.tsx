import Link from "next/link";

import { auth } from "@/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { TopNav } from "@/components/top-nav";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await auth();
  const isSignedIn = Boolean(session?.user);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-[0.2em]">
          OUT OF TIME SEARCH
        </Link>
        <TopNav />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isSignedIn ? (
            <UserMenu
              name={session?.user?.name}
              email={session?.user?.email}
              role={session?.user?.role}
            />
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/register">Register</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
