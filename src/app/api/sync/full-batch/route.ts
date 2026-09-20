import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  syncProjects,
  syncSuppliers,
  syncCategoriesAndLocations,
  syncMaterials,
} from "./syncCatalogs";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { payload, deviceId, authorizedBy } = data;

    if (!payload) {
      return NextResponse.json({ error: "Payload requerido" }, { status: 400 });
    }

    const {
      categories = [],
      locations = [],
      projects = [],
      suppliers = [],
      materials = [],
      movements = [],
    } = payload;
    let syncedMovementsCount = 0;

    // 1. Sincronizar entidades base
    await syncCategoriesAndLocations(categories, locations);
    await syncProjects(projects);
    await syncSuppliers(suppliers);
    await syncMaterials(materials);

    // 4. Procesar Movimientos encolados offline
    const defaultUser = await prisma.user.findFirst();
    const fallbackUserId = defaultUser?.id || "cm1234567890abcdefg";

    for (const mov of movements) {
      const numQty = Number(mov.quantity);
      if (!mov.materialId || isNaN(numQty) || numQty <= 0) continue;

      // Validar usuario existente
      let validUserId = fallbackUserId;
      if (mov.userId && mov.userId !== "user-local" && mov.userId !== "user-id") {
        const uExists = await prisma.user.findUnique({ where: { id: mov.userId } });
        if (uExists) validUserId = uExists.id;
      }

      // Validar proyecto y proveedor existentes
      let validProjectId: string | null = null;
      if (mov.projectId) {
        const pExists = await prisma.project.findUnique({ where: { id: mov.projectId } });
        if (pExists) validProjectId = mov.projectId;
      }

      let validSupplierId: string | null = null;
      if (mov.supplierId) {
        const sExists = await prisma.supplier.findUnique({ where: { id: mov.supplierId } });
        if (sExists) validSupplierId = mov.supplierId;
      }

      await prisma.$transaction(async (tx) => {
        const material = await tx.material.findUnique({
          where: { id: mov.materialId },
        });

        if (!material) return;

        const newStock = mov.type === "IN" ? material.currentStock + numQty : material.currentStock - numQty;

        await tx.material.update({
          where: { id: mov.materialId },
          data: { currentStock: newStock },
        });

        await tx.movement.create({
          data: {
            id: mov.id || undefined,
            materialId: mov.materialId,
            type: mov.type,
            quantity: numQty,
            date: mov.date ? new Date(mov.date) : new Date(),
            userId: validUserId,
            projectId: validProjectId,
            supplierId: validSupplierId,
            unitPrice: mov.unitPrice ? Number(mov.unitPrice) : null,
            receiverName: mov.receiverName || null,
            signature: mov.signature || null,
            notes: mov.notes || null,
          },
        });

        await tx.auditLog.create({
          data: {
            action: `OFFLINE_SYNC_${mov.type}`,
            entity: "Movement",
            entityId: mov.id,
            userId: validUserId,
            details: JSON.stringify({
              deviceId,
              quantity: numQty,
              materialName: material.name,
              newStock,
            }),
          },
        });

        syncedMovementsCount++;
      });
    }

    // Registrar auditoría de autorización si fue firmado con PIN / Huella
    if (authorizedBy) {
      let authUserId = fallbackUserId;
      if (authorizedBy.userId && authorizedBy.userId !== "user-local" && authorizedBy.userId !== "user-id") {
        const uExists = await prisma.user.findUnique({ where: { id: authorizedBy.userId } });
        if (uExists) authUserId = uExists.id;
      }

      await prisma.auditLog.create({
        data: {
          action: "BATCH_SYNC_AUTHORIZED",
          entity: "SyncBatch",
          userId: authUserId,
          details: JSON.stringify({
            deviceId,
            syncedMovementsCount,
            authorizerName: authorizedBy.name || "Usuario de Obra",
            method: authorizedBy.method || "PIN",
            syncedAt: new Date().toISOString(),
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      syncedCount: syncedMovementsCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in full batch sync:", error);
    return NextResponse.json({ error: error.message || "Batch sync failed" }, { status: 500 });
  }
}
