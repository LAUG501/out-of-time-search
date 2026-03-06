import type { Metadata } from "next";

import "@/app/globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Out of Time Search",
  description: "Mission-control portal for missing persons intelligence and community support.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SiteHeader />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
