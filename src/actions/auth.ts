"use server";

import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  revokeRefreshToken,
  clearAuthCookies,
} from "@/lib/auth/tokens-server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validation/schemas";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export type LoginResult =
  | {
      success: true;
      accessToken: string;
      refreshToken: string;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

export async function login(formData: FormData): Promise<LoginResult> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Invalid credentials",
      fieldErrors: validatedFields.error.issues.reduce<Record<string, string>>(
        (acc, issue) => {
          const path = issue.path[0] ?? "unknown";
          return { ...acc, [path]: issue.message };
        },
        {},
      ),
    };
  }

  const { email, password } = validatedFields.data;

  // --- Rate limiting: 5 intentos por 10 minutos por email ---
  if (rateLimit) {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? headersList.get("x-real-ip")
      ?? "unknown";
    const { success, remaining } = await rateLimit.login.limit(
      `ip:${ip}`,
    );
    if (!success) {
      logger.warn("Rate limit alcanzado en login", {
        ip,
        email: email.toLowerCase(),
      });
      return {
        success: false,
        error: "Demasiados intentos. Intenta de nuevo en 10 minutos.",
      };
    }
    logger.info("Login attempt", {
      ip,
      email: email.toLowerCase(),
      remaining,
    });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: false, error: "Invalid credentials" };
  }

  const isPasswordValid = await compare(password, user.password);
  if (!isPasswordValid) {
    return { success: false, error: "Invalid credentials" };
  }

  // ---------- generar tokens ----------
  const accessTokenPayload = { id: user.id, role: user.role };
  const accessToken = await generateAccessToken(accessTokenPayload);
  const refreshToken = generateRefreshToken();

  // ---------- guardar refresh token ----------
  await storeRefreshToken(user.id, refreshToken);

  // ---------- devolver tokens ----------
  return {
    success: true,
    accessToken,
    refreshToken,
  };
}

// Refresh token action
export async function refresh() {
  // In actions, we don't have direct access to cookies
  // This will be handled by the API route instead
  // This function is kept for potential direct use
  throw new Error("Use the API route for token refresh");
}

// Logout action
export async function logout() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  // Revoke refresh token from database if it exists
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  // Clear cookies
  await clearAuthCookies();

  // Redirect to login page
  redirect("/login");
}
