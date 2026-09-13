"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { locationSchema, updateLocationSchema } from "../../lib/validation/schemas";
import { assertSession } from "@/lib/auth/assert-session";
import { getSession } from "@/lib/auth/get-session";
import { rateLimit } from "@/lib/rate-limit";
import {
  getDemoLocations,
  getDemoLocationsForSelect,
  createDemoLocation,
  updateDemoLocation,
  deleteDemoLocation,
} from "@/lib/demo/demo-store";

export async function getLocations() {
  try {
    const session = await getSession();
    if (session?.user?.isDemo) {
      return await getDemoLocations(session.user.demoSessionId);
    }
    return await prisma.location.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}

export async function createLocation(formData: FormData) {
  // Auth
  const session = await assertSession();

  // Rate limiting
  if (!session.user.isDemo && rateLimit) {
    const { success } = await rateLimit.mutation.limit(session.user.id);
    if (!success) {
      return { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." };
    }
  }

  try {
    // Validate with Zod
    const validatedFields = locationSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
    });

    if (!validatedFields.success) {
      return { 
        error: "Datos de entrada inválidos: " + validatedFields.error.message 
      };
    }

    const { name, description } = validatedFields.data;

    if (session.user.isDemo) {
      await createDemoLocation(session.user.demoSessionId, {
        name: name.trim(),
        description: description?.trim() || null,
      });
      revalidatePath("/locations");
      revalidatePath("/inventory");
      return { success: true };
    }

    await prisma.location.create({
      data: { 
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    revalidatePath("/locations");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("Error creating location:", error);
    return { error: "Error al crear la ubicación" };
  }
}

export async function updateLocation(id: string, formData: FormData) {
  // Auth
  const session = await assertSession();

  // Rate limiting
  if (!session.user.isDemo && rateLimit) {
    const { success } = await rateLimit.mutation.limit(session.user.id);
    if (!success) {
      return { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." };
    }
  }

  try {
    // Validate with Zod (partial update)
    const validatedFields = updateLocationSchema.safeParse({
      id,
      name: formData.get("name"),
      description: formData.get("description"),
    });

    if (!validatedFields.success) {
      return { 
        error: "Datos de entrada inválidos: " + validatedFields.error.message 
      };
    }

    const { name, description } = validatedFields.data;

    if (session.user.isDemo) {
      const res = await updateDemoLocation(session.user.demoSessionId, id, {
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? description?.trim() || null : undefined,
      });
      if (res.error) return { error: res.error };
      revalidatePath("/locations");
      revalidatePath("/inventory");
      return { success: true };
    }

    const updateData: Record<string, unknown> = { id };

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    await prisma.location.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/locations");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("Error updating location:", error);
    return { error: "Error al actualizar la ubicación" };
  }
}

export async function deleteLocation(id: string) {
  // Auth
  const session = await assertSession();

  // Rate limiting
  if (!session.user.isDemo && rateLimit) {
    const { success } = await rateLimit.mutation.limit(session.user.id);
    if (!success) {
      return { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." };
    }
  }

  if (session.user.isDemo) {
    const res = await deleteDemoLocation(session.user.demoSessionId, id);
    if (res.error) return { error: res.error };
    revalidatePath("/locations");
    revalidatePath("/inventory");
    return { success: true };
  }

  try {
    const materialsWithLocation = await prisma.material.count({
      where: { locationId: id },
    });

    if (materialsWithLocation > 0) {
      return { error: `No se puede eliminar. Hay ${materialsWithLocation} materiales en esta ubicación` };
    }

    await prisma.location.delete({ where: { id } });
    revalidatePath("/locations");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("Error deleting location:", error);
    return { error: "Error al eliminar la ubicación" };
  }
}

export async function getLocationsForSelect() {
  try {
    const session = await getSession();
    if (session?.user?.isDemo) {
      return await getDemoLocationsForSelect(session.user.demoSessionId);
    }
    return await prisma.location.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching locations for select:", error);
    return [];
  }
}
