"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardAnalyticsData } from "@/lib/type";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  PieChart as PieIcon,
  Building2,
  Package,
} from "lucide-react";

interface DashboardChartsProps {
  analytics: DashboardAnalyticsData;
}

const CATEGORY_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#64748b", // Slate
];

const HEALTH_COLORS = {
  normal: "#10b981", // Emerald
  low: "#f59e0b",    // Amber
  empty: "#ef4444",  // Red
};

const emptySubscribe = () => () => {};

export function DashboardCharts({ analytics }: DashboardChartsProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [viewMode, setViewMode] = useState<"executive" | "financial" | "rotation" | "all">("executive");

  if (!mounted) {
    return (
      <Card className="h-96 flex items-center justify-center text-muted-foreground">
        Cargando métricas y analítica...
      </Card>
    );
  }

  const { stockHealth, dailyOperations, categoryValuation, topMovingMaterials, projectDispatches } = analytics;

  // Stock health data for Pie
  const healthPieData = [
    { name: "Normal (Óptimo)", value: stockHealth.normal, color: HEALTH_COLORS.normal },
    { name: "Stock Bajo (Reponer)", value: stockHealth.low, color: HEALTH_COLORS.low },
    { name: "Agotado (Crítico)", value: stockHealth.empty, color: HEALTH_COLORS.empty },
  ].filter((item) => item.value > 0);

  const totalOpsEntradas = dailyOperations.reduce((sum, d) => sum + d.entradas, 0);
  const totalOpsSalidas = dailyOperations.reduce((sum, d) => sum + d.salidas, 0);

  const totalInventoryCapital = categoryValuation.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="space-y-4">
      {/* Control Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Tablero de Analítica y Control de Existencias
          </h2>
          <p className="text-xs text-muted-foreground">
            Métricas precisas de operaciones, rotación de insumos y salud del almacén.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-background p-1 rounded-lg border shadow-sm self-start sm:self-auto">
          <Button
            size="sm"
            variant={viewMode === "executive" ? "default" : "ghost"}
            className="h-7 text-xs px-2.5"
            onClick={() => setViewMode("executive")}
          >
            Flujo & Salud
          </Button>
          <Button
            size="sm"
            variant={viewMode === "financial" ? "default" : "ghost"}
            className="h-7 text-xs px-2.5"
            onClick={() => setViewMode("financial")}
          >
            Valorización ($)
          </Button>
          <Button
            size="sm"
            variant={viewMode === "rotation" ? "default" : "ghost"}
            className="h-7 text-xs px-2.5"
            onClick={() => setViewMode("rotation")}
          >
            Rotación & Obras
          </Button>
          <Button
            size="sm"
            variant={viewMode === "all" ? "default" : "ghost"}
            className="h-7 text-xs px-2.5"
            onClick={() => setViewMode("all")}
          >
            Ver Todo
          </Button>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div
        className={`grid gap-4 ${
          viewMode === "all"
            ? "grid-cols-1 lg:grid-cols-2"
            : viewMode === "executive"
            ? "grid-cols-1 lg:grid-cols-12"
            : "grid-cols-1"
        }`}
      >
        {/* CHART 1: Flujo Diario de Operaciones (Entradas vs Salidas) */}
        {(viewMode === "executive" || viewMode === "all") && (
          <Card className={viewMode === "executive" ? "lg:col-span-7" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Flujo de Operaciones (Últimos 7 Días)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Frecuencia de recepciones de proveedores vs despachos hacia obras
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <ArrowDownLeft className="h-3 w-3 mr-1" />
                    {totalOpsEntradas} Recepciones
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {totalOpsSalidas} Despachos
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full pt-2">
                {dailyOperations.every((d) => d.total === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-sm text-muted-foreground">
                    <Package className="h-8 w-8 mb-1 opacity-40" />
                    No se han registrado operaciones en los últimos 7 días.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyOperations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          fontSize: "12px",
                          border: "1px solid #cbd5e1",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value: unknown, name: unknown) => [
                          `${value} operaciones`,
                          String(name) === "entradas" ? "Recepciones (Entradas)" : "Despachos (Salidas a Obra)",
                        ]}
                        labelFormatter={(label) => `Fecha: ${label}`}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                        formatter={(val) => (val === "entradas" ? "Recepciones de Proveedores" : "Despachos a Frentes de Obra")}
                      />
                      <Bar
                        dataKey="entradas"
                        name="entradas"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={36}
                      />
                      <Bar
                        dataKey="salidas"
                        name="salidas"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={36}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CHART 2: Semáforo de Salud de Inventario (Disponibilidad) */}
        {(viewMode === "executive" || viewMode === "all") && (
          <Card className={viewMode === "executive" ? "lg:col-span-5" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-primary" />
                Semáforo de Salud del Stock
              </CardTitle>
              <CardDescription className="text-xs">
                Disponibilidad actual de los {stockHealth.total} materiales registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                {/* Donut Chart */}
                <div className="h-48 w-48 shrink-0 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={healthPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {healthPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: unknown) => [`${value} materiales`, "Cantidad"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Metric */}
                  <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-2xl font-black text-foreground leading-none">
                      {stockHealth.total}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                      Ítems
                    </span>
                  </div>
                </div>

                {/* Status Breakdown Legend & Actions */}
                <div className="flex-1 w-full space-y-2.5 text-xs">
                  {/* Normal */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-semibold text-emerald-900 dark:text-emerald-300">Óptimo (Normal)</span>
                        <p className="text-[10px] text-muted-foreground">Por encima del mínimo</p>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                      {stockHealth.normal}{" "}
                      <span className="text-[10px] font-normal text-muted-foreground">
                        ({stockHealth.total > 0 ? Math.round((stockHealth.normal / stockHealth.total) * 100) : 0}%)
                      </span>
                    </span>
                  </div>

                  {/* Low */}
                  <Link href="/inventory?filter=low" className="block">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 hover:bg-amber-100/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                        <div>
                          <span className="font-semibold text-amber-900 dark:text-amber-300">Stock Bajo</span>
                          <p className="text-[10px] text-muted-foreground">Requiere reabastecimiento</p>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-amber-700 dark:text-amber-400">
                        {stockHealth.low}{" "}
                        <span className="text-[10px] font-normal text-muted-foreground">
                          ({stockHealth.total > 0 ? Math.round((stockHealth.low / stockHealth.total) * 100) : 0}%)
                        </span>
                      </span>
                    </div>
                  </Link>

                  {/* Empty */}
                  <Link href="/inventory?filter=empty" className="block">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 hover:bg-red-100/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                        <div>
                          <span className="font-semibold text-red-900 dark:text-red-300">Agotado (Sin Stock)</span>
                          <p className="text-[10px] text-muted-foreground">Quiebre crítico en obra</p>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-red-700 dark:text-red-400">
                        {stockHealth.empty}{" "}
                        <span className="text-[10px] font-normal text-muted-foreground">
                          ({stockHealth.total > 0 ? Math.round((stockHealth.empty / stockHealth.total) * 100) : 0}%)
                        </span>
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CHART 3: Capital Invertido por Categoría ($ Real) */}
        {(viewMode === "financial" || viewMode === "all") && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <PieIcon className="h-4 w-4 text-primary" />
                    Capital Invertido por Categoría
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Distribución del dinero físico en bodega según tipo de material (Stock Actual × Costo)
                  </CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Valor Total Almacén:</span>
                  <p className="font-bold text-sm text-primary">
                    ${totalInventoryCapital.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
                {/* Donut Chart */}
                <div className="md:col-span-5 h-56 flex items-center justify-center">
                  {categoryValuation.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Sin datos de valorización</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryValuation}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="name"
                        >
                          {categoryValuation.map((_, index) => (
                            <Cell key={`cat-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            fontSize: "12px",
                            border: "1px solid #cbd5e1",
                          }}
                          formatter={(val: unknown) => [
                            `$${Number(val).toLocaleString("es-ES", { minimumFractionDigits: 2 })}`,
                            "Capital Invertido",
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Detailed Category Progress Bars */}
                <div className="md:col-span-7 space-y-3">
                  {categoryValuation.slice(0, 6).map((cat, idx) => {
                    const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                    return (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            <span className="font-medium text-foreground truncate">{cat.name}</span>
                            <span className="text-[10px] text-muted-foreground">({cat.itemCount} ítems)</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-foreground">
                              ${cat.value.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-muted-foreground ml-1.5">
                              ({cat.percentage}%)
                            </span>
                          </div>
                        </div>
                        {/* Visual bar */}
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${Math.max(4, cat.percentage)}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CHART 4: Top Insumos con Mayor Rotación y Despacho a Obras */}
        {(viewMode === "rotation" || viewMode === "all") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Materials */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Top 5 Materiales Más Despachados
                </CardTitle>
                <CardDescription className="text-xs">
                  Insumos con mayor volumen de salida hacia las obras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 pt-2">
                  {topMovingMaterials.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No hay registros de despachos recientes.
                    </div>
                  ) : (
                    topMovingMaterials.map((mat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] shrink-0">
                            #{idx + 1}
                          </span>
                          <div className="truncate">
                            <span className="font-semibold text-foreground truncate block">{mat.name}</span>
                            <span className="text-[10px] text-muted-foreground">{mat.movementsCount} despachos registrados</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-sm text-primary">
                            {mat.quantity} <span className="text-[10px] font-normal text-muted-foreground">{mat.unit}</span>
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project Dispatches */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Consumo por Frente de Obra
                </CardTitle>
                <CardDescription className="text-xs">
                  Destino de los materiales y actividad por proyecto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 pt-2">
                  {projectDispatches.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No hay despachos vinculados a obras aún.
                    </div>
                  ) : (
                    projectDispatches.map((proj, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground truncate">{proj.name}</span>
                          <span className="text-muted-foreground font-semibold">
                            {proj.count} despachos ({proj.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all"
                            style={{ width: `${Math.max(5, proj.percentage)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
