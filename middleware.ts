import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = ["/contribute", "/settings", "/admin", "/backend"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some((route) => path === route || path.startsWith(`${route}/`));
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET });
  if (!token) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  if (
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path === "/settings" ||
    path.startsWith("/settings/") ||
    path === "/backend" ||
    path.startsWith("/backend/")
  ) {
    const role = token.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/mission-control", request.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/contribute/:path*", "/settings/:path*", "/admin/:path*", "/backend/:path*"],
};
