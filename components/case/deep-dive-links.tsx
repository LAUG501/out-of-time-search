import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const deepDiveLinks = [
  {
    title: "Google Videos: Nancy Guthrie case",
    url: "https://www.google.com/search?tbm=vid&q=Nancy+Guthrie+case+update",
  },
  {
    title: "Google News: Nancy Guthrie latest",
    url: "https://news.google.com/search?q=Nancy%20Guthrie",
  },
  {
    title: "FOX 10 Phoenix search",
    url: "https://www.fox10phoenix.com/search?q=Nancy+Guthrie",
  },
  {
    title: "Google Videos: White Kia Soul Nancy case",
    url: "https://www.google.com/search?tbm=vid&q=white+Kia+Soul+Nancy+Guthrie",
  },
  {
    title: "Google Web: Tucson traffic cameras",
    url: "https://www.google.com/search?q=Tucson+traffic+camera+public+feed",
  },
];

export function DeepDiveLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deep Dive Search Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {deepDiveLinks.map((link) => (
          <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="block text-primary hover:underline">
            {link.title}
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
