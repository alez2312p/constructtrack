import { NextResponse } from "next/server";
import { clearAuthCookies, revokeRefreshToken } from "@/lib/auth/tokens-server";
import { cookies } from "next/headers";

export async function POST() {
  try {
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
