"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertSession } from "@/lib/auth/assert-session";
import { getSession } from "@/lib/auth/get-session";
import { supplierSchema } from "@/lib/validation/schemas";
import { rateLimit } from "@/lib/rate-limit";
import {
  getDemoSuppliers,
  getDemoSuppliersForSelect,
  createDemoSupplier,
  updateDemoSupplier,
  deleteDemoSupplier,
} from "@/lib/demo/demo-store";

export async function getSuppliers() {
  try {
    const session = await getSession();
    if (session?.user?.isDemo) {
      return await getDemoSuppliers(session.user.demoSessionId);
    }
    return await prisma.supplier.findMany({
      orderBy: [{ name: "asc" }],
      include: {
        _count: {
          select: { movements: true },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
}

export async function getSuppliersForSelect() {
  try {
    const session = await getSession();
    if (session?.user?.isDemo) {
      return await getDemoSuppliersForSelect(session.user.demoSessionId);
    }
    return await prisma.supplier.findMany({
      select: { id: true, name: true, taxId: true },
      orderBy: [{ name: "asc" }],
    });
  } catch (error) {
    console.error("Error fetching suppliers for select:", error);
    return [];
  }
}

export async function createSupplier(formData: FormData) {
  const session = await assertSession();

  if (!session.user.isDemo && rateLimit) {
    const { success } = await rateLimit.mutation.limit(session.user.id);
    if (!success) {
      return { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." };
    }
  }

  const validated = supplierSchema.safeParse({
    name: formData.get("name"),
    contactName: formData.get("contactName") || null,
    phone: formData.get("phone") || null,
    email: formData.get("email") || null,
    taxId: formData.get("taxId") || null,
    address: formData.get("address") || null,
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
    await createDemoSupplier(session.user.demoSessionId, data);
    revalidatePath("/suppliers");
    revalidatePath("/movements");
    return { success: true };
  }

  try {
    await prisma.supplier.create({
      data: {
        name: data.name.trim(),
        contactName: data.contactName?.trim() || null,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        taxId: data.taxId?.trim() || null,
        address: data.address?.trim() || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE_SUPPLIER",
        entity: "Supplier",
        details: `Proveedor creado: ${data.name}`,
        userId: session.user.id,
      },
    });

    revalidatePath("/suppliers");
    revalidatePath("/movements");
    return { success: true };
  } catch (error) {
    console.error("Error creating supplier:", error);
    return { error: "Error al registrar el proveedor" };
  }
}

export async function updateSupplier(id: string, formData: FormData) {
  const session = await assertSession();

  if (!session.user.isDemo && rateLimit) {
    const { success } = await rateLimit.mutation.limit(session.user.id);
    if (!success) {
      return { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." };
    }
  }

  const validated = supplierSchema.safeParse({
    name: formData.get("name"),
    contactName: formData.get("contactName") || null,
    phone: formData.get("phone") || null,
    email: formData.get("email") || null,
    taxId: formData.get("taxId") || null,
    address: formData.get("address") || null,
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
    const res = await updateDemoSupplier(session.user.demoSessionId, id, data);
    if (res.error) return { error: res.error };
    revalidatePath("/suppliers");
    revalidatePath("/movements");
    return { success: true };
  }

  try {
    await prisma.supplier.update({
      where: { id },
      data: {
        name: data.name.trim(),
        contactName: data.contactName?.trim() || null,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        taxId: data.taxId?.trim() || null,
        address: data.address?.trim() || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_SUPPLIER",
        entity: "Supplier",
        entityId: id,
        details: `Proveedor actualizado: ${data.name}`,
        userId: session.user.id,
      },
    });

    revalidatePath("/suppliers");
    revalidatePath("/movements");
    return { success: true };
  } catch (error) {
    console.error("Error updating supplier:", error);
    return { error: "Error al actualizar el proveedor" };
  }
}

export async function deleteSupplier(id: string) {
  const session = await assertSession();

  if (!session.user.isDemo && rateLimit) {
    const { success } = await rateLimit.mutation.limit(session.user.id);
    if (!success) {
      return { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." };
    }
  }

  if (session.user.isDemo) {
    const res = await deleteDemoSupplier(session.user.demoSessionId, id);
    if (res.error) return { error: res.error };
    revalidatePath("/suppliers");
    return { success: true };
  }

  try {
    const movementsCount = await prisma.movement.count({
      where: { supplierId: id },
    });

    if (movementsCount > 0) {
      return {
        error: `No se puede eliminar. Hay ${movementsCount} compras/movimientos registrados con este proveedor.`,
      };
    }

    await prisma.supplier.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE_SUPPLIER",
        entity: "Supplier",
        entityId: id,
        details: `Proveedor eliminado ID: ${id}`,
        userId: session.user.id,
      },
    });

    revalidatePath("/suppliers");
    return { success: true };
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return { error: "Error al eliminar el proveedor" };
  }
}
