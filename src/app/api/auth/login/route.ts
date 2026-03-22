import { NextResponse } from "next/server";
import { login } from "@/actions/auth";
import { setAuthCookies } from "@/lib/auth/tokens-server";

export async function POST(request: Request) {
  try {
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
