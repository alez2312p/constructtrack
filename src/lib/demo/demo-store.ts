import { Redis } from "@upstash/redis";
import {
  getInitialSeedData,
  DemoState,
  DemoCategory,
  DemoLocation,
  DemoMaterial,
  DemoMovement,
} from "./seed-data";
import { startOfDay, endOfDay, subDays, isAfter, isBefore } from "date-fns";

const globalForDemo = globalThis as unknown as {
  demoSessions: Map<string, { state: DemoState; expiresAt: number }> | undefined;
};

const demoSessions = globalForDemo.demoSessions ?? new Map<string, { state: DemoState; expiresAt: number }>();
if (process.env.NODE_ENV !== "production") {
  globalForDemo.demoSessions = demoSessions;
}

function getRedis() {
  const redisUrl = process.env.UPSTASH_REDIS_URL;
  const redisToken = process.env.UPSTASH_REDIS_TOKEN;
  if (!redisUrl || !redisToken) return null;
  try {
    return new Redis({ url: redisUrl, token: redisToken });
  } catch {
    return null;
  }
}

function reviveDates(state: DemoState): DemoState {
  return {
    ...state,
    categories: state.categories.map((c) => ({
      ...c,
      createdAt: new Date(c.createdAt),
    })),
    locations: state.locations.map((l) => ({
      ...l,
      createdAt: new Date(l.createdAt),
    })),
    materials: state.materials.map((m) => ({
      ...m,
      createdAt: new Date(m.createdAt),
      updatedAt: new Date(m.updatedAt),
      deletedAt: m.deletedAt ? new Date(m.deletedAt) : null,
    })),
    movements: state.movements.map((mov) => ({
      ...mov,
      date: new Date(mov.date),
    })),
  };
}

export async function getDemoState(sessionId: string = "default-demo"): Promise<DemoState> {
  const memoryEntry = demoSessions.get(sessionId);
  if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
    return memoryEntry.state;
  }

  const redis = getRedis();
  if (redis) {
    try {
      const cached = await redis.get<DemoState>(`ct:demo:${sessionId}`);
      if (cached) {
        const state = reviveDates(cached);
        demoSessions.set(sessionId, { state, expiresAt: Date.now() + 1000 * 60 * 60 * 2 });
        return state;
      }
    } catch (e) {
      console.warn("Error reading demo state from Redis:", e);
    }
  }

  const freshState = getInitialSeedData();
  await saveDemoState(sessionId, freshState);
  return freshState;
}

export async function saveDemoState(sessionId: string = "default-demo", state: DemoState): Promise<void> {
  demoSessions.set(sessionId, { state, expiresAt: Date.now() + 1000 * 60 * 60 * 2 });

  const redis = getRedis();
  if (redis) {
    try {
      await redis.set(`ct:demo:${sessionId}`, state, { ex: 7200 }); // 2 hours
    } catch (e) {
      console.warn("Error saving demo state to Redis:", e);
    }
  }
}

export async function resetDemoData(sessionId: string = "default-demo"): Promise<DemoState> {
  const freshState = getInitialSeedData();
  await saveDemoState(sessionId, freshState);
  return freshState;
}

// ==================== CATEGORIES ====================

export async function getDemoCategories(sessionId?: string): Promise<DemoCategory[]> {
  const state = await getDemoState(sessionId);
  return [...state.categories].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getDemoCategoriesForSelect(sessionId?: string) {
  const categories = await getDemoCategories(sessionId);
  return categories.map((c) => ({ id: c.id, name: c.name }));
}

export async function createDemoCategory(sessionId: string | undefined, data: { name: string }) {
  const state = await getDemoState(sessionId);
  const newCategory: DemoCategory = {
    id: `cat-demo-${Date.now()}`,
    name: data.name.trim(),
    createdAt: new Date(),
  };
  state.categories.push(newCategory);
  await saveDemoState(sessionId, state);
  return { success: true, category: newCategory };
}

export async function updateDemoCategory(sessionId: string | undefined, id: string, data: { name: string }) {
  const state = await getDemoState(sessionId);
  const cat = state.categories.find((c) => c.id === id);
  if (!cat) return { error: "Categoría no encontrada" };
  cat.name = data.name.trim();
  await saveDemoState(sessionId, state);
  return { success: true };
}

export async function deleteDemoCategory(sessionId: string | undefined, id: string) {
  const state = await getDemoState(sessionId);
  const inUse = state.materials.filter((m) => m.active && m.categoryId === id).length;
  if (inUse > 0) {
    return { error: `No se puede eliminar. Hay ${inUse} materiales usando esta categoría` };
  }
  state.categories = state.categories.filter((c) => c.id !== id);
  await saveDemoState(sessionId, state);
  return { success: true };
}

// ==================== LOCATIONS ====================

export async function getDemoLocations(sessionId?: string): Promise<DemoLocation[]> {
  const state = await getDemoState(sessionId);
  return [...state.locations].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getDemoLocationsForSelect(sessionId?: string) {
  const locations = await getDemoLocations(sessionId);
  return locations.map((l) => ({ id: l.id, name: l.name }));
}

export async function createDemoLocation(
  sessionId: string | undefined,
  data: { name: string; description?: string | null }
) {
  const state = await getDemoState(sessionId);
  const newLocation: DemoLocation = {
    id: `loc-demo-${Date.now()}`,
    name: data.name.trim(),
    description: data.description?.trim() || null,
    createdAt: new Date(),
  };
  state.locations.push(newLocation);
  await saveDemoState(sessionId, state);
  return { success: true, location: newLocation };
}

export async function updateDemoLocation(
  sessionId: string | undefined,
  id: string,
  data: { name?: string; description?: string | null }
) {
  const state = await getDemoState(sessionId);
  const loc = state.locations.find((l) => l.id === id);
  if (!loc) return { error: "Ubicación no encontrada" };
  if (data.name !== undefined) loc.name = data.name.trim();
  if (data.description !== undefined) loc.description = data.description?.trim() || null;
  await saveDemoState(sessionId, state);
  return { success: true };
}

export async function deleteDemoLocation(sessionId: string | undefined, id: string) {
  const state = await getDemoState(sessionId);
  const inUse = state.materials.filter((m) => m.active && m.locationId === id).length;
  if (inUse > 0) {
    return { error: `No se puede eliminar. Hay ${inUse} materiales en esta ubicación` };
  }
  state.locations = state.locations.filter((l) => l.id !== id);
  await saveDemoState(sessionId, state);
  return { success: true };
}

// ==================== MATERIALS ====================

function populateMaterialRelations(material: DemoMaterial, state: DemoState) {
  const category = material.categoryId
    ? state.categories.find((c) => c.id === material.categoryId) || null
    : null;
  const location = material.locationId
    ? state.locations.find((l) => l.id === material.locationId) || null
    : null;
  return {
    ...material,
    category,
    location,
  };
}

export async function getDemoMaterials(sessionId?: string, cursor?: string, limit: number = 50) {
  const state = await getDemoState(sessionId);
  let activeMaterials = state.materials
    .filter((m) => m.active && !m.deletedAt)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id.localeCompare(a.id));

  if (cursor) {
    const cursorIdx = activeMaterials.findIndex((m) => m.id === cursor);
    if (cursorIdx !== -1) {
      activeMaterials = activeMaterials.slice(cursorIdx + 1);
    }
  }

  const result = activeMaterials.slice(0, limit + 1).map((m) => populateMaterialRelations(m, state));
  return result;
}

export async function getDemoMaterialById(sessionId: string | undefined, id: string) {
  const state = await getDemoState(sessionId);
  const material = state.materials.find((m) => m.id === id && m.active);
  if (!material) return null;
  return populateMaterialRelations(material, state);
}

export async function getDemoLowStockMaterials(sessionId?: string) {
  const state = await getDemoState(sessionId);
  return state.materials
    .filter((m) => m.active && !m.deletedAt && m.currentStock <= m.minStock)
    .map((m) => populateMaterialRelations(m, state));
}

export async function getDemoTotalMaterialsCount(sessionId?: string): Promise<number> {
  const state = await getDemoState(sessionId);
  return state.materials.filter((m) => m.active && !m.deletedAt).length;
}

export async function createDemoMaterial(
  sessionId: string | undefined,
  data: {
    name: string;
    unit: string;
    minStock: number;
    initialStock?: number;
    categoryId?: string | null;
    locationId?: string | null;
  },
  userId: string = "demo-admin-id"
) {
  const state = await getDemoState(sessionId);
  const now = new Date();
  const initialStockValue = data.initialStock ?? 0;
  const materialId = `mat-demo-${Date.now()}`;

  const newMaterial: DemoMaterial = {
    id: materialId,
    name: data.name.trim(),
    unit: data.unit.trim(),
    minStock: data.minStock,
    currentStock: initialStockValue,
    active: true,
    deletedAt: null,
    categoryId: data.categoryId || null,
    locationId: data.locationId || null,
    createdAt: now,
    updatedAt: now,
  };

  state.materials.unshift(newMaterial);

  if (initialStockValue > 0) {
    state.movements.unshift({
      id: `mov-demo-${Date.now()}`,
      type: "IN",
      quantity: initialStockValue,
      date: now,
      notes: "Stock inicial",
      materialId: materialId,
      userId: userId,
    });
  }

  await saveDemoState(sessionId, state);
  return { success: true };
}

export async function updateDemoMaterial(
  sessionId: string | undefined,
  id: string,
  data: {
    name?: string;
    unit?: string;
    minStock?: number;
    categoryId?: string | null;
    locationId?: string | null;
  }
) {
  const state = await getDemoState(sessionId);
  const mat = state.materials.find((m) => m.id === id);
  if (!mat) return { error: "Material no encontrado" };

  if (data.name !== undefined) mat.name = data.name.trim();
  if (data.unit !== undefined) mat.unit = data.unit.trim();
  if (data.minStock !== undefined) mat.minStock = data.minStock;
  if (data.categoryId !== undefined) mat.categoryId = data.categoryId;
  if (data.locationId !== undefined) mat.locationId = data.locationId;
  mat.updatedAt = new Date();

  await saveDemoState(sessionId, state);
  return { success: true };
}

export async function deleteDemoMaterial(sessionId: string | undefined, id: string) {
  const state = await getDemoState(sessionId);
  const mat = state.materials.find((m) => m.id === id);
  if (!mat) return { error: "Material no encontrado" };

  mat.active = false;
  mat.deletedAt = new Date();

  await saveDemoState(sessionId, state);
  return { success: true };
}

export async function getDemoMaterialsForSelect(sessionId?: string) {
  const state = await getDemoState(sessionId);
  return state.materials
    .filter((m) => m.active && !m.deletedAt)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((m) => ({
      id: m.id,
      name: m.name,
      unit: m.unit,
      currentStock: m.currentStock,
      minStock: m.minStock,
      createdAt: m.createdAt,
      category: m.categoryId ? { name: state.categories.find((c) => c.id === m.categoryId)?.name || "" } : null,
      location: m.locationId ? { name: state.locations.find((l) => l.id === m.locationId)?.name || "" } : null,
    }));
}

// ==================== MOVEMENTS ====================

export async function getDemoRecentMovements(
  sessionId: string | undefined,
  onlyToday: boolean,
  limit?: number
) {
  const state = await getDemoState(sessionId);
  let movements = [...state.movements];

  if (onlyToday) {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    movements = movements.filter((m) => isAfter(m.date, todayStart) && isBefore(m.date, todayEnd));
  }

  movements.sort((a, b) => b.date.getTime() - a.date.getTime() || b.id.localeCompare(a.id));

  if (limit && limit > 0) {
    movements = movements.slice(0, limit);
  }

  return movements.map((mov) => {
    const material = state.materials.find((m) => m.id === mov.materialId);
    const user = state.users.find((u) => u.id === mov.userId) || {
      id: mov.userId,
      name: "Usuario Demo",
    };
    const category = material?.categoryId
      ? state.categories.find((c) => c.id === material.categoryId)
      : null;
    const location = material?.locationId
      ? state.locations.find((l) => l.id === material.locationId)
      : null;

    return {
      id: mov.id,
      type: mov.type,
      quantity: mov.quantity,
      date: mov.date,
      notes: mov.notes,
      user: {
        id: user.id,
        name: user.name,
      },
      material: {
        id: material?.id || "",
        name: material?.name || "Material desconocido",
        unit: material?.unit || "",
        category: category ? { name: category.name } : null,
        location: location ? { name: location.name } : null,
      },
    };
  });
}

export async function registerDemoMovement(
  sessionId: string | undefined,
  data: {
    materialId: string;
    type: "IN" | "OUT";
    quantity: number;
    date: Date;
    notes?: string | null;
  },
  userId: string = "demo-admin-id"
) {
  const state = await getDemoState(sessionId);
  const material = state.materials.find((m) => m.id === data.materialId);
  if (!material) {
    throw new Error("Material no encontrado");
  }

  const newStock =
    data.type === "IN"
      ? material.currentStock + data.quantity
      : material.currentStock - data.quantity;

  if (newStock < 0) {
    throw new Error("Stock insuficiente para la salida");
  }

  const wasLowStock = material.currentStock <= material.minStock;
  const willBeLowStock = newStock <= material.minStock;

  material.currentStock = newStock;
  material.updatedAt = new Date();

  const newMovement: DemoMovement = {
    id: `mov-demo-${Date.now()}`,
    type: data.type,
    quantity: data.quantity,
    date: data.date,
    notes: data.notes ?? null,
    materialId: data.materialId,
    userId: userId,
  };

  state.movements.unshift(newMovement);
  await saveDemoState(sessionId, state);

  return {
    success: true,
    type: data.type,
    quantity: data.quantity,
    materialName: material.name,
    materialUnit: material.unit,
    newStock,
    wasLowStock,
    willBeLowStock,
  };
}

export async function getDemoMovementsHistory(
  sessionId: string | undefined,
  options: {
    days?: string;
    from?: string;
    to?: string;
    materialId?: string;
    type?: string;
    cursor?: string;
    limit?: number;
  }
) {
  const state = await getDemoState(sessionId);
  const { days, from, to, materialId, type, cursor, limit = 20 } = options;

  let filtered = [...state.movements];

  // Date filtering
  if (days) {
    const daysNum = parseInt(days, 10);
    if (!isNaN(daysNum)) {
      const sinceDate = subDays(new Date(), daysNum);
      filtered = filtered.filter((m) => isAfter(m.date, sinceDate));
    }
  } else if (from || to) {
    if (from) {
      const fromDate = startOfDay(new Date(from));
      filtered = filtered.filter((m) => isAfter(m.date, fromDate) || m.date.getTime() === fromDate.getTime());
    }
    if (to) {
      const toDate = endOfDay(new Date(to));
      filtered = filtered.filter((m) => isBefore(m.date, toDate) || m.date.getTime() === toDate.getTime());
    }
  }

  // Material filtering
  if (materialId) {
    filtered = filtered.filter((m) => m.materialId === materialId);
  }

  // Type filtering
  if (type) {
    filtered = filtered.filter((m) => m.type === type);
  }

  // Aggregates
  const totalCount = filtered.length;
  const totalIn = filtered
    .filter((m) => m.type === "IN")
    .reduce((sum, m) => sum + m.quantity, 0);
  const totalOut = filtered
    .filter((m) => m.type === "OUT")
    .reduce((sum, m) => sum + m.quantity, 0);

  // Sorting
  filtered.sort((a, b) => b.date.getTime() - a.date.getTime() || b.id.localeCompare(a.id));

  // Pagination cursor
  if (cursor) {
    const cursorIdx = filtered.findIndex((m) => m.id === cursor);
    if (cursorIdx !== -1) {
      filtered = filtered.slice(cursorIdx + 1);
    }
  }

  const hasNextPage = filtered.length > limit;
  const paginated = (hasNextPage ? filtered.slice(0, limit) : filtered).map((m) => {
    const material = state.materials.find((mat) => mat.id === m.materialId);
    const user = state.users.find((u) => u.id === m.userId) || { id: m.userId, name: "Usuario Demo" };
    const category = material?.categoryId ? state.categories.find((c) => c.id === material.categoryId) : null;
    const location = material?.locationId ? state.locations.find((l) => l.id === material.locationId) : null;

    return {
      id: m.id,
      type: m.type,
      quantity: m.quantity,
      date: m.date,
      notes: m.notes,
      material: {
        id: material?.id || "",
        name: material?.name || "Material",
        unit: material?.unit || "",
        currentStock: material?.currentStock || 0,
        minStock: material?.minStock || 0,
        categoryId: material?.categoryId || "",
        locationId: material?.locationId || "",
        category: category ? { name: category.name } : null,
        location: location ? { name: location.name } : null,
      },
      user: {
        id: user.id,
        name: user.name,
      },
    };
  });

  const nextCursor = hasNextPage && paginated.length > 0 ? paginated[paginated.length - 1].id : null;
  const materials = state.materials
    .filter((m) => m.active && !m.deletedAt)
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    movements: paginated,
    hasNextPage,
    nextCursor,
    totalCount,
    totalIn,
    totalOut,
    materials,
  };
}
