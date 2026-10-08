"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Material } from "@/lib/type";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Printer, Search, CheckSquare, Square, Layers, Tag } from "lucide-react";
import { toast } from "sonner";

interface BatchQRPrintModalProps {
  materials: Material[];
}

export function BatchQRPrintModal({ materials }: BatchQRPrintModalProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(materials.map((m) => m.id)));
  const [format, setFormat] = useState<"sheet" | "thermal" | "shelf">("sheet");
  const [copiesPerItem, setCopiesPerItem] = useState<number>(1);
  const [showLocation, setShowLocation] = useState(true);
  const [generating, setGenerating] = useState(false);

  const filtered = materials.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.sku && m.sku.toLowerCase().includes(q)) ||
      (m.category && m.category.name.toLowerCase().includes(q)) ||
      (m.location && m.location.name.toLowerCase().includes(q))
    );
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === materials.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(materials.map((m) => m.id)));
    }
  };

  const toggleItem = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectedMaterials = materials.filter((m) => selectedIds.has(m.id));

  const handlePrint = async () => {
    if (selectedMaterials.length === 0) {
      toast.error("Selecciona al menos un material para imprimir etiquetas.");
      return;
    }

    setGenerating(true);
    toast.info("Generando etiquetas QR de alta resolución...");

    try {
      // Pre-generate all QR data URLs
      const qrDataMap: Record<string, string> = {};
      await Promise.all(
        selectedMaterials.map(async (m) => {
          const payload = JSON.stringify({
            id: m.id,
            sku: m.sku || m.id,
            name: m.name,
            unit: m.unit,
            category: m.category?.name || undefined,
            location: m.location?.name || undefined,
            unitCost: m.unitCost || undefined,
          });
          const url = await QRCode.toDataURL(payload, {
            width: 250,
            margin: 1,
            color: { dark: "#09090b", light: "#ffffff" },
          });
          qrDataMap[m.id] = url;
        })
      );

      // Expand items by copiesPerItem
      const itemsToPrint: Material[] = [];
      for (const m of selectedMaterials) {
        for (let c = 0; c < copiesPerItem; c++) {
          itemsToPrint.push(m);
        }
      }

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Las ventanas emergentes están bloqueadas en tu navegador.");
        setGenerating(false);
        return;
      }

      const getStyles = () => {
        if (format === "thermal") {
          return `
            @page { size: 80mm auto; margin: 3mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 0;
              padding: 0;
              color: #000;
              background: #fff;
            }
            .label-item {
              width: 74mm;
              margin: 0 auto 8mm auto;
              padding: 8px;
              border: 1px dashed #444;
              border-radius: 4px;
              text-align: center;
              box-sizing: border-box;
              page-break-after: always;
            }
            .title { font-size: 13px; font-weight: bold; margin-bottom: 2px; line-height: 1.2; word-break: break-word; }
            .sku { font-size: 10px; font-family: monospace; color: #333; margin-bottom: 4px; }
            .qr-img { width: 120px; height: 120px; margin: 0 auto; display: block; }
            .meta { font-size: 9px; color: #555; margin-top: 4px; }
          `;
        } else if (format === "shelf") {
          return `
            @page { size: A4 portrait; margin: 10mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 0;
              padding: 0;
              color: #000;
              background: #fff;
            }
            .grid-shelf {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8mm;
            }
            .label-item {
              border: 2px solid #0f172a;
              border-radius: 8px;
              padding: 14px;
              display: flex;
              align-items: center;
              gap: 12px;
              background: #fafafa;
              box-sizing: border-box;
              break-inside: avoid;
            }
            .qr-img { width: 110px; height: 110px; flex-shrink: 0; }
            .content { flex: 1; min-width: 0; }
            .title { font-size: 15px; font-weight: 800; color: #0f172a; line-height: 1.2; margin-bottom: 4px; word-break: break-word; }
            .sku { font-size: 11px; font-family: monospace; font-weight: 700; color: #475569; }
            .badge { display: inline-block; background: #e2e8f0; font-size: 10px; padding: 2px 6px; border-radius: 3px; font-weight: 600; margin-top: 4px; margin-right: 4px; }
          `;
        } else {
          // Standard A4 Sheet Sticker (3 columns x 8 rows = 24 per page)
          return `
            @page { size: A4 portrait; margin: 10mm 7mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 0;
              padding: 0;
              color: #000;
              background: #fff;
            }
            .grid-sheet {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 3mm;
            }
            .label-item {
              border: 1px dashed #cbd5e1;
              border-radius: 6px;
              padding: 6px 8px;
              display: flex;
              align-items: center;
              gap: 8px;
              height: 33mm;
              box-sizing: border-box;
              break-inside: avoid;
              overflow: hidden;
            }
            .qr-img { width: 68px; height: 68px; flex-shrink: 0; }
            .content { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
            .brand { font-size: 8px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
            .title { font-size: 11px; font-weight: 700; color: #0f172a; line-height: 1.15; margin: 2px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            .sku { font-size: 9px; font-family: monospace; color: #475569; }
            .badge { font-size: 8px; color: #64748b; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          `;
        }
      };

      const labelsHtml = itemsToPrint
        .map((m) => {
          const qrUrl = qrDataMap[m.id];
          if (format === "thermal") {
            return `
              <div class="label-item">
                <div class="title">${m.name}</div>
                <div class="sku">SKU: ${m.sku || m.id.slice(0, 10)} | ${m.unit}</div>
                <img src="${qrUrl}" class="qr-img" />
                ${showLocation && m.location ? `<div class="meta">Ubicación: ${m.location.name}</div>` : ""}
                <div class="meta">ConstructTrack</div>
              </div>
            `;
          } else if (format === "shelf") {
            return `
              <div class="label-item">
                <img src="${qrUrl}" class="qr-img" />
                <div class="content">
                  <div class="title">${m.name}</div>
                  <div class="sku">SKU: ${m.sku || m.id.slice(0, 10)}</div>
                  <div>
                    <span class="badge">Unidad: ${m.unit}</span>
                    ${m.category ? `<span class="badge">${m.category.name}</span>` : ""}
                    ${showLocation && m.location ? `<span class="badge">📍 ${m.location.name}</span>` : ""}
                  </div>
                </div>
              </div>
            `;
          } else {
            return `
              <div class="label-item">
                <img src="${qrUrl}" class="qr-img" />
                <div class="content">
                  <span class="brand">ConstructTrack</span>
                  <div class="title">${m.name}</div>
                  <div class="sku">SKU: ${m.sku || m.id.slice(0, 8)}</div>
                  <div class="badge">
                    ${m.unit}${showLocation && m.location ? ` • ${m.location.name}` : ""}
                  </div>
                </div>
              </div>
            `;
          }
        })
        .join("");

      const wrapperClass =
        format === "shelf" ? "grid-shelf" : format === "sheet" ? "grid-sheet" : "";

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Etiquetas QR Masivas - ConstructTrack</title>
            <style>${getStyles()}</style>
          </head>
          <body>
            <div class="${wrapperClass}">
              ${labelsHtml}
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      toast.success("Ventana de impresión enviada.");
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error al generar las etiquetas.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <QrCode className="h-4 w-4" />
        Etiquetas QR
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Impresión Masiva de Etiquetas QR
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 overflow-y-auto flex-1">
            {/* Format Selection Cards */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Formato de Impresión
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormat("sheet")}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    format === "sheet"
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium text-xs text-foreground">
                    <Layers className="h-4 w-4 text-primary" />
                    Pliego A4 Adhesivo
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    3x8 por hoja (24 etiquetas). Ideal hojas de stickers estándar.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat("shelf")}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    format === "shelf"
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium text-xs text-foreground">
                    <Tag className="h-4 w-4 text-primary" />
                    Tarjetas de Estantería
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    2x4 por hoja (8 etiquetas grandes). Para racks de bodega.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat("thermal")}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    format === "thermal"
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium text-xs text-foreground">
                    <Printer className="h-4 w-4 text-primary" />
                    Rollo Térmico (80mm)
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Impresora térmica directa o de etiquetas continua.
                  </p>
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-lg border text-xs">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showLocation}
                    onChange={(e) => setShowLocation(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span>Mostrar Ubicación de Bodega</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Copias por material:</span>
                <select
                  value={copiesPerItem}
                  onChange={(e) => setCopiesPerItem(Number(e.target.value))}
                  className="bg-background border rounded px-2 py-1 text-xs font-medium"
                >
                  <option value={1}>1 copia</option>
                  <option value={2}>2 copias</option>
                  <option value={3}>3 copias</option>
                  <option value={4}>4 copias</option>
                  <option value={5}>5 copias</option>
                </select>
              </div>
            </div>

            {/* Search & Material Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Filtrar materiales por nombre, SKU o ubicación..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleSelectAll}
                  className="text-xs h-8 gap-1.5"
                >
                  {selectedIds.size === materials.length ? (
                    <>
                      <CheckSquare className="h-3.5 w-3.5 text-primary" />
                      Deseleccionar Todos
                    </>
                  ) : (
                    <>
                      <Square className="h-3.5 w-3.5 text-muted-foreground" />
                      Seleccionar Todos ({materials.length})
                    </>
                  )}
                </Button>
              </div>

              {/* Material List Checkboxes */}
              <div className="border rounded-md max-h-52 overflow-y-auto divide-y bg-background text-xs">
                {filtered.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No se encontraron materiales que coincidan con la búsqueda.
                  </div>
                ) : (
                  filtered.map((m) => {
                    const isSelected = selectedIds.has(m.id);
                    return (
                      <div
                        key={m.id}
                        onClick={() => toggleItem(m.id)}
                        className={`flex items-center justify-between p-2.5 cursor-pointer hover:bg-muted/40 transition-colors ${
                          isSelected ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Controlled by row click
                            className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                          <div className="truncate">
                            <span className="font-semibold text-foreground">{m.name}</span>
                            <span className="text-muted-foreground font-mono ml-2">
                              {m.sku ? `[${m.sku}]` : `[ID:${m.id.slice(0, 6)}]`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 text-muted-foreground text-[11px]">
                          {m.location && <span>📍 {m.location.name}</span>}
                          <span className="font-medium bg-muted px-1.5 py-0.5 rounded">
                            {m.currentStock} {m.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-xs text-muted-foreground">
              Total etiquetas a imprimir:{" "}
              <strong className="text-foreground">
                {selectedMaterials.length * copiesPerItem}
              </strong>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handlePrint}
                disabled={selectedMaterials.length === 0 || generating}
                className="gap-1.5 bg-primary text-primary-foreground font-medium"
              >
                <Printer className="h-4 w-4" />
                {generating ? "Generando..." : "Imprimir Etiquetas"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
