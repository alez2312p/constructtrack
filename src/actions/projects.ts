"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertSession } from "@/lib/auth/assert-session";
import { getSession } from "@/lib/auth/get-session";
import { projectSchema } from "@/lib/validation/schemas";
import { rateLimit } from "@/lib/rate-limit";
import {
  getDemoProjects,
  getDemoProjectsForSelect,
  createDemoProject,
  updateDemoProject,
  deleteDemoProject,
} from "@/lib/demo/demo-store";

export async function getProjects() {
  try {
    const session = await getSession();
    if (session?.user?.isDemo) {
      return await getDemoProjects(session.user.demoSessionId);
    }
    return await prisma.project.findMany({
      orderBy: [{ name: "asc" }],
      include: {
        _count: {
          select: { movements: true },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function getProjectsForSelect() {
  try {
    const session = await getSession();
    if (session?.user?.isDemo) {
      return await getDemoProjectsForSelect(session.user.demoSessionId);
    }
    return await prisma.project.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, code: true },
      orderBy: [{ name: "asc" }],
    });
  } catch (error) {
    console.error("Error fetching projects for select:", error);
    return [];
  }
}

export async function createProject(formData: FormData) {
  const session = await assertSession();

  if (!session.user.isDemo && rateLimit) {
    const { success } = await rateLimit.mutation.limit(session.user.id);
    if (!success) {
      return { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." };
    }
  }

  const validated = projectSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code") || null,
    description: formData.get("description") || null,
    address: formData.get("address") || null,
    status: formData.get("status") || "ACTIVE",
    budget: formData.get("budget") ? Number(formData.get("budget")) : null,
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

  const data = validated.data;

  if (session.user.isDemo) {
    await createDemoProject(session.user.demoSessionId, data);
    revalidatePath("/projects");
    revalidatePath("/movements");
    return { success: true };
  }

  try {
    await prisma.project.create({
      data: {
        name: data.name.trim(),
        code: data.code?.trim() || null,
        description: data.description?.trim() || null,
        address: data.address?.trim() || null,
        status: data.status,
        budget: data.budget ?? null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE_PROJECT",
        entity: "Project",
        details: `Obra creada: ${data.name}`,
        userId: session.user.id,
      },
    });

    revalidatePath("/projects");
    revalidatePath("/movements");
    return { success: true };
  } catch (error) {
    console.error("Error creating project:", error);
    return { error: "Error al crear la obra/proyecto" };
  }
}

export async function updateProject(id: string, formData: FormData) {
  const session = await assertSession();

  if (!session.user.isDemo && rateLimit) {
    const { success } = await rateLimit.mutation.limit(session.user.id);
    if (!success) {
      return { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." };
    }
  }

  const validated = projectSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code") || null,
    description: formData.get("description") || null,
    address: formData.get("address") || null,
    status: formData.get("status") || "ACTIVE",
    budget: formData.get("budget") ? Number(formData.get("budget")) : null,
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

  const data = validated.data;

  if (session.user.isDemo) {
    const res = await updateDemoProject(session.user.demoSessionId, id, data);
    if (res.error) return { error: res.error };
    revalidatePath("/projects");
    revalidatePath("/movements");
    return { success: true };
  }

  try {
    await prisma.project.update({
      where: { id },
      data: {
        name: data.name.trim(),
        code: data.code?.trim() || null,
        description: data.description?.trim() || null,
        address: data.address?.trim() || null,
        status: data.status,
        budget: data.budget ?? null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_PROJECT",
        entity: "Project",
        entityId: id,
        details: `Obra actualizada: ${data.name}`,
        userId: session.user.id,
      },
    });

    revalidatePath("/projects");
    revalidatePath("/movements");
    return { success: true };
  } catch (error) {
    console.error("Error updating project:", error);
    return { error: "Error al actualizar la obra" };
  }
}

export async function deleteProject(id: string) {
  const session = await assertSession();

  if (!session.user.isDemo && rateLimit) {
    const { success } = await rateLimit.mutation.limit(session.user.id);
    if (!success) {
      return { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." };
    }
  }

  if (session.user.isDemo) {
    const res = await deleteDemoProject(session.user.demoSessionId, id);
    if (res.error) return { error: res.error };
    revalidatePath("/projects");
    return { success: true };
  }

  try {
    const movementsCount = await prisma.movement.count({
      where: { projectId: id },
    });

    if (movementsCount > 0) {
      return {
        error: `No se puede eliminar. Hay ${movementsCount} movimientos asociados a esta obra.`,
      };
    }

    await prisma.project.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE_PROJECT",
        entity: "Project",
        entityId: id,
        details: `Obra eliminada ID: ${id}`,
        userId: session.user.id,
      },
    });

    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { error: "Error al eliminar la obra" };
  }
}
