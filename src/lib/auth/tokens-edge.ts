import { jwtVerify } from "jose";

// Configuration
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export interface TokenPayload {
  id: string;
  role: string;
  isDemo?: boolean;
  demoSessionId?: string;
}

/**
 * Verifies an access token JWT and returns the payload if valid.
 * This function is safe to use in Edge Runtime as it only depends on jose.
 * @param token The JWT token to verify
 * @returns The token payload if valid, null otherwise
 */
export async function verifyAccessToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Ensure the payload has the expected properties
    if (typeof payload.id === "string" && typeof payload.role === "string") {
      return {
        id: payload.id,
        role: payload.role,
        isDemo: Boolean(payload.isDemo),
        demoSessionId: typeof payload.demoSessionId === "string" ? payload.demoSessionId : undefined,
      };
    }
    return null;
  } catch {
    // Token is invalid (expired, malformed, etc.)
    return null;
  }
}
