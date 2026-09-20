import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/tokens-edge";

// Define protected routes
const protectedRoutes = [
  "/dashboard",
  "/inventory",
  "/movements",
  "/categories",
  "/locations",
  "/settings",
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
        "Access-Control-Allow-Headers":
          "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Idempotency-Key",
      },
    });
  }

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get tokens from cookies
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // If we have a valid access token, allow the request
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload) {
      return NextResponse.next();
    }
  }

  // If no valid access token but we have a refresh token, redirect to refresh endpoint
  if (refreshToken) {
    const callbackUrl = encodeURIComponent(path);
    const refreshUrl = new URL(
      `/api/auth/refresh?callbackUrl=${callbackUrl}`,
      request.url,
    );
    return NextResponse.redirect(refreshUrl);
  }

  // No tokens at all, redirect to login
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", path);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/inventory/:path*",
    "/movements/:path*",
    "/categories/:path*",
    "/locations/:path*",
    "/settings/:path*",
  ],
};
