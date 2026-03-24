import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MovementForm } from "@/components/movements/movement-form";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { Toaster } from "@/components/ui/sonner";
import { History } from "lucide-react";
import Link from "next/link";
import { MovementItem } from "@/components/movements/movement-card";
import { redirect } from "next/navigation";
import { getRecentMovements } from "@/actions/materials";
import { getSession } from "@/lib/auth/get-session";
import { Suspense } from "react";
import MovementsLoading from "./loading";
import { MovementData } from "@/lib/type";

async function MovementsContent() {
  const rawMovements = await getRecentMovements(false, 20);

  const recentMovements = rawMovements.map((m) => ({
    ...m,
    type: m.type as "IN" | "OUT",
    material: {
      ...m.material,
      currentStock: 0,
      minStock: 0,
      categoryId: "",
      locationId: "",
    },
  })) as MovementData[];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Movement Form */}
      <Card>
        <CardHeader>
          <CardTitle>Registrar Movimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <MovementForm />
        </CardContent>
      </Card>

      {/* Recent Movements List */}
      <Card>
        <CardHeader>
          <CardTitle>Movimientos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentMovements.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay movimientos registrados
            </p>
          ) : (
            <div className="space-y-3 max-h-[550px] overflow-y-auto">
              {recentMovements.map((movement) => (
                <MovementItem key={movement.id} movement={movement} variant="list" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default async function MovementsPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    const callbackUrl = encodeURIComponent("/movements");
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <ScrollToTop />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Movimientos</h1>
        <Link href="/movements/history" className="flex items-center gap-0.5 bg-accent px-1 border rounded-xl cursor-pointer">
          <History className="h-4 w-4" />
          Historial
        </Link>
      </div>

      <Suspense fallback={<MovementsLoading />}>
        <MovementsContent />
      </Suspense>
    </div>
  );
}