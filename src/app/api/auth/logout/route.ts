import { NextResponse } from "next/server";
import { clearAuthCookies, revokeRefreshToken } from "@/lib/auth/tokens-server";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    // Rate limiting por IP
    if (rateLimit) {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        "unknown";
      const { success } = await rateLimit.general.limit(`logout:${ip}`);
      if (!success) {
        logger.warn("Rate limit API alcanzado en logout", { ip });
        return NextResponse.json(
          { error: "Demasiadas solicitudes." },
          { status: 429 },
        );
      }
    }
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    // Revoke refresh token from database if it exists
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    // Clear cookies
    await clearAuthCookies();

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
