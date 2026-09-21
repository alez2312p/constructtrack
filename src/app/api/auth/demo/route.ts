import { NextResponse } from "next/server";
import { createDemoSession } from "@/actions/auth";

export async function POST(request: Request) {
  try {
    let role: "ADMIN" | "OPERATOR" = "ADMIN";
    try {
      const body = await request.json();
      if (body?.role === "OPERATOR") {
        role = "OPERATOR";
      }
    } catch {
      // Default to ADMIN
    }

    await createDemoSession(role);

    return NextResponse.json({
      success: true,
      redirectTo: "/dashboard",
    });
  } catch (err) {
    console.error("Demo login API error:", err);
    return NextResponse.json(
      { error: "Error al iniciar sesión en modo demostración" },
      { status: 500 },
    );
  }
}
