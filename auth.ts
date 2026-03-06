import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
import X from "next-auth/providers/twitter";

import { verifyUser } from "@/lib/user-store";

function isAdminEmail(email: string | undefined): boolean {
  if (!email) {
    return false;
  }
  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET) {
  providers.push(
    X({
      clientId: process.env.X_CLIENT_ID,
      clientSecret: process.env.X_CLIENT_SECRET,
    })
  );
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    })
  );
}

providers.push(
  Credentials({
    name: "Email and Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (credentials) => {
      const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
      const password = typeof credentials?.password === "string" ? credentials.password : "";
      if (!email || !password) {
        return null;
      }
      return verifyUser(email, password);
    },
  })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account) {
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
      }
      if (user) {
        const safeUser = user as Record<string, unknown>;
        token.role = (safeUser.role as string | undefined) ?? "contributor";
        token.email = (safeUser.email as string | undefined) ?? token.email;
      }
      if (!token.role || token.role === "contributor") {
        token.role = isAdminEmail(token.email as string | undefined) ? "admin" : "contributor";
      }
      if (profile) {
        const safeProfile = profile as Record<string, unknown>;
        token.profileHandle =
          (safeProfile.preferred_username as string | undefined) ??
          (safeProfile.username as string | undefined) ??
          null;
      }
      token.trustTier = token.provider === "credentials" ? "local" : "oauth";
      return token;
    },
    async session({ session, token }) {
      const mutableSession = session as typeof session & { user: Record<string, unknown> };
      const role = token.role === "admin" ? "admin" : "contributor";
      mutableSession.user = {
        ...mutableSession.user,
        email: (token.email as string | undefined) ?? mutableSession.user.email,
        provider: token.provider as string | undefined,
        providerAccountId: token.providerAccountId as string | undefined,
        profileHandle: token.profileHandle as string | null | undefined,
        trustTier: token.trustTier as string | undefined,
        role,
      };
      return mutableSession;
    },
  },
  trustHost: true,
});
