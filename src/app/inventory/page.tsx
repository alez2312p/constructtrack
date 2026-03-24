import { Suspense } from "react";
import { getMaterials } from "@/actions/materials";
import { getCategories } from "@/actions/categories";
import { getLocations } from "@/actions/locations";
import { InventoryList } from "@/components/inventory/inventory-list";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import InventoryLoading from "./loading";

async function InventoryContent({
  searchParams,
  userId
}: {
  searchParams: Promise<{ search?: string; filter?: string; cursor?: string; limit?: string }>
  userId: string
}) {
  const params = await searchParams;
  const search = params.search || "";
  const filter = params.filter || "";
  const cursor = params.cursor || undefined;
  const limit = parseInt(params.limit || "50", 10);

  const [materials, categories, locations] = await Promise.all([
    getMaterials(cursor, limit),
    getCategories(),
    getLocations(),
  ]);

  const hasNextPage = materials.length > limit;
  const paginatedMaterials = hasNextPage ? materials.slice(0, -1) : materials;
  const nextCursor = hasNextPage ? materials[materials.length - 1].id : null;

  return (
    <InventoryList
      materials={paginatedMaterials}
      categories={categories}
      locations={locations}
      userId={userId}
      initialSearch={search}
      initialFilter={filter}
      hasNextPage={hasNextPage}
      nextCursor={nextCursor}
      limit={limit}
      totalCount={paginatedMaterials.length}
    />
  );
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; filter?: string; cursor?: string; limit?: string }>;
}) {
  const session = await getSession();

  // Verificación de sesión rápida
  if (!session?.user?.id) {
    const resolvedParams = await searchParams;
    const callbackUrl = encodeURIComponent(`/inventory?${new URLSearchParams(resolvedParams).toString()}`);
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  return (
    <div className="space-y-4">
      <ScrollToTop />
      <Suspense fallback={<InventoryLoading />}>
        <InventoryContent searchParams={searchParams} userId={session.user.id} />
      </Suspense>
    </div>
  );
}