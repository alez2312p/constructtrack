import {
  getDemoState,
  resetDemoData,
  getDemoCategories,
  createDemoCategory,
  updateDemoCategory,
  deleteDemoCategory,
  getDemoLocations,
  createDemoLocation,
  updateDemoLocation,
  deleteDemoLocation,
  getDemoMaterials,
  getDemoMaterialById,
  createDemoMaterial,
  updateDemoMaterial,
  deleteDemoMaterial,
  getDemoLowStockMaterials,
  getDemoTotalMaterialsCount,
  getDemoRecentMovements,
  registerDemoMovement,
  getDemoMovementsHistory,
} from "@/lib/demo/demo-store";

describe("Demo Store & In-Memory Isolation", () => {
  const sessionId = "test-session-" + Date.now();

  beforeEach(async () => {
    await resetDemoData(sessionId);
  });

  test("initializes with seed data without touching the database", async () => {
    const state = await getDemoState(sessionId);
    expect(state.categories.length).toBe(10);
    expect(state.locations.length).toBe(5);
    expect(state.materials.length).toBe(21);
    expect(state.movements.length).toBeGreaterThan(20);
  });

  test("demo categories CRUD works correctly in memory", async () => {
    const initialCategories = await getDemoCategories(sessionId);
    expect(initialCategories.length).toBe(10);

    // Create
    const createRes = await createDemoCategory(sessionId, { name: "Nueva Categoría Demo" });
    expect(createRes.success).toBe(true);
    expect(createRes.category.name).toBe("Nueva Categoría Demo");

    // Verify created
    const categoriesAfterCreate = await getDemoCategories(sessionId);
    expect(categoriesAfterCreate.length).toBe(11);

    // Update
    const updateRes = await updateDemoCategory(sessionId, createRes.category.id, {
      name: "Categoría Modificada",
    });
    expect(updateRes.success).toBe(true);

    // Delete unused category
    const deleteRes = await deleteDemoCategory(sessionId, createRes.category.id);
    expect(deleteRes.success).toBe(true);

    // Cannot delete category in use by materials
    const usedCat = initialCategories.find((c) => c.name === "Cementos")!;
    const failDeleteRes = await deleteDemoCategory(sessionId, usedCat.id);
    expect(failDeleteRes.error).toBeDefined();
  });

  test("demo locations CRUD works correctly in memory", async () => {
    const initialLocations = await getDemoLocations(sessionId);
    expect(initialLocations.length).toBe(5);

    // Create
    const createRes = await createDemoLocation(sessionId, {
      name: "Nuevo Depósito",
      description: "Depósito de prueba",
    });
    expect(createRes.success).toBe(true);

    // Update
    const updateRes = await updateDemoLocation(sessionId, createRes.location.id, {
      name: "Depósito Actualizado",
      description: "Nueva descripción",
    });
    expect(updateRes.success).toBe(true);

    // Delete unused location
    const deleteRes = await deleteDemoLocation(sessionId, createRes.location.id);
    expect(deleteRes.success).toBe(true);

    // Cannot delete location in use
    const usedLoc = initialLocations.find((l) => l.name === "Almacén A")!;
    const failDelete = await deleteDemoLocation(sessionId, usedLoc.id);
    expect(failDelete.error).toBeDefined();
  });

  test("demo materials CRUD & low stock detection", async () => {
    const totalCount = await getDemoTotalMaterialsCount(sessionId);
    expect(totalCount).toBe(21);

    const lowStock = await getDemoLowStockMaterials(sessionId);
    expect(lowStock.length).toBeGreaterThan(0);

    // Create material with initial stock
    await createDemoMaterial(
      sessionId,
      {
        name: "Ladrillo Hueco",
        unit: "unidades",
        minStock: 50,
        initialStock: 200,
        categoryId: "cat-cementos",
        locationId: "loc-almacen-a",
      },
      "demo-admin-id"
    );

    const countAfter = await getDemoTotalMaterialsCount(sessionId);
    expect(countAfter).toBe(22);

    const materials = await getDemoMaterials(sessionId);
    const createdMat = materials.find((m) => m.name === "Ladrillo Hueco");
    expect(createdMat).toBeDefined();
    expect(createdMat?.currentStock).toBe(200);
    expect(createdMat?.category?.name).toBe("Cementos");

    // Update material
    await updateDemoMaterial(sessionId, createdMat!.id, {
      minStock: 80,
    });
    const updatedMat = await getDemoMaterialById(sessionId, createdMat!.id);
    expect(updatedMat?.minStock).toBe(80);

    // Delete material
    await deleteDemoMaterial(sessionId, createdMat!.id);
    const countAfterDelete = await getDemoTotalMaterialsCount(sessionId);
    expect(countAfterDelete).toBe(21);
  });

  test("demo movements registration and stock updates", async () => {
    const materials = await getDemoMaterials(sessionId);
    const cement = materials.find((m) => m.name === "Cemento Portland")!;
    const initialStock = cement.currentStock;

    // Register IN movement
    const inRes = await registerDemoMovement(
      sessionId,
      {
        materialId: cement.id,
        type: "IN",
        quantity: 50,
        date: new Date(),
        notes: "Entrada de prueba",
      },
      "demo-admin-id"
    );

    expect(inRes.success).toBe(true);
    expect(inRes.newStock).toBe(initialStock + 50);

    // Register OUT movement
    const outRes = await registerDemoMovement(
      sessionId,
      {
        materialId: cement.id,
        type: "OUT",
        quantity: 100,
        date: new Date(),
        notes: "Salida para obra",
      },
      "demo-admin-id"
    );

    expect(outRes.success).toBe(true);
    expect(outRes.newStock).toBe(initialStock + 50 - 100);

    // OUT movement fails if stock is insufficient
    await expect(
      registerDemoMovement(
        sessionId,
        {
          materialId: cement.id,
          type: "OUT",
          quantity: 999999,
          date: new Date(),
        },
        "demo-admin-id"
      )
    ).rejects.toThrow("Stock insuficiente para la salida");
  });

  test("demo recent movements and movements history with filters", async () => {
    const recent = await getDemoRecentMovements(sessionId, false, 5);
    expect(recent.length).toBe(5);

    const history = await getDemoMovementsHistory(sessionId, {
      limit: 10,
    });
    expect(history.movements.length).toBe(10);
    expect(history.totalCount).toBeGreaterThan(20);
    expect(history.totalIn).toBeGreaterThan(0);
    expect(history.totalOut).toBeGreaterThan(0);
  });

  test("resetDemoData restores fresh seed state", async () => {
    // Delete something
    const materials = await getDemoMaterials(sessionId);
    await deleteDemoMaterial(sessionId, materials[0].id);
    expect(await getDemoTotalMaterialsCount(sessionId)).toBe(20);

    // Reset
    await resetDemoData(sessionId);
    expect(await getDemoTotalMaterialsCount(sessionId)).toBe(21);
  });
});
