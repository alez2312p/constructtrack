import { Suspense } from "react";
import {
  getTotalMaterialsCount,
  getLowStockMaterials,
  getRecentMovements,
  getInventoryValuation,
  getDashboardAnalytics,
} from "@/actions/materials";
import { Package, AlertTriangle, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockAlerts } from "@/components/dashboard/stock-alerts";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { MovementItem } from "@/components/movements/movement-card";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import DashboardLoading from "./loading";
import { MovementData } from "@/lib/type";

async function DashboardContent({ userId }: { userId: string }) {
  const [totalMaterials, allLowStock, rawMovements, totalValuation, analytics] = await Promise.all([
    getTotalMaterialsCount(),
    getLowStockMaterials(),
    getRecentMovements(true),
    getInventoryValuation(),
    getDashboardAnalytics(),
  ]);

  const todayMovements = rawMovements.map((m) => ({
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
  const outOfStockCount = allLowStock.filter(m => m.currentStock === 0).length;
  const lowStockCount = allLowStock.filter(m => m.currentStock > 0).length;

  return (
    <>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          title="Total Materiales"
          value={totalMaterials}
          icon={Package}
          href="/inventory"
        />
        <SummaryCard
          title="Valorización"
          value={`$${totalValuation.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          href="/inventory"
        />
        <SummaryCard
          title="Stock Bajo"
          value={lowStockCount}
          icon={AlertTriangle}
          href="/inventory?search=&filter=low"
          variant={lowStockCount > 0 ? "warning" : "default"}
        />
        <SummaryCard
          title="Agotado"
          value={outOfStockCount}
          icon={AlertTriangle}
          href="/inventory?filter=empty"
          variant={outOfStockCount > 0 ? "danger" : "default"}
        />
      </div>

      {/* Interactive Charts */}
      <DashboardCharts analytics={analytics} />

      {/* Stock Alerts */}
      {allLowStock.length > 0 && (
        <StockAlerts alerts={allLowStock} userId={userId} />
      )}

      {/* Today's Movements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Movimientos de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          {todayMovements.length === 0 ? (
            <p className="text-muted-foreground text-sm">No hay movimientos hoy</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {todayMovements.map((movement) => (
                <MovementItem key={movement.id} movement={movement} variant="list" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    const callbackUrl = encodeURIComponent("/dashboard");
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  return (
    <div className="space-y-3">
      <ScrollToTop />

      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent userId={session.user.id} />
      </Suspense>
    </div>
  );
}