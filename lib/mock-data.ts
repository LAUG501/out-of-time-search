export type FeedEvent = {
  id: string;
  timestamp: string;
  title: string;
  type: "tip" | "news" | "video" | "sighting";
  confidence: number;
  source: string;
  details: string;
  coords: [number, number];
};

export type MapPin = {
  id: string;
  label: string;
  kind: "home" | "ring" | "traffic" | "vehicle" | "clue";
  coords: [number, number];
  note: string;
  url?: string;
};

export type SourceCredit = {
  name: string;
  type: string;
  description: string;
  url?: string;
};

export const featuredCases = [
  {
    id: "nancy-guthrie",
    name: "Nancy Guthrie",
    state: "Arizona",
    missingDays: 32,
    reward: "$1,202,000",
    status: "Active Search",
    summary: "Investigators are reviewing new tips, local coverage, and neighborhood footage.",
  },
  {
    id: "cold-case-southwest-2018",
    name: "Southwest Unresolved Case",
    state: "Arizona",
    missingDays: 2740,
    reward: "$50,000",
    status: "Cold Case",
    summary: "New witness outreach campaign launched this week.",
  },
  {
    id: "phoenix-jane-doe",
    name: "Phoenix Jane Doe",
    state: "Arizona",
    missingDays: 420,
    reward: "$25,000",
    status: "Open",
    summary: "Forensic timeline updated with additional location evidence.",
  },
];

export const timelineSeed: FeedEvent[] = [
  {
    id: "evt-1",
    timestamp: "Jan 31, 9:30 PM",
    title: "Last known family contact",
    type: "video",
    confidence: 95,
    source: "Public case timeline",
    details: "Family reported last direct contact around this time.",
    coords: [-110.94078, 32.31165],
  },
  {
    id: "evt-2",
    timestamp: "Feb 1, 12:00 PM",
    title: "Missing report filed",
    type: "news",
    confidence: 95,
    source: "Public news reports",
    details: "Case is publicly reported as missing from Tucson/Pima County area.",
    coords: [-110.93985, 32.30942],
  },
  {
    id: "evt-3",
    timestamp: "Feb 2 onward",
    title: "Multi-agency search activity",
    type: "sighting",
    confidence: 82,
    source: "Public statements",
    details: "Search operations include law enforcement and support teams.",
    coords: [-110.93874, 32.30791],
  },
  {
    id: "evt-4",
    timestamp: "Recent",
    title: "Vehicle route discussion in media",
    type: "tip",
    confidence: 62,
    source: "Rosario AI Labs copilot",
    details: "Public outlet reports discuss a possible route and vehicle context.",
    coords: [-110.93712, 32.30428],
  },
];

export const anchorPins: MapPin[] = [
  {
    id: "home-pin",
    label: "Nancy Home (Identifier)",
    kind: "home",
    coords: [-110.9405426, 32.3120044],
    note: "Residence anchor from provided public VirtualGlobetrotting source.",
  },
  {
    id: "ring-back-door",
    label: "Back Door Ring Camera",
    kind: "ring",
    coords: [-110.94078, 32.31165],
    note: "Back-door camera orientation and capture area.",
  },
  {
    id: "ring-neighbor-backway",
    label: "Neighbor Backway Camera",
    kind: "ring",
    coords: [-110.94012, 32.3112],
    note: "Neighbor-facing backway camera context from neighborhood direction.",
  },
  {
    id: "traffic-cam-1",
    label: "Ring / Camera Network Zone 1",
    kind: "traffic",
    coords: [-110.93985, 32.30942],
    note: "Approximate camera visibility network zone; may include Ring and nearby public camera context.",
    url: "https://www.az511.com/",
  },
  {
    id: "traffic-cam-2",
    label: "Ring / Camera Network Zone 2",
    kind: "traffic",
    coords: [-110.93874, 32.30791],
    note: "Approximate camera visibility network zone; may include Ring and nearby public camera context.",
    url: "https://www.az511.com/",
  },
  {
    id: "traffic-cam-3",
    label: "Ring / Camera Network Zone 3",
    kind: "traffic",
    coords: [-110.93712, 32.30428],
    note: "Approximate camera visibility network zone; may include Ring and nearby public camera context.",
    url: "https://www.az511.com/",
  },
  {
    id: "vehicle-of-interest",
    label: "Vehicle of Interest: White Kia Soul",
    kind: "vehicle",
    coords: [-110.93822, 32.30684],
    note: "Vehicle type noted in public reporting context for this case.",
    url: "https://www.fox10phoenix.com/search?q=Nancy+Guthrie",
  },
];

export const routeCoordinates: [number, number][] = [
  [-110.94078, 32.31165],
  [-110.93985, 32.30942],
  [-110.93874, 32.30791],
  [-110.93712, 32.30428],
];

export const corridorPolygon: [number, number][] = [
  [-110.9432, 32.3134],
  [-110.9348, 32.3134],
  [-110.9348, 32.3026],
  [-110.9432, 32.3026],
  [-110.9432, 32.3134],
];

export const ringCameraFovPolygon: [number, number][] = [
  [-110.94078, 32.31165],
  [-110.93918, 32.31218],
  [-110.93992, 32.31066],
  [-110.94078, 32.31165],
];

export const ringNeighborFovPolygon: [number, number][] = [
  [-110.94012, 32.3112],
  [-110.93895, 32.31178],
  [-110.93942, 32.30998],
  [-110.94012, 32.3112],
];

export const sourceCredits: SourceCredit[] = [
  {
    name: "NamUs",
    type: "Government Data",
    description:
      "National Missing and Unidentified Persons System run by the National Institute of Justice for public case data.",
    url: "https://namus.nij.ojp.gov/",
  },
  {
    name: "NCMEC",
    type: "Nonprofit",
    description:
      "The National Center for Missing & Exploited Children collects reports, distributes alerts, and supports families.",
    url: "https://www.missingkids.org/",
  },
  {
    name: "FOX 10 Phoenix",
    type: "Local News",
    description:
      "Local Phoenix ABC-owned station that publishes daily updates, search developments, and community tips.",
    url: "https://www.fox10phoenix.com/",
  },
  {
    name: "12News Arizona",
    type: "Local News",
    description:
      "NBC affiliate in Phoenix/Tucson with live coverage, reporter embeds, and searchable story archives.",
    url: "https://www.12news.com/",
  },
  {
    name: "ABC15 Arizona",
    type: "Local News",
    description:
      "ABC-owned station compiling community updates, viewer tips, and investigative timelines for Arizona cases.",
    url: "https://www.abc15.com/",
  },
  {
    name: "AZ Family",
    type: "Local News",
    description:
      "Scripps-owned local news grouping (KPHO/KTVK/KTVK) covering breaking stories across greater Phoenix.",
    url: "https://www.azfamily.com/",
  },
  {
    name: "AZCentral / Arizona Republic",
    type: "Regional News",
    description:
      "Gannett’s statewide outlet for in-depth state politics, crime reporting, and missing-persons investigations.",
    url: "https://www.azcentral.com/",
  },
  {
    name: "KGUN9",
    type: "Local News",
    description:
      "Tucson-based ABC affiliate offering southern Arizona coverage that supplements metro Phoenix feeds.",
    url: "https://www.kgun9.com/",
  },
  {
    name: "YouTube Public Uploads",
    type: "Video Platform",
    description:
      "Crowdsourced videos and livestreams that capture neighborhood context, interviews, and witness clips.",
    url: "https://www.youtube.com/",
  },
  {
    name: "X Public Posts",
    type: "Social Stream",
    description:
      "X (formerly Twitter) posts from family, volunteers, and local journalists resurfacing developments in real time.",
    url: "https://x.com/",
  },
  {
    name: "Independent Journalists",
    type: "OSINT Community",
    description:
      "Volunteer open-source intelligence investigators who validate sightings and annotate public clues.",
  },
];

export const buildAnalytics = {
  forumAndDashboardCustomLines: 1271,
  newForumAndModerationApiRoutes: 5,
  securedAdminRoutes: 4,
  newPortalPages: 3,
};

export const platformAttribution = [
  {
    name: "OpenCode",
    role: "Primary coding copilot used to ship and maintain portal features.",
    link: "https://opencode.ai/",
  },
  {
    name: "OpenAI",
    role: "Model intelligence for secure assistant workflows and language reasoning.",
    link: "https://openai.com/",
  },
  {
    name: "Ollama",
    role: "Open model runtime used for self-hosted/local AI operations.",
    link: "https://ollama.com/",
  },
  {
    name: "Next.js",
    role: "Core application framework powering routing, APIs, and SSR.",
    link: "https://nextjs.org/",
  },
  {
    name: "Bun",
    role: "Fast open-source runtime and package manager for this portal.",
    link: "https://bun.sh/",
  },
];

export const portalUsePolicy = [
  "This assistant is designed only for Out of Time Search portal operations.",
  "Use is limited to case workflow, source verification, and portal management tasks.",
  "General homework or unrelated personal use is outside platform scope.",
  "All critical actions should remain evidence-based and aligned with official agency guidance.",
];

export const forumGuideSections = [
  {
    title: "Welcome",
    points: [
      "This forum is for case collaboration, portal support, and source-backed discussion.",
      "Stay kind, specific, and evidence-first when posting updates or concerns.",
    ],
  },
  {
    title: "How to Use This Forum",
    points: [
      "Use clear thread titles that name the topic, source, or case.",
      "Add tags and optional case slug so investigators can filter quickly.",
      "Use replies for corrections, timeline notes, and next-step recommendations.",
    ],
  },
  {
    title: "Forum Rules",
    points: [
      "No doxxing, harassment, or unverified accusations.",
      "Do not post private data unless it is already public and case-relevant.",
      "Mark uncertain information as unverified until confirmed by trusted sources.",
      "Report harmful or misleading content for moderation review.",
    ],
  },
  {
    title: "What We Need",
    points: [
      "Source links with timestamps and location context.",
      "Timeline corrections that improve accuracy and reduce noise.",
      "Local camera, route, or witness context tied to public evidence.",
      "Volunteer support for validation, translation, and regional monitoring.",
    ],
  },
];

export const portalLatestNews = [
  {
    date: "2026-03-04",
    title: "Forum + Dashboard Launch",
    details: "Released portal forum, role-aware dashboard, reporting flow, and moderation queue.",
  },
  {
    date: "2026-03-04",
    title: "Security Hardening",
    details: "Added server-side admin checks for content, pages, uploads, and moderation routes.",
  },
  {
    date: "2026-03-04",
    title: "Credits and Transparency",
    details: "Published open-source/AI attribution and build analytics in the Credits area.",
  },
];
