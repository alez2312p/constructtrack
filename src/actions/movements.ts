'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { movementSchema } from '@/lib/validation/schemas';
import { assertSession } from '@/lib/auth/assert-session';

export async function registerMovement(formData: FormData) {
  // 1️⃣ Validate session
  const session = await assertSession(); // throws if not authenticated

  // 2️⃣ Validate input with Zod
  const validated = movementSchema.safeParse({
    materialId: formData.get('materialId'),
    type: formData.get('type'),
    quantity: formData.get('quantity'),
    date: formData.get('date'),
    notes: formData.get('notes'),
  });

  if (!validated.success) {
    return {
      error: 'Datos de entrada inválidos',
      fieldErrors: validated.error.issues.reduce<Record<string, string>>((acc, issue) => {
        const path = issue.path[0] ?? 'unknown';
        return { ...acc, [path]: issue.message };
      }, {}),
    };
  }

  const { materialId, type, quantity, date, notes } = validated.data;

  // 3️⃣ Use a transaction to prevent race conditions
  const result = await prisma.$transaction(async (tx) => {
    // Fetch material with lock
    const material = await tx.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      throw new Error('Material no encontrado');
    }

    // Calculate new stock
    const newStock =
      type === 'IN'
        ? material.currentStock + quantity
        : material.currentStock - quantity;

    if (newStock < 0) {
      throw new Error('Stock insuficiente para la salida');
    }

    // Parse datetime-local string (YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss)
    if (!date || typeof date !== 'string' || !date.includes('T')) {
      throw new Error(
        `Invalid date format received: ${date}. Expected format: YYYY-MM-DDTHH:mm`,
      );
    }

    const [datePart, timePart] = date.split('T');
    if (!datePart || !timePart) {
      throw new Error(
        `Invalid date format: missing date or time part. Date: ${date}`,
      );
    }

    const dateComponents = datePart.split('-');
    if (dateComponents.length !== 3) {
      throw new Error(
        `Invalid date format: expected YYYY-MM-DD, got: ${datePart}`,
      );
    }

    const year = parseInt(dateComponents[0], 10);
    const month = parseInt(dateComponents[1], 10);
    const day = parseInt(dateComponents[2], 10);

    const timeComponents = timePart.split(':');
    const hour = parseInt(timeComponents[0], 10);
    const minute =
      timeComponents.length > 1 ? parseInt(timeComponents[1], 10) : 0;

    // Validate ranges
    if (
      isNaN(year) ||
      isNaN(month) ||
      isNaN(day) ||
      isNaN(hour) ||
      isNaN(minute) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31 ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      throw new Error(
        `Invalid date values: year=${year}, month=${month}, day=${day}, hour=${hour}, minute=${minute}`,
      );
    }

    // Create Date in local time (Prisma will store UTC)
    const movementDate = new Date(year, month - 1, day, hour, minute, 0, 0);

    // Create movement
    await tx.movement.create({
      data: {
        type,
        quantity,
        date: movementDate,
        notes: notes ?? null,
        materialId,
        userId: session.user.id,
      },
    });

    // Update material stock
    await tx.material.update({
      where: { id: materialId },
      data: { currentStock: newStock },
    });

    return {
      success: true,
      type,
      quantity,
      materialName: material.name,
      materialUnit: material.unit,
      newStock,
      wasLowStock: material.currentStock <= material.minStock,
      willBeLowStock: newStock <= material.minStock,
    };
  });

  // Revalidate relevant paths
  revalidatePath('/inventory');
  revalidatePath('/dashboard');
  revalidatePath('/movements');
  revalidatePath('/movements/history');

  return result;
}

export async function getMaterialsForSelect() {
  try {
    const result = await prisma.material.findMany({
      select: {
        id: true,
        name: true,
        unit: true,
        currentStock: true,
        minStock: true,
        createdAt: true,
        category: { select: { name: true } },
        location: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });
    return result;
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
}