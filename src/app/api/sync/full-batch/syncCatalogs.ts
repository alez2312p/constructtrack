import { prisma } from "@/lib/prisma";

export async function syncProjects(projects: any[]) {
  for (const p of projects) {
    if (!p.name) continue;
    await prisma.project.upsert({
      where: { id: p.id },
      update: { name: p.name, code: p.code || null, address: p.address || null },
      create: {
        id: p.id,
        name: p.name,
        code: p.code || null,
        description: p.description || null,
        address: p.address || null,
        status: p.status || "ACTIVE",
      },
    });
  }
}

export async function syncSuppliers(suppliers: any[]) {
  for (const s of suppliers) {
    if (!s.name) continue;
    await prisma.supplier.upsert({
      where: { id: s.id },
      update: { name: s.name, contactName: s.contactName || null, phone: s.phone || null },
      create: {
        id: s.id,
        name: s.name,
        contactName: s.contactName || null,
        phone: s.phone || null,
        email: s.email || null,
        taxId: s.taxId || null,
        address: s.address || null,
      },
    });
  }
}

export async function syncCategoriesAndLocations(categories: any[], locations: any[]) {
  for (const c of categories) {
    if (!c.name) continue;
    await prisma.category.upsert({
      where: { id: c.id },
      update: { name: c.name },
      create: { id: c.id, name: c.name },
    });
  }

  for (const l of locations) {
    if (!l.name) continue;
    await prisma.location.upsert({
      where: { id: l.id },
      update: { name: l.name, description: l.description || null },
      create: { id: l.id, name: l.name, description: l.description || null },
    });
  }
}

export async function syncMaterials(materials: any[]) {
  for (const m of materials) {
    if (!m.name && !m.id) continue;

    if (m.active === false || m.deletedAt) {
      await prisma.material.updateMany({
        where: { id: m.id },
        data: { active: false, deletedAt: new Date(m.deletedAt || Date.now()) },
      });
      continue;
    }

    let validCatId: string | null = null;
    if (m.categoryId) {
      const c = await prisma.category.findUnique({ where: { id: m.categoryId } });
      if (c) validCatId = c.id;
    }

    let validLocId: string | null = null;
    if (m.locationId) {
      const l = await prisma.location.findUnique({ where: { id: m.locationId } });
      if (l) validLocId = l.id;
    }

    await prisma.material.upsert({
      where: { id: m.id },
      update: {
        name: m.name,
        unit: m.unit,
        minStock: m.minStock !== undefined ? Number(m.minStock) : undefined,
        unitCost: m.unitCost !== undefined ? Number(m.unitCost) : undefined,
        sku: m.sku || null,
        categoryId: validCatId,
        locationId: validLocId,
      },
      create: {
        id: m.id,
        name: m.name,
        unit: m.unit,
        currentStock: Number(m.currentStock) || 0,
        minStock: Number(m.minStock) || 0,
        unitCost: Number(m.unitCost) || 0,
        sku: m.sku || null,
        categoryId: validCatId,
        locationId: validLocId,
        active: true,
      },
    });
  }
}
