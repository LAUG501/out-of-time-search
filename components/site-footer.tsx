export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-border/80 bg-background/90">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between">
        <p>MAXX-R1 Mission Portal</p>
        <div className="flex flex-wrap items-center gap-3">
          <a href="/how-to-use" className="hover:text-foreground">Usage Policy</a>
          <a href="/credits" className="hover:text-foreground">Sources</a>
          <a href="/agency-contacts" className="hover:text-foreground">Official Contacts</a>
        </div>
        <p>Copyright {year} Rosario AI Labs. All rights reserved.</p>
      </div>
    </footer>
  );
}
