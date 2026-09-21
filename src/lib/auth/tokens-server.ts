import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Configuration
const ACCESS_TOKEN_EXPIRES_IN = "15m"; // 15 minutes
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * Generates a new access token JWT
 * @param payload The payload to include in the JWT (id and role)
 * @returns The signed JWT token
 */
export async function generateAccessToken(payload: {
  id: string;
  role: string;
  isDemo?: boolean;
  demoSessionId?: string;
}): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(payload.isDemo ? "2h" : ACCESS_TOKEN_EXPIRES_IN)
    .sign(JWT_SECRET);
}

/**
 * Generates a cryptographically secure random refresh token
 * @returns A URL-safe random string suitable for use as a refresh token
 */
export function generateRefreshToken(): string {
  // Generate a random URL-safe string using Web Crypto API
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Hashes a refresh token using Web Crypto API SHA-256
 * This is compatible with Edge Runtime unlike Node.js crypto or bcrypt
 * @param token The refresh token to hash
 * @returns Promise resolving to the hex-encoded hash
 */
export async function hashToken(token: string): Promise<string> {
  // Encode the string as UTF-8
  const encoder = new TextEncoder();
  const data = encoder.encode(token);

  // Calculate SHA-256 hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verifies a refresh token by comparing the hash
 * @param token The plaintext refresh token
 * @param hashedToken The stored hash to compare against
 * @returns Promise resolving to true if the tokens match
 */
export async function verifyToken(
  token: string,
  hashedToken: string,
): Promise<boolean> {
  const tokenHash = await hashToken(token);
  // Use timing-safe comparison to prevent timing attacks
  if (tokenHash.length !== hashedToken.length) return false;

  let result = 0;
  for (let i = 0; i < tokenHash.length; i++) {
    result |= tokenHash.charCodeAt(i) ^ hashedToken.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Sets authentication cookies for access and refresh tokens
 * @param accessToken The JWT access token
 * @param refreshToken The refresh token
 * @param isDemo Whether this is a demo session
 * @param demoSessionId Optional demo session ID
 */
export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  isDemo?: boolean,
  demoSessionId?: string,
) {
  const cookieStore = await cookies();

  // Access token cookie (httpOnly)
  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: isDemo ? 60 * 60 * 2 : 60 * 15, // 2 hours for demo, 15m for regular
  });

  // Refresh token cookie
  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: isDemo ? 60 * 60 * 2 : 60 * 60 * 24 * 30, // 2 hours for demo, 30 days regular
  });

  if (isDemo && demoSessionId) {
    cookieStore.set("demoSessionId", demoSessionId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 2,
    });
  }
}

/**
 * Clears authentication cookies
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("demoSessionId");
}

/**
 * Stores a refresh token hash in the database associated with a user
 * @param userId The ID of the user
 * @param token The plaintext refresh token to store (will be hashed)
 */
export async function storeRefreshToken(
  userId: string,
  token: string,
): Promise<void> {
  const hashedToken = await hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  await prisma.refreshToken.create({
    data: {
      hashedToken,
      expiresAt,
      userId,
    },
  });
}

/**
 * Finds a valid refresh token in the database
 * @param token The plaintext refresh token to validate
 * @returns The token record with user if valid and not expired, null otherwise
 */
export async function findValidRefreshToken(token: string) {
  const hashedToken = await hashToken(token);

  return prisma.refreshToken.findFirst({
    where: {
      hashedToken,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });
}

/**
 * Revokes a refresh token by setting its expiration to the past
 * @param token The plaintext refresh token to revoke
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  const hashedToken = await hashToken(token);

  await prisma.refreshToken.updateMany({
    where: {
      hashedToken,
    },
    data: {
      expiresAt: new Date(0), // Set to epoch time
    },
  });
}

/**
 * Revokes all refresh tokens for a user
 * @param userId The ID of the user whose tokens should be revoked
 */
export async function revokeAllUserRefreshTokens(
  userId: string,
): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
    },
    data: {
      expiresAt: new Date(0), // Set to epoch time
    },
  });
}

/**
 * Rotates a refresh token: revokes the old one and creates a new one for the same user.
 * Returns the new plaintext refresh token.
 */
export async function rotateRefreshToken(
  oldToken: string,
  userId: string,
): Promise<string> {
  const oldHash = await hashToken(oldToken);

  // Revoke the old token
  await prisma.refreshToken.updateMany({
    where: {
      hashedToken: oldHash,
    },
    data: {
      expiresAt: new Date(0),
    },
  });

  // Generate and store new refresh token
  const newToken = generateRefreshToken();
  const newHash = await hashToken(newToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  await prisma.refreshToken.create({
    data: {
      hashedToken: newHash,
      expiresAt,
      userId,
    },
  });

  return newToken;
}
