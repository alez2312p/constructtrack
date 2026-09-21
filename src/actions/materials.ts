"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  materialSchema,
  updateMaterialSchema,
} from "../lib/validation/schemas";
import { Prisma } from "@prisma/client";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { rateLimit } from "@/lib/rate-limit";
import { assertSession } from "@/lib/auth/assert-session";
import { getSession } from "@/lib/auth/get-session";
import {
  getDemoMaterials,
  getDemoMaterialById,
  getDemoLowStockMaterials,
  getDemoTotalMaterialsCount,
  getDemoRecentMovements,
  createDemoMaterial,
  updateDemoMaterial,
  deleteDemoMaterial,
  getDemoInventoryValuation,
  getDemoDashboardAnalytics,
  createDemoMaterialsBatch,
} from "@/lib/demo/demo-store";
import { logAuditEvent } from "./audit";
import { DashboardAnalyticsData } from "@/lib/type";

export async function getMaterials(cursor?: string, limit: number = 50) {
  try {
    const session = await getSession();
    if (session?.user?.isDemo) {
      const demoMats = await getDemoMaterials(session.user.demoSessionId, cursor, limit);
      return demoMats as unknown as Array<{
        id: string;
        name: string;
        unit: string;
        currentStock: number;
        minStock: number;
        unitCost?: number | null;
        sku?: string | null;
        active: boolean;
        deletedAt: Date | null;
        categoryId: string | null;
        locationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        category: { id: string; name: string; createdAt: Date } | null;
        location: { id: string; name: string; description: string | null; createdAt: Date } | null;
      }>;
    }

    const where = cursor
      ? { id: { lt: cursor }, active: true }
      : { active: true };

    return await prisma.material.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1, // get extra to check if there's more
      include: {
        category: true,
        location: true,
      },
    });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return [];
  }
}

export async function getMaterialById(id: string) {
  try {
    const session = await getSession();
    if (session?.user?.isDemo) {
      const demoMat = await getDemoMaterialById(session.user.demoSessionId, id);
      if (!demoMat) return null;
      return {
        id: demoMat.id,
        name: demoMat.name,
        unit: demoMat.unit,
        currentStock: demoMat.currentStock,
        minStock: demoMat.minStock,
        unitCost: demoMat.unitCost ?? 0,
        sku: demoMat.sku ?? null,
        createdAt: demoMat.createdAt,
        updatedAt: demoMat.updatedAt,
        active: demoMat.active,
        deletedAt: demoMat.deletedAt,
        categoryId: demoMat.categoryId,
        locationId: demoMat.locationId,
      };
    }
    return await prisma.material.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error fetching material:", error);
    return null;
  }
}

export async function createMaterial(formData: FormData, userId?: string) {
  const session = await getSession();
  const isDemo = session?.user?.isDemo;

  // --- Rate limiting ---
  if (!isDemo && rateLimit) {
    const identifier = userId ?? "anonymous";
    const { success } = await rateLimit.mutation.limit(identifier);
    if (!success) {
      return { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." };
    }
  }

  try {
    // Validate with Zod
    const validatedFields = materialSchema.safeParse({
      name: formData.get("name"),
      unit: formData.get("unit"),
      minStock: formData.get("minStock"),
      initialStock: formData.get("initialStock"),
      unitCost: formData.get("unitCost"),
      sku: formData.get("sku"),
      categoryId: formData.get("categoryId"),
      locationId: formData.get("locationId"),
    });

    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.issues.reduce<
        Record<string, string>
      >((acc, issue) => {
        const path = issue.path[0] ?? "unknown";
        return {
          ...acc,
          [path]: issue.message,
        };
      }, {});

      return {
        error: "Datos de entrada inválidos",
        fieldErrors,
      };
    }

    if (isDemo) {
      await createDemoMaterial(session?.user?.demoSessionId, validatedFields.data, session?.user?.id);
      revalidatePath("/inventory");
      revalidatePath("/dashboard");
      return { success: true };
    }

    const { name, unit, minStock, initialStock, unitCost, sku, categoryId, locationId } =
      validatedFields.data;

    const validUserId = userId && userId.trim().length > 0 ? userId : undefined;

    const initialStockValue = initialStock ?? 0;
    const unitCostValue = unitCost ?? 0;
    if (initialStockValue > 0 && !validUserId) {
      return { error: "Se requiere usuario autenticado para stock inicial" };
    }

    if (initialStockValue > 0 && validUserId) {
      const user = await prisma.user.findUnique({
        where: { id: validUserId },
      });
      if (!user) {
        return {
          error:
            "Sesión inválida. Por favor, cierra sesión y vuelve a iniciar.",
        };
      }
    }

    const materialData = {
      name,
      unit,
      minStock: minStock ?? 0,
      currentStock: initialStockValue,
      unitCost: unitCostValue,
      sku: sku?.trim() || null,
      active: true,
      ...(categoryId && { categoryId }),
      ...(locationId && { locationId }),
    };

    let createdId = "";
    if (initialStockValue > 0 && validUserId) {
      await prisma.$transaction(async (tx) => {
        const material = await tx.material.create({
          data: materialData,
        });
        createdId = material.id;

        await tx.movement.create({
          data: {
            type: "IN",
            quantity: initialStockValue,
            notes: "Stock inicial",
            unitPrice: unitCostValue,
            materialId: material.id,
            userId: validUserId!,
          },
        });
      });
    } else if (initialStockValue === 0) {
      const material = await prisma.material.create({
        data: materialData,
      });
      createdId = material.id;
    }

    await logAuditEvent("CREATE_MATERIAL", "Material", createdId, `Material creado: ${name}`, validUserId);

    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error creating material:", error);
    if (
      error instanceof Error &&
      error.message.includes("Foreign key constraint")
    ) {
      return {
        error: "Sesión inválida. Por favor, cierra sesión y vuelve a iniciar.",
      };
    }
    return { error: "Error al crear el material. Intenta de nuevo." };
  }
}

export async function updateMaterial(id: string, formData: FormData) {
  // --- Auth check ---
  const session = await assertSession();

  // --- Rate limiting ---
  if (!session.user.isDemo && rateLimit) {
    const { success } = await rateLimit.mutation.limit(session.user.id);
    if (!success) {
      return { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." };
    }
  }

  try {
    // Validate with Zod (partial update)
    const validatedFields = updateMaterialSchema.safeParse({
      id,
      name: formData.get("name"),
      unit: formData.get("unit"),
      minStock: formData.get("minStock"),
      unitCost: formData.get("unitCost"),
      sku: formData.get("sku"),
      categoryId: formData.get("categoryId"),
      locationId: formData.get("locationId"),
    });

    if (!validatedFields.success) {
      return {
        error: "Datos de entrada inválidos: " + validatedFields.error.message,
      };
    }

    if (session.user.isDemo) {
      const res = await updateDemoMaterial(session.user.demoSessionId, id, validatedFields.data);
      if (res.error) return { error: res.error };
      revalidatePath("/inventory");
      revalidatePath("/dashboard");
      return { success: true };
    }

    const { name, unit, minStock, unitCost, sku, categoryId, locationId } =
      validatedFields.data;

    const updateData: Record<string, unknown> = {
      name,
      unit,
      minStock: minStock ?? 0,
      unitCost: unitCost ?? 0,
      sku: sku?.trim() || null,
    };

    if (categoryId !== null && categoryId !== undefined) {
      updateData.categoryId = categoryId;
    } else {
      updateData.categoryId = null;
    }

    if (locationId !== null && locationId !== undefined) {
      updateData.locationId = locationId;
    } else {
      updateData.locationId = null;
    }

    const updated = await prisma.material.update({
      where: { id },
      data: updateData,
    });

    await logAuditEvent("UPDATE_MATERIAL", "Material", id, `Material actualizado: ${updated.name}`, session.user.id);

    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating material:", error);
    return { error: "Error al actualizar el material. Intenta de nuevo." };
  }
}

export async function deleteMaterial(id: string) {
  // --- Auth check ---
  const session = await assertSession();

  // --- Rate limiting ---
  if (!session.user.isDemo && rateLimit) {
    const { success } = await rateLimit.mutation.limit(session.user.id);
    if (!success) {
      return { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." };
    }
  }

  if (session.user.isDemo) {
    const res = await deleteDemoMaterial(session.user.demoSessionId, id);
    if (res.error) return { error: res.error };
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    return { success: true };
  }

  try {
    const deleted = await prisma.material.update({
      where: { id },
      data: {
        active: false,
        deletedAt: new Date(),
      },
    });

    await logAuditEvent("DELETE_MATERIAL", "Material", id, `Material eliminado: ${deleted.name}`, session.user.id);

    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting material:", error);
    return { error: "Error al eliminar el material. Intenta de nuevo." };
  }
}

export async function getLowStockMaterials() {
  try {
    const session = await getSession();
    if (session?.user?.isDemo) {
      const materials = await getDemoLowStockMaterials(session.user.demoSessionId);
      return materials as unknown as Array<{
        id: string;
        name: string;
        unit: string;
        currentStock: number;
        minStock: number;
        active: boolean;
        deletedAt: Date | null;
        categoryId: string | null;
        locationId: string | null;
        createdAt: Date;
        updatedAt: Date;
        category: { id: string; name: string } | null;
        location: { id: string; name: string } | null;
      }>;
    }
    const materials = await prisma.material.findMany({
      where: { active: true },
    });
    return materials.filter((m) => m.currentStock <= m.minStock);
  } catch (error) {
    console.error("Error fetching low stock materials:", error);
    return [];
  }
}

export type RecentMovement = {
  id: string;
  type: "IN" | "OUT";
  quantity: number;
  date: Date;
  notes: string | null;
  user: { id: string; name: string };
  material: {
    id: string;
    name: string;
    unit: string;
    category: { name: string } | null;
    location: { name: string } | null;
  };
};

export async function getRecentMovements(
  onlyToday: boolean,
  limit?: number
): Promise<RecentMovement[]> {
  try {
    const session = await getSession();
    if (session?.user?.isDemo) {
      const demoMovements = await getDemoRecentMovements(session.user.demoSessionId, onlyToday, limit);
      return demoMovements as RecentMovement[];
    }

    const where: Prisma.MovementWhereInput = {};

    if (onlyToday) {
      // Use date-fns to calculate start and end of today
      const now = new Date();
      const startOfDayTimestamp = startOfDay(now);
      const endOfDayTimestamp = endOfDay(now);

      where.date = {
        gte: startOfDayTimestamp,
        lte: endOfDayTimestamp,
      };
    }
    const movements = await prisma.movement.findMany({
      where,
      take: limit, // Si se pasa un número, limita el resultado (ej. 20)
      orderBy: [{ date: "desc" }, { id: "desc" }],
      select: {
        id: true,
        type: true,
        quantity: true,
        date: true,
        notes: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        material: {
          select: {
            id: true,
            name: true,
            unit: true,
            category: {
              select: {
                name: true,
              },
            },
            location: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Ensure type is properly typed as "IN" | "OUT" for frontend compatibility
    return movements.map((movement) => ({
      ...movement,
      type: movement.type === "IN" ? "IN" : "OUT",
    })) as unknown as Array<{
      id: string;
      type: "IN" | "OUT";
      quantity: number;
      date: Date;
      notes: string | null;
      user: { id: string; name: string };
      material: {
        id: string;
        name: string;
        unit: string;
        category: { name: string } | null;
        location: { name: string } | null;
      };
    }>;
  } catch (error) {
    console.error("Error fetching recent movements:", error);
    return [];
  }
}

export async function getTotalMaterialsCount() {
  try {
    const session = await getSession();
    if (session?.user?.isDemo) {
      return await getDemoTotalMaterialsCount(session.user.demoSessionId);
    }

    return await prisma.material.count({
      where: { active: true },
    });
  } catch (error) {
    console.error("Error counting materials:", error);
    return 0;
  }
}

export async function getInventoryValuation(): Promise<number> {
  try {
    const session = await getSession();
    if (session?.user?.isDemo) {
      return await getDemoInventoryValuation(session.user.demoSessionId);
    }

    const materials = await prisma.material.findMany({
      where: { active: true },
      select: { currentStock: true, unitCost: true },
    });

    const total = materials.reduce(
      (sum, m) => sum + m.currentStock * (m.unitCost || 0),
      0
    );
    return Math.round(total * 100) / 100;
  } catch (error) {
    console.error("Error calculating inventory valuation:", error);
    return 0;
  }
}

export async function getDashboardAnalytics(): Promise<DashboardAnalyticsData> {
  try {
    const session = await getSession();
    if (session?.user?.isDemo) {
      return await getDemoDashboardAnalytics(session.user.demoSessionId);
    }

    const [activeMaterials, recentMovements] = await Promise.all([
      prisma.material.findMany({
        where: { active: true },
        include: { category: true },
      }),
      prisma.movement.findMany({
        where: { date: { gte: subDays(new Date(), 45) } },
        orderBy: [{ date: "asc" }],
        include: {
          material: true,
          project: true,
        },
      }),
    ]);

    // 1. Stock Health
    const empty = activeMaterials.filter((m) => m.currentStock === 0).length;
    const low = activeMaterials.filter((m) => m.currentStock > 0 && m.currentStock <= m.minStock).length;
    const normal = activeMaterials.filter((m) => m.currentStock > m.minStock).length;
    const total = activeMaterials.length;

    // 2. Category Valuation ($ distribution)
    const catValMap = new Map<string, { value: number; count: number }>();
    let totalInventoryValue = 0;

    for (const m of activeMaterials) {
      const catName = m.category?.name || "General";
      const val = m.currentStock * (m.unitCost || 0);
      totalInventoryValue += val;

      const existing = catValMap.get(catName) || { value: 0, count: 0 };
      catValMap.set(catName, {
        value: existing.value + val,
        count: existing.count + 1,
      });
    }

    const categoryValuation = Array.from(catValMap.entries())
      .map(([name, { value, count }]) => ({
        name,
        value: Math.round(value * 100) / 100,
        itemCount: count,
        percentage: totalInventoryValue > 0 ? Math.round((value / totalInventoryValue) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);

    // 3. Daily Operations (continuous last 7 days)
    const days: string[] = [];
    const dayLabels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      days.push(dayKey);
      dayLabels.push(label);
    }

    const dailyOpsMap = new Map<string, { entradas: number; salidas: number }>();
    days.forEach((k) => dailyOpsMap.set(k, { entradas: 0, salidas: 0 }));

    for (const mov of recentMovements) {
      const d = new Date(mov.date);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (dailyOpsMap.has(k)) {
        const entry = dailyOpsMap.get(k)!;
        if (mov.type === "IN") entry.entradas++;
        else entry.salidas++;
      }
    }

    const dailyOperations = days.map((k, idx) => {
      const { entradas, salidas } = dailyOpsMap.get(k) || { entradas: 0, salidas: 0 };
      return {
        date: dayLabels[idx],
        entradas,
        salidas,
        total: entradas + salidas,
      };
    });

    // 4. Top Moving Materials (highest dispatched quantity to construction sites)
    const matDispatchesMap = new Map<string, { name: string; unit: string; quantity: number; movementsCount: number }>();
    for (const mov of recentMovements) {
      if (mov.type === "OUT") {
        const name = mov.material.name;
        const unit = mov.material.unit;
        const existing = matDispatchesMap.get(mov.materialId) || { name, unit, quantity: 0, movementsCount: 0 };
        existing.quantity += mov.quantity;
        existing.movementsCount += 1;
        matDispatchesMap.set(mov.materialId, existing);
      }
    }

    const topMovingMaterials = Array.from(matDispatchesMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 5. Project Dispatches
    const projectMap = new Map<string, number>();
    let totalProjectDispatches = 0;
    for (const mov of recentMovements) {
      if (mov.type === "OUT") {
        const projName = mov.project?.name || "Almacén Central / General";
        projectMap.set(projName, (projectMap.get(projName) || 0) + 1);
        totalProjectDispatches++;
      }
    }

    const projectDispatches = Array.from(projectMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalProjectDispatches > 0 ? Math.round((count / totalProjectDispatches) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      stockHealth: { normal, low, empty, total },
      dailyOperations,
      categoryValuation,
      topMovingMaterials,
      projectDispatches,
    };
  } catch (error) {
    console.error("Error calculating dashboard analytics:", error);
    return {
      stockHealth: { normal: 0, low: 0, empty: 0, total: 0 },
      dailyOperations: [],
      categoryValuation: [],
      topMovingMaterials: [],
      projectDispatches: [],
    };
  }
}

export async function importMaterialsBatch(
  items: Array<{
    name: string;
    unit: string;
    minStock?: number;
    initialStock?: number;
    unitCost?: number;
    sku?: string | null;
    categoryId?: string | null;
    locationId?: string | null;
  }>
) {
  const session = await assertSession();
  if (session.user.role === "AUDITOR") {
    return { error: "Los auditores no tienen permiso para importar materiales" };
  }

  if (session.user.isDemo) {
    const res = await createDemoMaterialsBatch(session.user.demoSessionId, items, session.user.id);
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    return res;
  }

  try {
    let count = 0;
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        if (!item.name || !item.unit) continue;
        const initialStock = item.initialStock ?? 0;
        const unitCost = item.unitCost ?? 0;

        const mat = await tx.material.create({
          data: {
            name: item.name.trim(),
            unit: item.unit.trim(),
            minStock: item.minStock ?? 0,
            currentStock: initialStock,
            unitCost,
            sku: item.sku?.trim() || null,
            categoryId: item.categoryId || null,
            locationId: item.locationId || null,
            active: true,
          },
        });

        if (initialStock > 0) {
          await tx.movement.create({
            data: {
              type: "IN",
              quantity: initialStock,
              notes: "Importación masiva - Stock inicial",
              unitPrice: unitCost,
              materialId: mat.id,
              userId: session.user.id,
            },
          });
        }
        count++;
      }
    });

    await logAuditEvent("BATCH_IMPORT_MATERIALS", "Material", null, `Importación masiva de ${count} materiales`, session.user.id);

    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    return { success: true, count };
  } catch (error) {
    console.error("Error batch importing materials:", error);
    return { error: "Error al importar los materiales" };
  }
}

