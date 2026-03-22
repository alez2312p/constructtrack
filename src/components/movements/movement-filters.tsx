"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FiltersProps {
  days: string;
  from: string;
  to: string;
  materialId: string;
  type: string;
  materials: Array<{ id: string; name: string }>;
}

function buildQueryString(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });
  return searchParams.toString();
}

export function Filters({ days, from, to, materialId, type, materials }: FiltersProps) {

  const getQuickFilterUrl = (daysValue: string) => {
    const query = buildQueryString({
      days: daysValue,
      materialId,
      type,
    });
    return `/movements/history?${query}`;
  };

  const isCustomRange = !days || days === "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Link
            href={getQuickFilterUrl("0")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${days === "0" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
          >
            Hoy
          </Link>
          <Link
            href={getQuickFilterUrl("7")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${days === "7" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
          >
            7 días
          </Link>
          <Link
            href={getQuickFilterUrl("30")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${days === "30" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
          >
            30 días
          </Link>
          <Link
            href={getQuickFilterUrl("90")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${days === "90" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
          >
            90 días
          </Link>
          <Link
            href={buildQueryString({ materialId, type }) ? `/movements/history?${buildQueryString({ materialId, type })}` : "/movements/history"}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isCustomRange ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
          >
            Personalizado
          </Link>
        </div>

        <form className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <input type="hidden" name="days" value={days} />
          <div className={!isCustomRange ? "opacity-40 pointer-events-none" : ""}>
            <label className="text-sm font-medium mb-1 block">Desde</label>
            <Input
              type="date"
              name="from"
              defaultValue={from}
              className="w-full"
              disabled={!isCustomRange}
            />
          </div>

          <div className={!isCustomRange ? "opacity-40 pointer-events-none" : ""}>
            <label className="text-sm font-medium mb-1 block">Hasta</label>
            <Input
              type="date"
              name="to"
              defaultValue={to}
              className="w-full"
              disabled={!isCustomRange}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Material</label>
            <select
              name="materialId"
              defaultValue={materialId}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Todos</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Tipo</label>
            <select
              name="type"
              defaultValue={type}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Todos</option>
              <option value="IN">Entrada</option>
              <option value="OUT">Salida</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Aplicar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
