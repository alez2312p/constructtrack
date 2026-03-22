import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { startOfDay, addDays, subDays, setHours, setMinutes } from "date-fns";

const connectionString = process.env.DATABASE_URL;

function createPrismaClient() {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data
  await prisma.movement.deleteMany();
  await prisma.material.deleteMany();
  await prisma.category.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const admin = await prisma.user.create({
    data: {
      name: "Administrador",
      email: "admin@constructtrack.com",
      password: "$2b$10$fD26VYDW9PWtNo.cxfILHOMThpnUI9MIACuYdeF50p0vU6Lio6oIq", // admin123
      role: "ADMIN",
    },
  });

  const operator = await prisma.user.create({
    data: {
      name: "Operador",
      email: "operador@constructtrack.com",
      password: "$2b$10$sRuv8vAs/5nn9aDxBQoTd.LsSikYzziUZc1fLztsxUtg2X4W7mGW6", // operator123
      role: "OPERATOR",
    },
  });

  console.log("✅ Created users:", {
    admin: admin.email,
    operator: operator.email,
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Cementos" } }),
    prisma.category.create({ data: { name: "Áridos" } }),
    prisma.category.create({ data: { name: "Hierros y Aceros" } }),
    prisma.category.create({ data: { name: "Maderas" } }),
    prisma.category.create({ data: { name: "Pinturas" } }),
    prisma.category.create({ data: { name: "Ferretería" } }),
    prisma.category.create({ data: { name: "Tubos y Conexiones" } }),
    prisma.category.create({ data: { name: "Electricidad" } }),
    prisma.category.create({ data: { name: "Herramientas" } }),
    prisma.category.create({ data: { name: "Seguridad" } }),
  ]);

  console.log("✅ Created", categories.length, "categories");

  // Create locations
  const locations = await Promise.all([
    prisma.location.create({
      data: { name: "Almacén A", description: "Sector principal - Entrada" },
    }),
    prisma.location.create({
      data: { name: "Almacén B", description: "Sector posterior" },
    }),
    prisma.location.create({
      data: { name: "Patio", description: "Materiales grandes" },
    }),
    prisma.location.create({
      data: { name: "Bodega Oficina", description: "Suministros menores" },
    }),
    prisma.location.create({
      data: {
        name: "Zona Cubierta",
        description: "Materiales sensibles al clima",
      },
    }),
  ]);

  console.log("✅ Created", locations.length, "locations");

  // Get category references
  const catCementos = categories.find((c) => c.name === "Cementos")!;
  const catArena = categories.find((c) => c.name === "Áridos")!;
  const catHierros = categories.find((c) => c.name === "Hierros y Aceros")!;
  const catMaderas = categories.find((c) => c.name === "Maderas")!;
  const catPinturas = categories.find((c) => c.name === "Pinturas")!;
  const catFerreteria = categories.find((c) => c.name === "Ferretería")!;
  const catTubos = categories.find((c) => c.name === "Tubos y Conexiones")!;

  // Get location references
  const almacenA = locations.find((l) => l.name === "Almacén A")!;
  const almacenB = locations.find((l) => l.name === "Almacén B")!;
  const patio = locations.find((l) => l.name === "Patio")!;
  const zonaCubierta = locations.find((l) => l.name === "Zona Cubierta")!;

  // Create dates for materials (spread across Mar 17, 18, 19, 20)
  const baseDate = new Date(2026, 2, 17); // Mar 17, 2026 (months are 0-indexed)
  const materialDates = [
    startOfDay(baseDate), // Mar 17
    setHours(setMinutes(startOfDay(baseDate), 0), 10), // Mar 17 10:00
    setHours(setMinutes(startOfDay(baseDate), 30), 14), // Mar 17 14:30
    startOfDay(addDays(baseDate, 1)), // Mar 18
    setHours(setMinutes(startOfDay(addDays(baseDate, 1)), 15), 9), // Mar 18 09:15
    setHours(setMinutes(startOfDay(addDays(baseDate, 1)), 45), 16), // Mar 18 16:45
    startOfDay(addDays(baseDate, 2)), // Mar 19
    setHours(setMinutes(startOfDay(addDays(baseDate, 2)), 20), 11), // Mar 19 11:20
    setHours(setMinutes(startOfDay(addDays(baseDate, 2)), 0), 15), // Mar 19 15:00
    startOfDay(addDays(baseDate, 3)), // Mar 20
    setHours(setMinutes(startOfDay(addDays(baseDate, 3)), 30), 8), // Mar 20 08:30
    setHours(setMinutes(startOfDay(addDays(baseDate, 3)), 45), 13), // Mar 20 13:45
  ];

  // Create materials with categories, locations, and varied creation dates
  const materialsData = [
    {
      name: "Cemento Portland",
      unit: "kg",
      currentStock: 500,
      minStock: 100,
      active: true,
      categoryId: catCementos.id,
      locationId: almacenA.id,
    },
    {
      name: "Cemento Blanco",
      unit: "kg",
      currentStock: 50,
      minStock: 20,
      active: true,
      categoryId: catCementos.id,
      locationId: almacenA.id,
    },
    {
      name: "Arena Fina",
      unit: "m3",
      currentStock: 15,
      minStock: 20,
      active: true,
      categoryId: catArena.id,
      locationId: patio.id,
    },
    {
      name: "Arena Gruesa",
      unit: "m3",
      currentStock: 20,
      minStock: 10,
      active: true,
      categoryId: catArena.id,
      locationId: patio.id,
    },
    {
      name: "Grava 3/4",
      unit: "m3",
      currentStock: 8,
      minStock: 10,
      active: true,
      categoryId: catArena.id,
      locationId: patio.id,
    },
    {
      name: "Piedra Picada",
      unit: "m3",
      currentStock: 12,
      minStock: 5,
      active: true,
      categoryId: catArena.id,
      locationId: patio.id,
    },
    {
      name: "Acero de Refuerzo #3",
      unit: "kg",
      currentStock: 1200,
      minStock: 500,
      active: true,
      categoryId: catHierros.id,
      locationId: almacenB.id,
    },
    {
      name: "Acero de Refuerzo #4",
      unit: "kg",
      currentStock: 800,
      minStock: 300,
      active: true,
      categoryId: catHierros.id,
      locationId: almacenB.id,
    },
    {
      name: "Varilla Corrugada",
      unit: "unidades",
      currentStock: 150,
      minStock: 50,
      active: true,
      categoryId: catHierros.id,
      locationId: almacenB.id,
    },
    {
      name: "Madera Pino 2x4",
      unit: "pie",
      currentStock: 500,
      minStock: 100,
      active: true,
      categoryId: catMaderas.id,
      locationId: patio.id,
    },
    {
      name: "Madera Pino 1x6",
      unit: "pie",
      currentStock: 300,
      minStock: 80,
      active: true,
      categoryId: catMaderas.id,
      locationId: patio.id,
    },
    {
      name: "Triplay",
      unit: "planchas",
      currentStock: 25,
      minStock: 10,
      active: true,
      categoryId: catMaderas.id,
      locationId: almacenA.id,
    },
    {
      name: "Pintura Esmalte Blanco",
      unit: "galones",
      currentStock: 15,
      minStock: 10,
      active: true,
      categoryId: catPinturas.id,
      locationId: zonaCubierta.id,
    },
    {
      name: "Pintura Esmalte Negro",
      unit: "galones",
      currentStock: 8,
      minStock: 5,
      active: true,
      categoryId: catPinturas.id,
      locationId: zonaCubierta.id,
    },
    {
      name: "Thinner",
      unit: "litros",
      currentStock: 20,
      minStock: 10,
      active: true,
      categoryId: catPinturas.id,
      locationId: zonaCubierta.id,
    },
    {
      name: 'Clavos 2"',
      unit: "kg",
      currentStock: 45,
      minStock: 20,
      active: true,
      categoryId: catFerreteria.id,
      locationId: almacenA.id,
    },
    {
      name: 'Clavos 3"',
      unit: "kg",
      currentStock: 30,
      minStock: 15,
      active: true,
      categoryId: catFerreteria.id,
      locationId: almacenA.id,
    },
    {
      name: "Alambre Negro",
      unit: "kg",
      currentStock: 25,
      minStock: 10,
      active: true,
      categoryId: catFerreteria.id,
      locationId: almacenA.id,
    },
    {
      name: 'Tubo PVC 2"',
      unit: "unidades",
      currentStock: 100,
      minStock: 50,
      active: true,
      categoryId: catTubos.id,
      locationId: almacenB.id,
    },
    {
      name: 'Tubo PVC 4"',
      unit: "unidades",
      currentStock: 50,
      minStock: 20,
      active: true,
      categoryId: catTubos.id,
      locationId: almacenB.id,
    },
    {
      name: 'Codo PVC 2" 90°',
      unit: "unidades",
      currentStock: 200,
      minStock: 50,
      active: true,
      categoryId: catTubos.id,
      locationId: almacenB.id,
    },
  ];

  // Create materials with staggered dates
  const materials = await Promise.all(
    materialsData.map((data, index) =>
      prisma.material.create({
        data: {
          ...data,
          createdAt: materialDates[index % materialDates.length],
        },
      }),
    ),
  );

  console.log("✅ Created", materials.length, "materials");
  console.log("📅 Material creation dates:");
  materials.forEach((m) => {
    console.log(`   ${m.name}: ${m.createdAt.toISOString().split("T")[0]}`);
  });

  // Create initial stock movements with material creation dates
  for (let i = 0; i < materials.length; i++) {
    const material = materials[i];
    if (material.currentStock > 0) {
      await prisma.movement.create({
        data: {
          type: "IN",
          quantity: material.currentStock,
          date: material.createdAt,
          notes: "Stock inicial",
          materialId: material.id,
          userId: admin.id,
        },
      });
    }
  }

  console.log("✅ Created initial stock movements");

  // Create some sample movements
  const cement = materials.find((m) => m.name === "Cemento Portland")!;
  const arena = materials.find((m) => m.name === "Arena Fina")!;
  const clavos = materials.find((m) => m.name === 'Clavos 2"')!;
  const acero = materials.find((m) => m.name === "Acero de Refuerzo #3")!;
  const pintura = materials.find((m) => m.name === "Pintura Esmalte Blanco")!;

  // Yesterday
  await prisma.movement.create({
    data: {
      type: "OUT",
      quantity: 50,
      date: subDays(new Date(), 1),
      notes: "Construcción Torre A - Piso 1",
      materialId: cement.id,
      userId: operator.id,
    },
  });

  await prisma.movement.create({
    data: {
      type: "OUT",
      quantity: 3,
      date: subDays(new Date(), 1),
      notes: "Proyecto Biblioteca",
      materialId: arena.id,
      userId: operator.id,
    },
  });

  // 2 days ago
  await prisma.movement.create({
    data: {
      type: "IN",
      quantity: 100,
      date: subDays(new Date(), 2),
      notes: "Compra a proveedor Ferretería Central",
      materialId: clavos.id,
      userId: admin.id,
    },
  });

  // 3 days ago
  await prisma.movement.create({
    data: {
      type: "OUT",
      quantity: 200,
      date: subDays(new Date(), 3),
      notes: "Proyecto Residencial Solana",
      materialId: acero.id,
      userId: operator.id,
    },
  });

  // Today
  await prisma.movement.create({
    data: {
      type: "OUT",
      quantity: 5,
      date: startOfDay(new Date()),
      notes: "Mantenimiento oficina",
      materialId: clavos.id,
      userId: operator.id,
    },
  });

  await prisma.movement.create({
    data: {
      type: "IN",
      quantity: 10,
      date: startOfDay(new Date()),
      notes: "Reposición de inventario",
      materialId: pintura.id,
      userId: admin.id,
    },
  });

  await prisma.movement.create({
    data: {
      type: "OUT",
      quantity: 3,
      date: startOfDay(new Date()),
      notes: "Pintura fachada edificio",
      materialId: pintura.id,
      userId: operator.id,
    },
  });

  console.log("✅ Created sample movements");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📧 Login credentials:");
  console.log("   Admin: admin@constructtrack.com / admin123");
  console.log("   Operator: operador@constructtrack.com / operator123");
  console.log("\n📦 Data summary:");
  console.log("   - Users: 2");
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Locations: ${locations.length}`);
  console.log(`   - Materials: ${materials.length}`);
  console.log("   - Movements: 8 (initial + samples)");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
