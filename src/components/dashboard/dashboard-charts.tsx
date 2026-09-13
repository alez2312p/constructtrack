"use client";

import { useState, useSyncExternalStore } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MovementSummary {
  id: string;
  type: "IN" | "OUT";
  quantity: number;
  date: Date | string;
  material: {
    name: string;
    unit: string;
    category?: { name: string } | null;
  };
}

interface DashboardChartsProps {
  movements: MovementSummary[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];
const emptySubscribe = () => () => {};

export function DashboardCharts({ movements }: DashboardChartsProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [activeTab, setActiveTab] = useState<"activity" | "categories">("activity");

  if (!mounted) {
    return (
      <Card className="h-80 flex items-center justify-center text-muted-foreground">
        Cargando gráficos...
      </Card>
    );
  }

  // 1. Group movements by date (last 7 days or by days present)
  const dateMap: Record<string, { date: string; entradas: number; salidas: number }> = {};

  // Sort movements oldest to newest for chronological chart
  const sortedMovements = [...movements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedMovements.forEach((m) => {
    const d = new Date(m.date);
    const label = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    if (!dateMap[label]) {
      dateMap[label] = { date: label, entradas: 0, salidas: 0 };
    }
    if (m.type === "IN") {
      dateMap[label].entradas += m.quantity;
    } else {
      dateMap[label].salidas += m.quantity;
    }
  });

  const activityData = Object.values(dateMap).slice(-7);

  // 2. Group by category
  const categoryMap: Record<string, number> = {};
  movements.forEach((m) => {
    const catName = m.material.category?.name || "Sin categoría";
    categoryMap[catName] = (categoryMap[catName] || 0) + m.quantity;
  });

  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg">Analítica de Inventario</CardTitle>
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <Button
              size="sm"
              variant={activeTab === "activity" ? "default" : "ghost"}
              className="h-7 text-xs"
              onClick={() => setActiveTab("activity")}
            >
              Entradas vs Salidas
            </Button>
            <Button
              size="sm"
              variant={activeTab === "categories" ? "default" : "ghost"}
              className="h-7 text-xs"
              onClick={() => setActiveTab("categories")}
            >
              Por Categoría
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === "activity" ? (
          <div className="h-72 w-full pt-4">
            {activityData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No hay datos suficientes para el gráfico de actividad
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="salidas" name="Salidas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        ) : (
          <div className="h-72 w-full pt-4">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No hay datos suficientes de categorías
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
