import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      where: { deletedAt: null },
      include: {
        category: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(materials);
  } catch (error: any) {
    console.error("Error fetching materials:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch materials" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, unit, minStock, unitCost, sku, categoryId, locationId, id, currentStock, initialStock } = body;

    if (!name || !unit) {
      return NextResponse.json({ error: "Nombre y unidad requeridos" }, { status: 400 });
    }

    const material = await prisma.material.create({
      data: {
        id: id || undefined,
        name: name.trim(),
        unit: unit.trim(),
        currentStock: Number(currentStock ?? initialStock) || 0,
        minStock: Number(minStock) || 0,
        unitCost: Number(unitCost) || 0,
        sku: sku?.trim() || null,
        categoryId: categoryId || null,
        locationId: locationId || null,
        active: true,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error: any) {
    console.error("Error creating material:", error);
    return NextResponse.json({ error: error.message || "Failed to create material" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, unit, minStock, unitCost, sku, categoryId, locationId } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requerido para actualizar" }, { status: 400 });
    }

    const material = await prisma.material.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        unit: unit !== undefined ? unit.trim() : undefined,
        minStock: minStock !== undefined ? Number(minStock) : undefined,
        unitCost: unitCost !== undefined ? Number(unitCost) : undefined,
        sku: sku !== undefined ? (sku ? sku.trim() : null) : undefined,
        categoryId: categoryId !== undefined ? (categoryId || null) : undefined,
        locationId: locationId !== undefined ? (locationId || null) : undefined,
      },
    });

    return NextResponse.json(material);
  } catch (error: any) {
    console.error("Error updating material:", error);
    return NextResponse.json({ error: error.message || "Failed to update material" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requerido para eliminar" }, { status: 400 });
    }

    const material = await prisma.material.update({
      where: { id },
      data: {
        active: false,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(material);
  } catch (error: any) {
    console.error("Error deleting material:", error);
    return NextResponse.json({ error: error.message || "Failed to delete material" }, { status: 500 });
  }
}
