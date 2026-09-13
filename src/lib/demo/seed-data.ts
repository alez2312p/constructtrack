import { startOfDay, addDays, subDays, setHours, setMinutes } from "date-fns";

export interface DemoCategory {
  id: string;
  name: string;
  createdAt: Date;
}

export interface DemoLocation {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
}

export interface DemoMaterial {
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
}

export interface DemoMovement {
  id: string;
  type: "IN" | "OUT";
  quantity: number;
  date: Date;
  notes: string | null;
  materialId: string;
  userId: string;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DemoState {
  users: DemoUser[];
  categories: DemoCategory[];
  locations: DemoLocation[];
  materials: DemoMaterial[];
  movements: DemoMovement[];
}

export function getInitialSeedData(): DemoState {
  const users: DemoUser[] = [
    {
      id: "demo-admin-id",
      name: "Administrador Demo",
      email: "demo@constructtrack.com",
      role: "ADMIN",
    },
    {
      id: "demo-operator-id",
      name: "Operador Demo",
      email: "operador.demo@constructtrack.com",
      role: "OPERATOR",
    },
  ];

  const categories: DemoCategory[] = [
    { id: "cat-cementos", name: "Cementos", createdAt: new Date("2026-03-01T08:00:00.000Z") },
    { id: "cat-aridos", name: "Áridos", createdAt: new Date("2026-03-01T08:00:00.000Z") },
    { id: "cat-hierros", name: "Hierros y Aceros", createdAt: new Date("2026-03-01T08:00:00.000Z") },
    { id: "cat-maderas", name: "Maderas", createdAt: new Date("2026-03-01T08:00:00.000Z") },
    { id: "cat-pinturas", name: "Pinturas", createdAt: new Date("2026-03-01T08:00:00.000Z") },
    { id: "cat-ferreteria", name: "Ferretería", createdAt: new Date("2026-03-01T08:00:00.000Z") },
    { id: "cat-tubos", name: "Tubos y Conexiones", createdAt: new Date("2026-03-01T08:00:00.000Z") },
    { id: "cat-electricidad", name: "Electricidad", createdAt: new Date("2026-03-01T08:00:00.000Z") },
    { id: "cat-herramientas", name: "Herramientas", createdAt: new Date("2026-03-01T08:00:00.000Z") },
    { id: "cat-seguridad", name: "Seguridad", createdAt: new Date("2026-03-01T08:00:00.000Z") },
  ];

  const locations: DemoLocation[] = [
    { id: "loc-almacen-a", name: "Almacén A", description: "Sector principal - Entrada", createdAt: new Date("2026-03-01T08:00:00.000Z") },
    { id: "loc-almacen-b", name: "Almacén B", description: "Sector posterior", createdAt: new Date("2026-03-01T08:00:00.000Z") },
    { id: "loc-patio", name: "Patio", description: "Materiales grandes", createdAt: new Date("2026-03-01T08:00:00.000Z") },
    { id: "loc-bodega", name: "Bodega Oficina", description: "Suministros menores", createdAt: new Date("2026-03-01T08:00:00.000Z") },
    { id: "loc-zona-cubierta", name: "Zona Cubierta", description: "Materiales sensibles al clima", createdAt: new Date("2026-03-01T08:00:00.000Z") },
  ];

  const now = new Date();
  const baseDate = subDays(now, 5);
  const materialDates = [
    startOfDay(baseDate),
    setHours(setMinutes(startOfDay(baseDate), 0), 10),
    setHours(setMinutes(startOfDay(baseDate), 30), 14),
    startOfDay(addDays(baseDate, 1)),
    setHours(setMinutes(startOfDay(addDays(baseDate, 1)), 15), 9),
    setHours(setMinutes(startOfDay(addDays(baseDate, 1)), 45), 16),
    startOfDay(addDays(baseDate, 2)),
    setHours(setMinutes(startOfDay(addDays(baseDate, 2)), 20), 11),
    setHours(setMinutes(startOfDay(addDays(baseDate, 2)), 0), 15),
    startOfDay(addDays(baseDate, 3)),
    setHours(setMinutes(startOfDay(addDays(baseDate, 3)), 30), 8),
    setHours(setMinutes(startOfDay(addDays(baseDate, 3)), 45), 13),
  ];

  const rawMaterials = [
    { id: "mat-cemento-portland", name: "Cemento Portland", unit: "kg", currentStock: 500, minStock: 100, categoryId: "cat-cementos", locationId: "loc-almacen-a" },
    { id: "mat-cemento-blanco", name: "Cemento Blanco", unit: "kg", currentStock: 50, minStock: 20, categoryId: "cat-cementos", locationId: "loc-almacen-a" },
    { id: "mat-arena-fina", name: "Arena Fina", unit: "m3", currentStock: 15, minStock: 20, categoryId: "cat-aridos", locationId: "loc-patio" },
    { id: "mat-arena-gruesa", name: "Arena Gruesa", unit: "m3", currentStock: 20, minStock: 10, categoryId: "cat-aridos", locationId: "loc-patio" },
    { id: "mat-grava-34", name: "Grava 3/4", unit: "m3", currentStock: 8, minStock: 10, categoryId: "cat-aridos", locationId: "loc-patio" },
    { id: "mat-piedra-picada", name: "Piedra Picada", unit: "m3", currentStock: 12, minStock: 5, categoryId: "cat-aridos", locationId: "loc-patio" },
    { id: "mat-acero-3", name: "Acero de Refuerzo #3", unit: "kg", currentStock: 1200, minStock: 500, categoryId: "cat-hierros", locationId: "loc-almacen-b" },
    { id: "mat-acero-4", name: "Acero de Refuerzo #4", unit: "kg", currentStock: 800, minStock: 300, categoryId: "cat-hierros", locationId: "loc-almacen-b" },
    { id: "mat-varilla-corrugada", name: "Varilla Corrugada", unit: "unidades", currentStock: 150, minStock: 50, categoryId: "cat-hierros", locationId: "loc-almacen-b" },
    { id: "mat-madera-2x4", name: "Madera Pino 2x4", unit: "pie", currentStock: 500, minStock: 100, categoryId: "cat-maderas", locationId: "loc-patio" },
    { id: "mat-madera-1x6", name: "Madera Pino 1x6", unit: "pie", currentStock: 300, minStock: 80, categoryId: "cat-maderas", locationId: "loc-patio" },
    { id: "mat-triplay", name: "Triplay", unit: "planchas", currentStock: 25, minStock: 10, categoryId: "cat-maderas", locationId: "loc-almacen-a" },
    { id: "mat-pintura-blanca", name: "Pintura Esmalte Blanco", unit: "galones", currentStock: 15, minStock: 10, categoryId: "cat-pinturas", locationId: "loc-zona-cubierta" },
    { id: "mat-pintura-negra", name: "Pintura Esmalte Negro", unit: "galones", currentStock: 8, minStock: 5, categoryId: "cat-pinturas", locationId: "loc-zona-cubierta" },
    { id: "mat-thinner", name: "Thinner", unit: "litros", currentStock: 20, minStock: 10, categoryId: "cat-pinturas", locationId: "loc-zona-cubierta" },
    { id: "mat-clavos-2", name: 'Clavos 2"', unit: "kg", currentStock: 45, minStock: 20, categoryId: "cat-ferreteria", locationId: "loc-almacen-a" },
    { id: "mat-clavos-3", name: 'Clavos 3"', unit: "kg", currentStock: 30, minStock: 15, categoryId: "cat-ferreteria", locationId: "loc-almacen-a" },
    { id: "mat-alambre-negro", name: "Alambre Negro", unit: "kg", currentStock: 25, minStock: 10, categoryId: "cat-ferreteria", locationId: "loc-almacen-a" },
    { id: "mat-tubo-pvc-2", name: 'Tubo PVC 2"', unit: "unidades", currentStock: 100, minStock: 50, categoryId: "cat-tubos", locationId: "loc-almacen-b" },
    { id: "mat-tubo-pvc-4", name: 'Tubo PVC 4"', unit: "unidades", currentStock: 50, minStock: 20, categoryId: "cat-tubos", locationId: "loc-almacen-b" },
    { id: "mat-codo-pvc-2", name: 'Codo PVC 2" 90°', unit: "unidades", currentStock: 200, minStock: 50, categoryId: "cat-tubos", locationId: "loc-almacen-b" },
  ];

  const materials: DemoMaterial[] = rawMaterials.map((data, index) => {
    const createdAt = materialDates[index % materialDates.length];
    return {
      ...data,
      active: true,
      deletedAt: null,
      createdAt,
      updatedAt: createdAt,
    };
  });

  const movements: DemoMovement[] = [];

  // Initial stock movements
  materials.forEach((m, idx) => {
    if (m.currentStock > 0) {
      movements.push({
        id: `mov-init-${idx + 1}`,
        type: "IN",
        quantity: m.currentStock,
        date: m.createdAt,
        notes: "Stock inicial",
        materialId: m.id,
        userId: "demo-admin-id",
      });
    }
  });

  // Sample historical movements
  movements.push(
    // 3 days ago
    {
      id: "mov-sample-1",
      type: "OUT",
      quantity: 200,
      date: subDays(now, 3),
      notes: "Proyecto Residencial Solana",
      materialId: "mat-acero-3",
      userId: "demo-operator-id",
    },
    // 2 days ago
    {
      id: "mov-sample-2",
      type: "IN",
      quantity: 100,
      date: subDays(now, 2),
      notes: "Compra a proveedor Ferretería Central",
      materialId: "mat-clavos-2",
      userId: "demo-admin-id",
    },
    // Yesterday
    {
      id: "mov-sample-3",
      type: "OUT",
      quantity: 50,
      date: subDays(now, 1),
      notes: "Construcción Torre A - Piso 1",
      materialId: "mat-cemento-portland",
      userId: "demo-operator-id",
    },
    {
      id: "mov-sample-4",
      type: "OUT",
      quantity: 3,
      date: subDays(now, 1),
      notes: "Proyecto Biblioteca",
      materialId: "mat-arena-fina",
      userId: "demo-operator-id",
    },
    // Today
    {
      id: "mov-sample-5",
      type: "OUT",
      quantity: 5,
      date: setHours(startOfDay(now), 8),
      notes: "Mantenimiento oficina",
      materialId: "mat-clavos-2",
      userId: "demo-operator-id",
    },
    {
      id: "mov-sample-6",
      type: "IN",
      quantity: 10,
      date: setHours(startOfDay(now), 10),
      notes: "Reposición de inventario",
      materialId: "mat-pintura-blanca",
      userId: "demo-admin-id",
    },
    {
      id: "mov-sample-7",
      type: "OUT",
      quantity: 3,
      date: setHours(startOfDay(now), 12),
      notes: "Pintura fachada edificio",
      materialId: "mat-pintura-blanca",
      userId: "demo-operator-id",
    }
  );

  return {
    users,
    categories,
    locations,
    materials,
    movements,
  };
}
