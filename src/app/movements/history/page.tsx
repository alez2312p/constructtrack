import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { ExportButton } from "@/components/movements/export-button";
import { MovementTable } from "@/components/movements/movement-table";
import { Filters } from "@/components/movements/movement-filters";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { buildDateFilter } from "@/lib/movement-utils";
import { MovementItem } from "@/components/movements/movement-card";
import { CursorPagination } from "@/components/movements/cursor-pagination";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MovementData } from "@/lib/type";

interface MovementsHistoryProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    materialId?: string;
    days?: string;
    type?: string;
    cursor?: string;
    limit?: string;
  }>;
}
async function MovementsHistoryContent({
  searchParams,
}: MovementsHistoryProps) {
  const params = await searchParams;

  const days = params.days || "";
  const from = params.from || "";
  const to = params.to || "";
  const materialId = params.materialId || "";
  const type = params.type || "";
  const cursor = params.cursor;
  const limit = parseInt(params.limit || "20", 10);

  const dateFilter = buildDateFilter(days, from, to);
  const where: Prisma.MovementWhereInput = {};

  if (dateFilter) where.date = dateFilter;
  if (materialId) where.materialId = materialId;
  if (type) where.type = type as "IN" | "OUT";

  // Clone where for the query to avoid affecting the total counts
  const queryWhere = { ...where };

  // Add cursor condition for pagination (get items before the cursor)
  if (cursor) {
    queryWhere.id = { lt: cursor };
  }

  const [movementsResult, materials] = await Promise.all([
    prisma.movement.findMany({
      where: queryWhere,
      orderBy: [
        { date: "desc" },
        { id: "desc" }
      ],
      take: limit + 1, // Get one extra to check if there's a next page
      include: {
        material: {
          include: {
            category: true,
            location: true,
          },
        },
        user: true
      },
    }),
    prisma.material.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Map the movements to the correct type for the MovementItem component
  const movements = movementsResult.map(m => ({
    id: m.id,
    type: m.type === "IN" ? "IN" : "OUT" as const,
    quantity: m.quantity,
    date: m.date,
    notes: m.notes,
    material: {
      id: m.material.id,
      name: m.material.name,
      unit: m.material.unit,
      currentStock: m.material.currentStock,
      minStock: m.material.minStock,
      categoryId: m.material.categoryId,
      locationId: m.material.locationId,
      category: m.material.category ? { name: m.material.category.name } : null,
      location: m.material.location ? { name: m.material.location.name } : null,
    },
    user: {
      id: m.user.id,
      name: m.user.name,
    }
  })) as MovementData[];

  // Check if there's a next page
  const hasNextPage = movements.length > limit;
  const paginatedMovements = hasNextPage ? movements.slice(0, -1) : movements;

  // Get the cursor for the next page (last item's ID)
  const nextCursor = hasNextPage && paginatedMovements.length > 0
    ? paginatedMovements[paginatedMovements.length - 1].id
    : null;

  // For total count, we still need it for the UI (though it's less critical for cursor-based pagination)
  const [totalCount] = await Promise.all([
    prisma.movement.count({ where }),
    prisma.movement.aggregate({ where: { ...where, type: "IN" }, _sum: { quantity: true } }),
    prisma.movement.aggregate({ where: { ...where, type: "OUT" }, _sum: { quantity: true } }),
  ]);

  return (
    <>
      <ScrollToTop />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Historial</h1>

        <Filters days={days} from={from} to={to} materialId={materialId} type={type} materials={materials} />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* <MovementSummary totalIn={totalIn._sum.quantity || 0} totalOut={totalOut._sum.quantity || 0} /> */}
          <ExportButton movements={paginatedMovements} days={days} from={from} to={to} materialId={materialId} type={type} />
        </div>

        {/* Mobile */}
        <div className="md:hidden space-y-3">
          {paginatedMovements.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No hay movimientos
              </CardContent>
            </Card>
          ) : (
            paginatedMovements.map((m) => <MovementItem key={m.id} movement={m} variant="card" />)
          )}
          <CursorPagination
            hasNextPage={hasNextPage}
            nextCursor={nextCursor}
            days={days}
            from={from}
            to={to}
            materialId={materialId}
            type={type}
            limit={limit}
            totalCount={totalCount}
          />
        </div>

        {/* Desktop */}
        <div className="hidden md:block">
          <MovementTable movements={paginatedMovements} />
          <CursorPagination
            hasNextPage={hasNextPage}
            nextCursor={nextCursor}
            days={days}
            from={from}
            to={to}
            materialId={materialId}
            type={type}
            limit={limit}
            totalCount={totalCount}
          />
        </div>
      </div>
    </>
  );
}

export default async function MovementsHistoryPage({
  searchParams,
}: MovementsHistoryProps) {
  const session = await getSession();

  // If no session, redirect to login
  if (!session?.user?.id) {
    const callbackUrl = encodeURIComponent(`/movements/history?${new URLSearchParams(await searchParams).toString()}`);
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  return (
    <div>
      <h1>Historial</h1>
      <ScrollToTop />
      <Suspense fallback={<HistoryContentSkeleton />}>
        <MovementsHistoryContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

function HistoryContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>

      {/* Export & Actions */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table/List Skeleton */}
      <div className="space-y-4">
        <div className="hidden md:block space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="md:hidden space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}