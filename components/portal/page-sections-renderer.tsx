import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PortalSection } from "@/lib/portal-builder";

type PageSectionsRendererProps = {
  sections: PortalSection[];
};

export function PageSectionsRenderer({ sections }: PageSectionsRendererProps) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        if (section.type === "hero") {
          return (
            <section key={section.id} className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Managed Section</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{section.title}</h2>
              {section.subtitle ? <p className="mt-2 text-sm text-muted-foreground">{section.subtitle}</p> : null}
            </section>
          );
        }

        if (section.type === "checklist") {
          return (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {section.subtitle ? <p>{section.subtitle}</p> : null}
                {(section.items || []).map((item) => (
                  <p key={item}>- {item}</p>
                ))}
              </CardContent>
            </Card>
          );
        }

        if (section.type === "stats") {
          return (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {(section.stats || []).map((stat) => (
                  <div key={`${section.id}-${stat.label}`} className="rounded border border-border p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-xl font-semibold text-foreground">{stat.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        }

        if (section.type === "links") {
          return (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {section.subtitle ? <p className="text-muted-foreground">{section.subtitle}</p> : null}
                <div className="flex flex-wrap gap-2">
                  {(section.links || []).map((link) => (
                    <Link
                      key={`${section.id}-${link.href}`}
                      href={link.href}
                      className="rounded border border-border px-3 py-1.5 text-sm font-medium text-primary hover:bg-muted"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        }

        return (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {section.subtitle ? <p>{section.subtitle}</p> : null}
              {section.content ? <p>{section.content}</p> : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
