"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertSession } from "@/lib/auth/assert-session";
import { categorySchema } from "@/lib/validation/schemas";
import { rateLimit } from "@/lib/rate-limit";

export async function getCategories() {
  // No auth needed for reading? According to original, no auth required.
  try {
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
  if (rateLimit) {
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
  if (rateLimit) {
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
  if (rateLimit) {
    const { success } = await rateLimit.mutation.limit(session.user.id);
    if (!success) {
      return { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." };
    }
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
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { error: "Error al eliminar la categoría" };
  }
}

export async function getCategoriesForSelect() {
  try {
    return await prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: [{ name: "asc" }],
    });
  } catch (error) {
    console.error("Error fetching categories for select:", error);
    return [];
  }
}
