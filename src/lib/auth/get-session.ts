import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/tokens-edge";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  const payload = await verifyAccessToken(token);

  if (!payload) return null;

  const demoSessionId = payload.demoSessionId || cookieStore.get("demoSessionId")?.value;

  return {
    user: {
      id: payload.id as string,
      role: payload.role as string,
      isDemo: Boolean(payload.isDemo),
      demoSessionId,
    },
  };
}
