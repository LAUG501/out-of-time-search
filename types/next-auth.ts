import "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: "admin" | "contributor";
    provider?: string;
    providerAccountId?: string;
    profileHandle?: string | null;
    trustTier?: string;
  }

  interface Session {
    user: {
      id?: string;
      role?: "admin" | "contributor";
      provider?: string;
      providerAccountId?: string;
      profileHandle?: string | null;
      trustTier?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export {};
