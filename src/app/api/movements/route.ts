import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/tokens-edge";

export async function GET() {
  try {
    const movements = await prisma.movement.findMany({
      include: {
        material: { select: { id: true, name: true, unit: true } },
        project: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: "desc" },
      take: 50,
    });
    return NextResponse.json(movements);
  } catch (error: any) {
    console.error("Error fetching movements:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch movements" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let resolvedUserId: string | null = null;

    // Verificar si viene Bearer token
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = await verifyAccessToken(token);
      if (payload?.id) resolvedUserId = payload.id;
    }

    const body = await request.json();
    const {
      materialId,
      type,
      quantity,
      userId,
      projectId,
      supplierId,
      unitPrice,
      receiverName,
      signature,
      notes,
      date,
    } = body;

    if (!materialId || !type || !quantity || Number(quantity) <= 0) {
      return NextResponse.json({ error: "Datos de movimiento inválidos o incompletos" }, { status: 400 });
    }

    // Resolver y validar que el usuario exista en Neon
    let existingUser = null;
    if (resolvedUserId) {
      existingUser = await prisma.user.findUnique({ where: { id: resolvedUserId } });
    }
    if (!existingUser && userId && userId !== "user-local" && userId !== "user-id") {
      existingUser = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!existingUser) {
      existingUser = await prisma.user.findFirst();
    }
    if (!existingUser) {
      return NextResponse.json({ error: "No existe usuario en la base de datos para registrar el movimiento" }, { status: 400 });
    }
    const finalUserId = existingUser.id;

    // Validar proyecto y proveedor si fueron enviados
    let validProjectId: string | null = null;
    if (projectId) {
      const pExists = await prisma.project.findUnique({ where: { id: projectId } });
      if (pExists) validProjectId = projectId;
    }

    let validSupplierId: string | null = null;
    if (supplierId) {
      const sExists = await prisma.supplier.findUnique({ where: { id: supplierId } });
      if (sExists) validSupplierId = supplierId;
    }

    const numQty = Number(quantity);
    const movementDate = date ? new Date(date) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      const material = await tx.material.findUnique({
        where: { id: materialId },
      });

      if (!material) {
        throw new Error(`Material no encontrado: ${materialId}`);
      }

      if (type === "OUT" && material.currentStock < numQty) {
        throw new Error(`Stock insuficiente. Disponible: ${material.currentStock} ${material.unit}`);
      }

      const newStock = type === "IN" ? material.currentStock + numQty : material.currentStock - numQty;

      await tx.material.update({
        where: { id: materialId },
        data: { currentStock: newStock },
      });

      const movement = await tx.movement.create({
        data: {
          materialId,
          type,
          quantity: numQty,
          date: movementDate,
          userId: finalUserId,
          projectId: validProjectId,
          supplierId: validSupplierId,
          unitPrice: unitPrice ? Number(unitPrice) : null,
          receiverName: receiverName || null,
          signature: signature || null,
          notes: notes || null,
        },
      });

      await tx.auditLog.create({
        data: {
          action: `MOVEMENT_${type}`,
          entity: "Movement",
          entityId: movement.id,
          userId: resolvedUserId!,
          details: JSON.stringify({
            materialName: material.name,
            quantity: numQty,
            previousStock: material.currentStock,
            newStock,
          }),
        },
      });

      return { movement, newStock };
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error: any) {
    console.error("Error registering movement:", error);
    return NextResponse.json({ error: error.message || "Failed to register movement" }, { status: 500 });
  }
}
