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
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validation/schemas";

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
