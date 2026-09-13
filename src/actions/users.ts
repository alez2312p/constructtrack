"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertSession } from "@/lib/auth/assert-session";
import { userSchema } from "@/lib/validation/schemas";
import { hash } from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";
import {
  getDemoUsers,
  createDemoUser,
  updateDemoUser,
} from "@/lib/demo/demo-store";
import { logAuditEvent } from "./audit";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

export async function getUsers(): Promise<UserItem[]> {
  try {
    const session = await assertSession();

    if (session.user.isDemo) {
      const demoUsers = await getDemoUsers(session.user.demoSessionId);
      return demoUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        active: u.active,
      }));
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
      orderBy: { name: "asc" },
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function createUser(formData: FormData) {
  const session = await assertSession();

  if (session.user.role !== "ADMIN") {
    return { error: "Solo los administradores pueden crear usuarios" };
  }

  if (!session.user.isDemo && rateLimit) {
    const { success } = await rateLimit.mutation.limit(session.user.id);
    if (!success) {
      return { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." };
    }
  }

  const rawPassword = formData.get("password") as string;
  const validated = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: rawPassword || "Password123*",
    role: formData.get("role") || "OPERATOR",
    active: formData.get("active") === "false" ? false : true,
  });

  if (!validated.success) {
    return {
      error: "Datos de usuario inválidos",
      fieldErrors: validated.error.issues.reduce<Record<string, string>>((acc, issue) => {
        const path = issue.path[0] ?? "unknown";
        return { ...acc, [path]: issue.message };
      }, {}),
    };
  }

  const { name, email, role, active } = validated.data;

  if (session.user.isDemo) {
    const res = await createDemoUser(session.user.demoSessionId, {
      name,
      email,
      role,
    });
    if (res.error) return { error: res.error };
    revalidatePath("/settings/users");
    return { success: true };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "El correo electrónico ya se encuentra registrado" };
    }

    const hashedPassword = await hash(rawPassword || "Password123*", 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        active,
      },
    });

    await logAuditEvent("CREATE_USER", "User", user.id, `Usuario creado: ${name} (${role})`, session.user.id);

    revalidatePath("/settings/users");
    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "Error al registrar el usuario" };
  }
}

export async function updateUserRole(userId: string, role: "ADMIN" | "OPERATOR" | "AUDITOR") {
  const session = await assertSession();

  if (session.user.role !== "ADMIN") {
    return { error: "Solo los administradores pueden cambiar roles" };
  }

  if (session.user.isDemo) {
    const res = await updateDemoUser(session.user.demoSessionId, userId, { role });
    if (res.error) return { error: res.error };
    revalidatePath("/settings/users");
    return { success: true };
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    await logAuditEvent("UPDATE_USER_ROLE", "User", userId, `Rol cambiado a: ${role} para ${user.name}`, session.user.id);

    revalidatePath("/settings/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { error: "Error al actualizar el rol" };
  }
}

export async function toggleUserStatus(userId: string, active: boolean) {
  const session = await assertSession();

  if (session.user.role !== "ADMIN") {
    return { error: "Solo los administradores pueden modificar estados de usuarios" };
  }

  if (session.user.isDemo) {
    const res = await updateDemoUser(session.user.demoSessionId, userId, { active });
    if (res.error) return { error: res.error };
    revalidatePath("/settings/users");
    return { success: true };
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { active },
    });

    await logAuditEvent(
      active ? "ACTIVATE_USER" : "DEACTIVATE_USER",
      "User",
      userId,
      `Usuario ${user.name} marcado como ${active ? "Activo" : "Inactivo"}`,
      session.user.id
    );

    revalidatePath("/settings/users");
    return { success: true };
  } catch (error) {
    console.error("Error toggling user status:", error);
    return { error: "Error al cambiar estado del usuario" };
  }
}
