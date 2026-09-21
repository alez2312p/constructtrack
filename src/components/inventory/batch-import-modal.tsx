"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { importMaterialsBatch } from "@/actions/materials";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileSpreadsheet, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ParsedMaterial {
  name: string;
  unit: string;
  minStock: number;
  initialStock: number;
  unitCost: number;
  sku: string | null;
}

export function BatchImportModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const templateData = [
      {
        Nombre: "Cemento Portland Tipo I",
        Unidad: "bolsa 42.5kg",
        StockMinimo: 20,
        StockInicial: 100,
        CostoUnitario: 8.5,
        SKU: "CEM-001",
      },
      {
        Nombre: "Fierro Corrugado 1/2 pulgada",
        Unidad: "varilla 9m",
        StockMinimo: 50,
        StockInicial: 200,
        CostoUnitario: 14.2,
        SKU: "FIE-012",
      },
      {
        Nombre: "Arena Gruesa",
        Unidad: "m3",
        StockMinimo: 10,
        StockInicial: 35,
        CostoUnitario: 25.0,
        SKU: "ARE-003",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla");
    XLSX.writeFile(workbook, "plantilla_carga_materiales.xlsx");
    toast.success("Plantilla descargada");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

        const items: ParsedMaterial[] = [];

        for (const row of json) {
          // Flexible header mapping
          const name = String(row["Nombre"] || row["nombre"] || row["Material"] || row["name"] || "").trim();
          const unit = String(row["Unidad"] || row["unidad"] || row["unit"] || "unidad").trim();
          const minStock = Number(row["StockMinimo"] || row["stockMinimo"] || row["minStock"] || 0);
          const initialStock = Number(row["StockInicial"] || row["stockInicial"] || row["initialStock"] || row["Cantidad"] || 0);
          const unitCost = Number(row["CostoUnitario"] || row["costoUnitario"] || row["unitCost"] || row["Precio"] || 0);
          const sku = String(row["SKU"] || row["sku"] || row["Codigo"] || "").trim() || null;

          if (name) {
            items.push({
              name,
              unit: unit || "unidad",
              minStock: isNaN(minStock) ? 0 : minStock,
              initialStock: isNaN(initialStock) ? 0 : initialStock,
              unitCost: isNaN(unitCost) ? 0 : unitCost,
              sku,
            });
          }
        }

        if (items.length === 0) {
          toast.error("No se encontraron registros válidos en el archivo.");
        } else {
          setParsedItems(items);
          toast.success(`Se detectaron ${items.length} materiales listos para importar.`);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error al leer el archivo. Asegúrate que sea un .xlsx o .csv válido.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = async () => {
    if (parsedItems.length === 0) return;
    setLoading(true);

    try {
      const res = await importMaterialsBatch(parsedItems);
      if ("error" in res && res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>¡{parsedItems.length} materiales importados exitosamente!</span>
        </div>
      );

      setOpen(false);
      setParsedItems([]);
      setFileName(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al procesar la importación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" />
        Importar Excel
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            Carga Masiva de Materiales (.xlsx / .csv)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 overflow-y-auto flex-1">
          <div className="p-3 bg-muted/60 rounded-lg flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">¿No tienes el formato?</p>
              <p>Descarga la plantilla oficial con encabezados preconfigurados.</p>
            </div>
            <Button size="sm" variant="secondary" onClick={downloadTemplate} className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              Descargar Plantilla
            </Button>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">
              {fileName ? fileName : "Selecciona o arrastra tu archivo Excel o CSV"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Columnas: Nombre, Unidad, StockMinimo, StockInicial, CostoUnitario, SKU
            </p>
          </div>

          {parsedItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Vista Previa ({parsedItems.length} registros listos)
                </span>
                <span className="text-xs text-muted-foreground">
                  Mostrando primeros {Math.min(5, parsedItems.length)}
                </span>
              </div>
              <div className="border rounded-md overflow-hidden text-xs max-h-48 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Stock Inicial</TableHead>
                      <TableHead>Costo Unit.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedItems.slice(0, 5).map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.sku || "-"}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.initialStock}</TableCell>
                        <TableCell>${item.unitCost.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmImport}
            disabled={parsedItems.length === 0 || loading}
            className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5"
          >
            {loading ? "Importando..." : `Importar ${parsedItems.length} Materiales`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
