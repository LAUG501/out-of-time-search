import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const contacts = [
  {
    agency: "FBI Tip Portal",
    url: "https://tips.fbi.gov",
    phone: "1-800-CALL-FBI (1-800-225-5324)",
    note: "Official federal tip intake",
  },
  {
    agency: "FBI Nancy Guthrie Case Page",
    url: "https://www.fbi.gov/wanted/kidnap/nancy-guthrie",
    phone: "Use FBI tip portal",
    note: "Case-specific federal page",
  },
  {
    agency: "Pima County Sheriff Contact",
    url: "https://pimasheriff.org/about-us/contact-us",
    phone: "520-351-4900",
    note: "Primary local contact route",
  },
  {
    agency: "Tucson Police Missing Person Info",
    url: "https://www.tucsonaz.gov/Departments/Police/Police-Services/Report-a-Missing-Person",
    phone: "520-791-2677",
    note: "Local missing-person process",
  },
  {
    agency: "Arizona DPS Contact",
    url: "https://www.azdps.gov/contact-0",
    phone: "602-223-2000",
    note: "State-level law-enforcement contact",
  },
  {
    agency: "88-CRIME Pima County",
    url: "https://88crime.org",
    phone: "520-882-7463",
    note: "Anonymous tip route",
  },
  {
    agency: "Silent Witness Arizona",
    url: "https://silentwitness.org",
    phone: "480-948-6377",
    note: "Anonymous statewide tip channel",
  },
  {
    agency: "Texas Rangers (Status)",
    url: "https://www.dps.texas.gov/section/texas-rangers",
    phone: "N/A for this Arizona case",
    note: "No confirmed public evidence of active Texas Rangers role in this case at this time.",
  },
];

export default function AgencyContactsPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Official Contacts</p>
        <h1 className="text-3xl font-semibold tracking-tight">Lead Agency and Investigator Contact Routes</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Direct official channels for lead submission and escalation.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {contacts.map((entry) => (
          <Card key={entry.agency}>
            <CardHeader>
              <CardTitle>{entry.agency}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-semibold">URL:</span> <a href={entry.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{entry.url}</a></p>
              <p><span className="font-semibold">Phone:</span> {entry.phone}</p>
              <p>{entry.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
