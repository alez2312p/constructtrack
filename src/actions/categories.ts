"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertSession } from "@/lib/auth/assert-session";
import { getSession } from "@/lib/auth/get-session";
import { categorySchema } from "@/lib/validation/schemas";
import { rateLimit } from "@/lib/rate-limit";
import {
  getDemoCategories,
  getDemoCategoriesForSelect,
  createDemoCategory,
  updateDemoCategory,
  deleteDemoCategory,
} from "@/lib/demo/demo-store";

export async function getCategories() {
  try {
    const session = await getSession();
    if (session?.user?.isDemo) {
      return await getDemoCategories(session.user.demoSessionId);
    }
    return await prisma.category.findMany({
      orderBy: [{ name: "asc" }],
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function createCategory(formData: FormData) {
  // Auth
  const session = await assertSession();

  // Rate limiting
  if (!session.user.isDemo && rateLimit) {
    const { success } = await rateLimit.mutation.limit(session.user.id);
    if (!success) {
      return { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." };
    }
  }

  const validated = categorySchema.safeParse({
    name: formData.get("name"),
  });

  if (!validated.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: validated.error.issues.reduce<Record<string, string>>(
        (acc, issue) => {
          const path = issue.path[0] ?? "unknown";
          return { ...acc, [path]: issue.message };
        },
        {},
      ),
    };
  }

  const { name } = validated.data;

  if (session.user.isDemo) {
    await createDemoCategory(session.user.demoSessionId, { name: name.trim() });
    revalidatePath("/categories");
    revalidatePath("/inventory");
    return { success: true };
  }

  try {
    await prisma.category.create({
      data: { name: name.trim() },
    });

    revalidatePath("/categories");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("Error creating category:", error);
    return { error: "Error al crear la categoría" };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const session = await assertSession();

  // Rate limiting
  if (!session.user.isDemo && rateLimit) {
    const { success } = await rateLimit.mutation.limit(session.user.id);
    if (!success) {
      return { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." };
    }
  }

  const validated = categorySchema.safeParse({
    name: formData.get("name"),
  });

  if (!validated.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: validated.error.issues.reduce<Record<string, string>>(
        (acc, issue) => {
          const path = issue.path[0] ?? "unknown";
          return { ...acc, [path]: issue.message };
        },
        {},
      ),
    };
  }

  const { name } = validated.data;

  if (session.user.isDemo) {
    const res = await updateDemoCategory(session.user.demoSessionId, id, { name: name.trim() });
    if (res.error) return { error: res.error };
    revalidatePath("/categories");
    revalidatePath("/inventory");
    return { success: true };
  }

  try {
    await prisma.category.update({
      where: { id },
      data: { name: name.trim() },
    });

    revalidatePath("/categories");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("Error updating category:", error);
    return { error: "Error al actualizar la categoría" };
  }
}

export async function deleteCategory(id: string) {
  const session = await assertSession();

  // Rate limiting
  if (!session.user.isDemo && rateLimit) {
    const { success } = await rateLimit.mutation.limit(session.user.id);
    if (!success) {
      return { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." };
    }
  }

  if (session.user.isDemo) {
    const res = await deleteDemoCategory(session.user.demoSessionId, id);
    if (res.error) return { error: res.error };
    revalidatePath("/categories");
    revalidatePath("/inventory");
    return { success: true };
  }

  try {
    const materialsWithCategory = await prisma.material.count({
      where: { categoryId: id },
    });

    if (materialsWithCategory > 0) {
      return {
        error: `No se puede eliminar. Hay ${materialsWithCategory} materiales usando esta categoría`,
      };
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath("/categories");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { error: "Error al eliminar la categoría" };
  }
}

export async function getCategoriesForSelect() {
  try {
    const session = await getSession();
    if (session?.user?.isDemo) {
      return await getDemoCategoriesForSelect(session.user.demoSessionId);
    }
    return await prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: [{ name: "asc" }],
    });
  } catch (error) {
    console.error("Error fetching categories for select:", error);
    return [];
  }
}
