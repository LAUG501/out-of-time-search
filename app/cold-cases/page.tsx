import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const coldCases = [
  { title: "Maricopa County 2018", status: "Reopened", update: "New forensic review requested." },
  { title: "Yuma County 2016", status: "Awaiting Lead", update: "Volunteer geofence search active." },
  { title: "Pima County 2011", status: "Evidence Review", update: "Timeline rebuilt with archived media." },
];

export default function ColdCasesPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cold Case Network</p>
        <h1 className="text-3xl font-semibold tracking-tight">Past Cases with Active Alerts</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Subscribe for updates and help bring long-running cases back into public view.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coldCases.map((caseItem) => (
          <Card key={caseItem.title}>
            <CardHeader>
              <CardTitle>{caseItem.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-semibold">Status:</span> {caseItem.status}</p>
              <p className="text-muted-foreground">{caseItem.update}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
