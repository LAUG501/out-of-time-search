export type PortalRoute = {
  path: string;
  title: string;
  description: string;
};

export const portalRoutes: PortalRoute[] = [
  {
    path: "/",
    title: "Home",
    description: "Top stories, live status, and fast case entry points.",
  },
  {
    path: "/dashboard",
    title: "Dashboard",
    description: "Role-aware operations dashboard for users, contributors, and admins.",
  },
  {
    path: "/forum",
    title: "Forum",
    description: "Community discussions linked to cases, sources, and investigative workflow.",
  },
  {
    path: "/mission-control",
    title: "Mission Control",
    description: "4D map playback with minute-by-minute intel timeline.",
  },
  {
    path: "/cases",
    title: "National Cases",
    description: "Unified 50-state missing-person case index with follow actions.",
  },
  {
    path: "/arizona-cases",
    title: "Arizona Cases",
    description: "Public missing photos and related case media in Arizona.",
  },
  {
    path: "/cases/nancy-guthrie",
    title: "Case Detail",
    description: "Case profile, timeline, reward flow, and clue intake.",
  },
  {
    path: "/cold-cases",
    title: "Cold Cases",
    description: "Archived and long-duration cases with fresh alerts.",
  },
  {
    path: "/contribute",
    title: "Contribute",
    description: "Volunteer and public contribution playbook.",
  },
  {
    path: "/build-your-case",
    title: "Build Your Case",
    description: "Step-by-step investigation workflow guide.",
  },
  {
    path: "/reward-workflow",
    title: "Reward Workflow",
    description: "How reward tips are submitted, validated, and escalated.",
  },
  {
    path: "/did-you-know",
    title: "Did You Know",
    description: "Critical investigation and safety tips.",
  },
  {
    path: "/agency-contacts",
    title: "Agency Contacts",
    description: "Direct official contacts for lead submission.",
  },
  {
    path: "/credits",
    title: "Credits",
    description: "News, community, and official source attribution.",
  },
  {
    path: "/thank-you",
    title: "Thank You",
    description: "Promotional mission page recognizing contributors and platform partners.",
  },
  {
    path: "/how-to-use",
    title: "How to Use",
    description: "Operator guide for families, volunteers, and agencies.",
  },
  {
    path: "/site-map",
    title: "Site Map",
    description: "Complete portal navigation index.",
  },
  {
    path: "/login",
    title: "Auth Portal",
    description: "Sign in with Google, X, Facebook, or local reviewer mode.",
  },
  {
    path: "/register",
    title: "Register",
    description: "Identity and trust onboarding for verified contributors.",
  },
];
