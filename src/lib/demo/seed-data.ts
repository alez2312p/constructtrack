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

export interface DemoProject {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  address: string | null;
  status: "ACTIVE" | "COMPLETED" | "PAUSED";
  budget: number | null;
  createdAt: Date;
}

export interface DemoSupplier {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  taxId: string | null;
  address: string | null;
  createdAt: Date;
}

export interface DemoMaterial {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  unitCost: number;
  sku: string | null;
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
  unitPrice: number | null;
  receiverName: string | null;
  signature: string | null;
  materialId: string;
  userId: string;
  projectId: string | null;
  supplierId: string | null;
}

export interface DemoAuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  userId: string | null;
  createdAt: Date;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

export interface DemoState {
  users: DemoUser[];
  categories: DemoCategory[];
  locations: DemoLocation[];
  projects: DemoProject[];
  suppliers: DemoSupplier[];
  materials: DemoMaterial[];
  movements: DemoMovement[];
  auditLogs: DemoAuditLog[];
}

export function getInitialSeedData(): DemoState {
  const users: DemoUser[] = [
    {
      id: "demo-admin-id",
      name: "Administrador Demo",
      email: "demo@constructtrack.com",
      role: "ADMIN",
      active: true,
    },
    {
      id: "demo-operator-id",
      name: "Operador Demo",
      email: "operador.demo@constructtrack.com",
      role: "OPERATOR",
      active: true,
    },
    {
      id: "demo-auditor-id",
      name: "Auditor de Calidad",
      email: "auditor@constructtrack.com",
      role: "AUDITOR",
      active: true,
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

  const projects: DemoProject[] = [
    {
      id: "proj-solana",
      name: "Residencial Solana - Torre A",
      code: "OBR-2026-01",
      description: "Construcción de edificio residencial de 14 pisos",
      address: "Av. Las Palmeras 450",
      status: "ACTIVE",
      budget: 350000,
      createdAt: new Date("2026-01-15T09:00:00.000Z"),
    },
    {
      id: "proj-biblioteca",
      name: "Proyecto Biblioteca Central",
      code: "OBR-2026-02",
      description: "Ampliación y modernización de salas de lectura",
      address: "Calle 10 con Carrera 5",
      status: "ACTIVE",
      budget: 120000,
      createdAt: new Date("2026-02-01T09:00:00.000Z"),
    },
    {
      id: "proj-puente",
      name: "Puente Peatonal Norte",
      code: "OBR-2026-03",
      description: "Estructura metálica y acceso peatonal",
      address: "Autopista Norte Km 12",
      status: "PAUSED",
      budget: 85000,
      createdAt: new Date("2026-02-20T09:00:00.000Z"),
    },
  ];

  const suppliers: DemoSupplier[] = [
    {
      id: "sup-ferreteria-central",
      name: "Ferretería Central S.A.S.",
      contactName: "Carlos Méndez",
      phone: "+57 310 456 7890",
      email: "ventas@ferreteriacentral.com",
      taxId: "900.123.456-1",
      address: "Zona Industrial Lote 14",
      createdAt: new Date("2026-01-10T08:00:00.000Z"),
    },
    {
      id: "sup-cementos-andina",
      name: "Cementos y Concretos Andina",
      contactName: "Laura Restrepo",
      phone: "+57 320 654 3210",
      email: "pedidos@cementosandina.com",
      taxId: "800.789.123-4",
      address: "Vía Panamericana Km 4",
      createdAt: new Date("2026-01-12T08:00:00.000Z"),
    },
    {
      id: "sup-aceros-valle",
      name: "Aceros y Perfiles del Valle",
      contactName: "Jorge Ramírez",
      phone: "+57 315 987 6543",
      email: "comercial@acerosdelvalle.com",
      taxId: "901.345.678-9",
      address: "Calle 26 # 68-35",
      createdAt: new Date("2026-01-18T08:00:00.000Z"),
    },
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
    { id: "mat-cemento-portland", name: "Cemento Portland", unit: "kg", currentStock: 500, minStock: 100, unitCost: 0.25, sku: "CEM-PORT-01", categoryId: "cat-cementos", locationId: "loc-almacen-a" },
    { id: "mat-cemento-blanco", name: "Cemento Blanco", unit: "kg", currentStock: 50, minStock: 20, unitCost: 0.45, sku: "CEM-BLAN-02", categoryId: "cat-cementos", locationId: "loc-almacen-a" },
    { id: "mat-arena-fina", name: "Arena Fina", unit: "m3", currentStock: 15, minStock: 20, unitCost: 28.00, sku: "ARI-ARF-01", categoryId: "cat-aridos", locationId: "loc-patio" },
    { id: "mat-arena-gruesa", name: "Arena Gruesa", unit: "m3", currentStock: 20, minStock: 10, unitCost: 24.50, sku: "ARI-ARG-02", categoryId: "cat-aridos", locationId: "loc-patio" },
    { id: "mat-grava-34", name: "Grava 3/4", unit: "m3", currentStock: 8, minStock: 10, unitCost: 32.00, sku: "ARI-GRA-03", categoryId: "cat-aridos", locationId: "loc-patio" },
    { id: "mat-piedra-picada", name: "Piedra Picada", unit: "m3", currentStock: 12, minStock: 5, unitCost: 30.00, sku: "ARI-PIE-04", categoryId: "cat-aridos", locationId: "loc-patio" },
    { id: "mat-acero-3", name: "Acero de Refuerzo #3", unit: "kg", currentStock: 1200, minStock: 500, unitCost: 1.15, sku: "ACE-REF3-01", categoryId: "cat-hierros", locationId: "loc-almacen-b" },
    { id: "mat-acero-4", name: "Acero de Refuerzo #4", unit: "kg", currentStock: 800, minStock: 300, unitCost: 1.25, sku: "ACE-REF4-02", categoryId: "cat-hierros", locationId: "loc-almacen-b" },
    { id: "mat-varilla-corrugada", name: "Varilla Corrugada", unit: "unidades", currentStock: 150, minStock: 50, unitCost: 8.90, sku: "ACE-VARC-03", categoryId: "cat-hierros", locationId: "loc-almacen-b" },
    { id: "mat-madera-2x4", name: "Madera Pino 2x4", unit: "pie", currentStock: 500, minStock: 100, unitCost: 2.10, sku: "MAD-PIN24-01", categoryId: "cat-maderas", locationId: "loc-patio" },
    { id: "mat-madera-1x6", name: "Madera Pino 1x6", unit: "pie", currentStock: 300, minStock: 80, unitCost: 1.85, sku: "MAD-PIN16-02", categoryId: "cat-maderas", locationId: "loc-patio" },
    { id: "mat-triplay", name: "Triplay", unit: "planchas", currentStock: 25, minStock: 10, unitCost: 22.00, sku: "MAD-TRIP-03", categoryId: "cat-maderas", locationId: "loc-almacen-a" },
    { id: "mat-pintura-blanca", name: "Pintura Esmalte Blanco", unit: "galones", currentStock: 15, minStock: 10, unitCost: 18.50, sku: "PIN-ESM-01", categoryId: "cat-pinturas", locationId: "loc-zona-cubierta" },
    { id: "mat-pintura-negra", name: "Pintura Esmalte Negro", unit: "galones", currentStock: 8, minStock: 5, unitCost: 18.50, sku: "PIN-ESM-02", categoryId: "cat-pinturas", locationId: "loc-zona-cubierta" },
    { id: "mat-thinner", name: "Thinner", unit: "litros", currentStock: 20, minStock: 10, unitCost: 4.20, sku: "PIN-THI-03", categoryId: "cat-pinturas", locationId: "loc-zona-cubierta" },
    { id: "mat-clavos-2", name: 'Clavos 2"', unit: "kg", currentStock: 45, minStock: 20, unitCost: 3.10, sku: "FER-CLA2-01", categoryId: "cat-ferreteria", locationId: "loc-almacen-a" },
    { id: "mat-clavos-3", name: 'Clavos 3"', unit: "kg", currentStock: 30, minStock: 15, unitCost: 3.30, sku: "FER-CLA3-02", categoryId: "cat-ferreteria", locationId: "loc-almacen-a" },
    { id: "mat-alambre-negro", name: "Alambre Negro", unit: "kg", currentStock: 25, minStock: 10, unitCost: 2.80, sku: "FER-ALAN-03", categoryId: "cat-ferreteria", locationId: "loc-almacen-a" },
    { id: "mat-tubo-pvc-2", name: 'Tubo PVC 2"', unit: "unidades", currentStock: 100, minStock: 50, unitCost: 6.50, sku: "TUB-PVC2-01", categoryId: "cat-tubos", locationId: "loc-almacen-b" },
    { id: "mat-tubo-pvc-4", name: 'Tubo PVC 4"', unit: "unidades", currentStock: 50, minStock: 20, unitCost: 12.80, sku: "TUB-PVC4-02", categoryId: "cat-tubos", locationId: "loc-almacen-b" },
    { id: "mat-codo-pvc-2", name: 'Codo PVC 2" 90°', unit: "unidades", currentStock: 200, minStock: 50, unitCost: 1.40, sku: "TUB-COD2-03", categoryId: "cat-tubos", locationId: "loc-almacen-b" },
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
        unitPrice: m.unitCost,
        receiverName: null,
        signature: null,
        materialId: m.id,
        userId: "demo-admin-id",
        projectId: null,
        supplierId: "sup-ferreteria-central",
      });
    }
  });

  // Sample historical movements with projects and suppliers
  movements.push(
    // 3 days ago
    {
      id: "mov-sample-1",
      type: "OUT",
      quantity: 200,
      date: subDays(now, 3),
      notes: "Cimentación Torre A - Eje 4",
      unitPrice: 1.15,
      receiverName: "Arq. Mauricio Gómez",
      signature: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40'><path d='M10 25 Q30 5 50 20 T90 15' stroke='blue' fill='none'/></svg>",
      materialId: "mat-acero-3",
      userId: "demo-operator-id",
      projectId: "proj-solana",
      supplierId: null,
    },
    // 2 days ago
    {
      id: "mov-sample-2",
      type: "IN",
      quantity: 100,
      date: subDays(now, 2),
      notes: "Compra Factura #FC-8902",
      unitPrice: 3.10,
      receiverName: null,
      signature: null,
      materialId: "mat-clavos-2",
      userId: "demo-admin-id",
      projectId: null,
      supplierId: "sup-ferreteria-central",
    },
    // Yesterday
    {
      id: "mov-sample-3",
      type: "OUT",
      quantity: 50,
      date: subDays(now, 1),
      notes: "Fundición de columnas Piso 1",
      unitPrice: 0.25,
      receiverName: "Ing. Roberto Peña",
      signature: null,
      materialId: "mat-cemento-portland",
      userId: "demo-operator-id",
      projectId: "proj-solana",
      supplierId: null,
    },
    {
      id: "mov-sample-4",
      type: "OUT",
      quantity: 3,
      date: subDays(now, 1),
      notes: "Mezcla de piso sala infantil",
      unitPrice: 28.00,
      receiverName: "Maestro Silva",
      signature: null,
      materialId: "mat-arena-fina",
      userId: "demo-operator-id",
      projectId: "proj-biblioteca",
      supplierId: null,
    },
    // Today
    {
      id: "mov-sample-5",
      type: "OUT",
      quantity: 5,
      date: setHours(startOfDay(now), 8),
      notes: "Fijación de encofrados",
      unitPrice: 3.10,
      receiverName: "Carlos Vega",
      signature: null,
      materialId: "mat-clavos-2",
      userId: "demo-operator-id",
      projectId: "proj-solana",
      supplierId: null,
    },
    {
      id: "mov-sample-6",
      type: "IN",
      quantity: 10,
      date: setHours(startOfDay(now), 10),
      notes: "Reposición directa de fábrica",
      unitPrice: 18.50,
      receiverName: null,
      signature: null,
      materialId: "mat-pintura-blanca",
      userId: "demo-admin-id",
      projectId: null,
      supplierId: "sup-cementos-andina",
    },
    {
      id: "mov-sample-7",
      type: "OUT",
      quantity: 3,
      date: setHours(startOfDay(now), 12),
      notes: "Pintura fachada principal",
      unitPrice: 18.50,
      receiverName: "Pintores Unidos",
      signature: null,
      materialId: "mat-pintura-blanca",
      userId: "demo-operator-id",
      projectId: "proj-biblioteca",
      supplierId: null,
    }
  );

  const auditLogs: DemoAuditLog[] = [
    {
      id: "audit-1",
      action: "STOCK_UPDATE",
      entity: "Material",
      entityId: "mat-cemento-portland",
      details: "Ajuste de inventario físico realizado por auditoría",
      userId: "demo-admin-id",
      createdAt: subDays(now, 2),
    },
    {
      id: "audit-2",
      action: "CREATE_PROJECT",
      entity: "Project",
      entityId: "proj-solana",
      details: "Apertura de centro de costos para obra Residencial Solana",
      userId: "demo-admin-id",
      createdAt: subDays(now, 5),
    },
  ];

  return {
    users,
    categories,
    locations,
    projects,
    suppliers,
    materials,
    movements,
    auditLogs,
  };
}
