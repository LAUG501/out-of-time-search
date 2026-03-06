import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSectionsRenderer } from "@/components/portal/page-sections-renderer";
import { getNationalCoverageStats } from "@/lib/national-cases";
import { getPortalLayoutBySlug } from "@/lib/portal-builder";

function stateLabel(value: boolean): string {
  return value ? "Configured" : "Missing";
}

function stateTone(value: boolean): string {
  return value ? "text-emerald-600" : "text-amber-600";
}

type BackendPageProps = {
  searchParams?: Promise<{
    setup?: string;
  }>;
};

export default async function BackendPage({ searchParams }: BackendPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const setupProvider = String(params?.setup ?? "").trim().toLowerCase();
  const setupHint = setupProvider
    ? `Finish ${setupProvider} setup by adding ${setupProvider.toUpperCase()}_CLIENT_ID and ${setupProvider.toUpperCase()}_CLIENT_SECRET in .env.local, then restart the server.`
    : "";
  const google = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const facebook = Boolean(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET);
  const x = Boolean(process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET);
  const authSecret = Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET);
  const surreal = Boolean(process.env.SURREAL_URL && process.env.SURREAL_USER && process.env.SURREAL_PASS);
  const ollama = Boolean(process.env.OLLAMA_API_URL && process.env.OLLAMA_MODEL);
  const [managedLayout, coverage] = await Promise.all([
    getPortalLayoutBySlug("backend"),
    getNationalCoverageStats(),
  ]);

  const serviceCards = [
    { name: "Auth Core", healthy: authSecret && (google || facebook || x), detail: "Session, OAuth, and role checks" },
    { name: "Case Data Store", healthy: surreal, detail: "Primary case data persistence" },
    { name: "AI Service", healthy: ollama, detail: "Assistant and drafting automation" },
    { name: "Forum + Moderation", healthy: true, detail: "Community collaboration and reports" },
  ];

  const connectors = [
    { name: "Google OAuth", configured: google, envKeys: "GOOGLE_CLIENT_ID/SECRET" },
    { name: "Facebook OAuth", configured: facebook, envKeys: "FACEBOOK_CLIENT_ID/SECRET" },
    { name: "X OAuth", configured: x, envKeys: "X_CLIENT_ID/SECRET" },
    { name: "SurrealDB", configured: surreal, envKeys: "SURREAL_URL/USER/PASS" },
    { name: "Ollama", configured: ollama, envKeys: "OLLAMA_API_URL/MODEL" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Backend Operations Center</CardTitle>
          <CardDescription>Professional SaaS control panel for service status and connector readiness.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {setupHint ? <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">{setupHint}</p> : null}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {serviceCards.map((service) => (
              <div key={service.name} className="rounded border border-border p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{service.name}</p>
                <p className={`mt-1 text-base font-semibold ${stateTone(service.healthy)}`}>
                  {service.healthy ? "Healthy" : "Needs Setup"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{service.detail}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <p className="rounded border border-border p-2"><span className="font-semibold">National cases:</span> {coverage.totalCases}</p>
            <p className="rounded border border-border p-2"><span className="font-semibold">States covered:</span> {coverage.statesCovered}</p>
            <p className="rounded border border-border p-2"><span className="font-semibold">Active cases:</span> {coverage.activeCases}</p>
            <p className="rounded border border-border p-2"><span className="font-semibold">Cold cases:</span> {coverage.coldCases}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations and Connector Registry</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm md:grid-cols-2">
          {connectors.map((connector) => (
            <div key={connector.name} className="rounded border border-border p-3">
              <p className="font-medium">{connector.name}</p>
              <p className={stateTone(connector.configured)}>
                {connector.configured ? "Configured" : "Missing Keys"}
              </p>
              <p className="text-xs text-muted-foreground">{connector.envKeys}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operational Endpoints</CardTitle>
          <CardDescription>Quick links for backend verification and ongoing service checks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>- Auth portal: <a className="text-primary hover:underline" href="/login">/login</a></p>
          <p>- Backend JSON status: <a className="text-primary hover:underline" href="/api/backend/status">/api/backend/status</a></p>
          <p>- National cases API: <a className="text-primary hover:underline" href="/api/cases">/api/cases</a></p>
          <p>- News intake API: <a className="text-primary hover:underline" href="/api/news">/api/news</a></p>
          <p>- Forum threads API: <a className="text-primary hover:underline" href="/api/forum/threads">/api/forum/threads</a></p>
        </CardContent>
      </Card>

      <PageSectionsRenderer sections={managedLayout?.sections || []} />
    </div>
  );
}
