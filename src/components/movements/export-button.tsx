"use client";

import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface ExportButtonProps {
  movements: Array<{
    date: Date;
    material: { name: string; unit?: string };
    type: string;
    quantity: number;
    user: { name: string };
    notes: string | null;
    project?: { name: string } | null;
    supplier?: { name: string } | null;
    receiverName?: string | null;
    unitPrice?: number | null;
  }>;
  days?: string;
  from?: string;
  to?: string;
  materialId?: string;
  type?: string;
}

export function ExportButton({ movements, days, from, to, materialId, type }: ExportButtonProps) {
  const getFilename = () => {
    let filename = "movimientos";
    if (days === "0") filename += "_hoy";
    else if (days === "7") filename += "_ultimos7dias";
    else if (days === "30") filename += "_ultimos30dias";
    else if (days === "90") filename += "_ultimos90dias";
    else if (from || to) filename += `_${from || "inicio"}_${to || "fin"}`;
    if (materialId) filename += "_material";
    if (type) filename += type === "IN" ? "_entradas" : "_salidas";
    return filename;
  };

  const downloadExcel = () => {
    if (movements.length === 0) {
      toast.warning("No hay datos para exportar");
      return;
    }

    const data = movements.map((m) => ({
      Fecha: new Date(m.date).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      Material: m.material.name,
      Tipo: m.type === "IN" ? "Entrada" : "Salida",
      Cantidad: m.quantity,
      Unidad: m.material.unit || "uds",
      "Obra / Destino": m.project?.name || "N/A",
      Proveedor: m.supplier?.name || "N/A",
      "Receptor / Resp.": m.receiverName || "N/A",
      "Precio Unit. ($)": m.unitPrice ?? 0,
      "Total ($)": (m.unitPrice ?? 0) * m.quantity,
      Usuario: m.user.name,
      Notas: m.notes || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Movimientos");
    XLSX.writeFile(workbook, `${getFilename()}.xlsx`);
    toast.success("Excel descargado correctamente");
  };

  const downloadCSV = () => {
    if (movements.length === 0) {
      toast.warning("No hay datos para exportar");
      return;
    }

    const headers = [
      "Fecha",
      "Material",
      "Tipo",
      "Cantidad",
      "Obra",
      "Proveedor",
      "Receptor",
      "Usuario",
      "Notas",
    ];
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
        m.project?.name || "",
        m.supplier?.name || "",
        m.receiverName || "",
        m.user.name,
        m.notes || "",
      ]);
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${getFilename()}.csv`;
    link.click();
    toast.success("CSV descargado correctamente");
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={downloadExcel} className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white">
        <FileSpreadsheet className="h-4 w-4" />
        Exportar Excel (.xlsx)
      </Button>
      <Button onClick={downloadCSV} variant="outline" className="gap-2">
        <Download className="h-4 w-4" />
        CSV
      </Button>
    </div>
  );
}
