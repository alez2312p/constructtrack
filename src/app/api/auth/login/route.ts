import { NextResponse } from "next/server";
import { login } from "@/actions/auth";
import { setAuthCookies } from "@/lib/auth/tokens-server";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    // Rate limiting por IP a nivel de API
    if (rateLimit) {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        "unknown";
      const { success } = await rateLimit.general.limit(`api:${ip}`);
      if (!success) {
        logger.warn("Rate limit API alcanzado en login/route", { ip });
        return NextResponse.json(
          { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." },
          { status: 429 },
        );
      }
    }

    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y password son requeridos" },
        { status: 400 },
      );
    }

    // Reutilizamos la action existente (necesita un FormData)
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await login(formData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    await setAuthCookies(result.accessToken, result.refreshToken);

    // Devolver JSON con éxito y URL de redirección
    return NextResponse.json({
      success: true,
      redirectTo: "/dashboard",
    });
  } catch (err) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
