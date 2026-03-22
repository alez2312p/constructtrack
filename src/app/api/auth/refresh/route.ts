import { NextResponse } from "next/server";
import {
  generateAccessToken,
  findValidRefreshToken,
  rotateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/auth/tokens-server";
import { verifyAccessToken } from "@/lib/auth/tokens-edge";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;
    const callbackUrl = request.headers.get("referer") || "/dashboard";

    // If we still have a valid access token, we can just respond success
    if (accessToken) {
      const payload = await verifyAccessToken(accessToken);
      if (payload) {
        // Access token still valid, no need to rotate
        return NextResponse.json({
          success: true,
          message: "Access token still valid",
        });
      }
    }

    // Need a refresh token to proceed
    if (!refreshToken) {
      await clearAuthCookies();
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Validate refresh token exists in DB and is not expired/revoked
    const tokenRecord = await findValidRefreshToken(refreshToken);
    if (!tokenRecord) {
      await clearAuthCookies();
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // --- ROTATION ---
    const newAccessTokenPayload = {
      id: tokenRecord.user.id,
      role: tokenRecord.user.role,
    };
    const newAccessToken = await generateAccessToken(newAccessTokenPayload);
    const newRefreshToken = await rotateRefreshToken(
      refreshToken,
      tokenRecord.user.id,
    );

    // Set new cookies (access + new refresh)
    await setAuthCookies(newAccessToken, newRefreshToken);

    // Redirect back to original URL
    return NextResponse.redirect(new URL(callbackUrl, request.url));
  } catch (err) {
    console.error("[Refresh endpoint] error:", err);
    await clearAuthCookies();
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
