"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  materialSchema,
  updateMaterialSchema,
} from "../lib/validation/schemas";
import { Prisma } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";
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
} from "@/lib/demo/demo-store";

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

    const { name, unit, minStock, initialStock, categoryId, locationId } =
      validatedFields.data;

    const validUserId = userId && userId.trim().length > 0 ? userId : undefined;

    const initialStockValue = initialStock ?? 0;
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
      active: true,
      ...(categoryId && { categoryId }),
      ...(locationId && { locationId }),
    };

    if (initialStockValue > 0 && validUserId) {
      await prisma.$transaction(async (tx) => {
        const material = await tx.material.create({
          data: materialData,
        });

        await tx.movement.create({
          data: {
            type: "IN",
            quantity: initialStockValue,
            notes: "Stock inicial",
            materialId: material.id,
            userId: validUserId!,
          },
        });
      });
    } else if (initialStockValue === 0) {
      await prisma.material.create({
        data: materialData,
      });
    }

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

    const { name, unit, minStock, categoryId, locationId } =
      validatedFields.data;

    const updateData: Record<string, unknown> = {
      name,
      unit,
      minStock: minStock ?? 0,
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

    await prisma.material.update({
      where: { id },
      data: updateData,
    });

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
    await prisma.material.update({
      where: { id },
      data: {
        active: false,
        deletedAt: new Date(),
      },
    });
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
