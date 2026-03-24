"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps {
  movements: Array<{
    date: Date;
    material: { name: string };
    type: string;
    quantity: number;
    user: { name: string };
    notes: string | null;
  }>;
  days?: string;
  from?: string;
  to?: string;
  materialId?: string;
  type?: string;
}

export function ExportButton({ movements, days, from, to, materialId, type }: ExportButtonProps) {
  const downloadCSV = () => {
    if (movements.length === 0) {
      toast.warning("No hay datos para exportar");
      return;
    }

    // Crear CSV manualmente
    const headers = ["Fecha", "Material", "Tipo", "Cantidad", "Usuario", "Notas"];
    const rows: string[][] = [];

    movements.forEach((m) => {
      rows.push([
        new Date(m.date).toLocaleString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        m.material.name,
        m.type === "IN" ? "Entrada" : "Salida",
        String(m.quantity),
        m.user.name,
        m.notes || "",
      ]);
    });

    // Unir todo con comas
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // Generar nombre de archivo según filtros
    let filename = "movimientos";
    if (days === "0") filename += "_hoy";
    else if (days === "7") filename += "_ultimos7dias";
    else if (days === "30") filename += "_ultimos30dias";
    else if (days === "90") filename += "_ultimos90dias";
    else if (from || to) filename += `_${from || "inicio"}_${to || "fin"}`;

    if (materialId) filename += "_material";
    if (type) filename += type === "IN" ? "_entradas" : "_salidas";

    link.download = `${filename}.csv`;
    link.click();
  };

  return (
    <Button onClick={downloadCSV} className="gap-2">
      <Download className="h-4 w-4" />
      Exportar CSV
    </Button>
  );
}
