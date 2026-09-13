"use client";

import { useState } from "react";
import { Material, Category, Location } from "@/lib/type";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardList, Printer, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface PhysicalInventoryPrintModalProps {
  materials: Material[];
  categories: Category[];
  locations: Location[];
}

export function PhysicalInventoryPrintModal({
  materials,
  categories,
  locations,
}: PhysicalInventoryPrintModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [groupBy, setGroupBy] = useState<"location" | "category" | "flat">("location");
  const [blindAudit, setBlindAudit] = useState(false);
  const [extraRows, setExtraRows] = useState(5);
  const [auditorName, setAuditorName] = useState("");
  const [warehouseTitle, setWarehouseTitle] = useState("Bodega Central / Obra");

  // Filter materials
  const filteredMaterials = materials.filter((m) => {
    if (selectedLocationId !== "all" && m.locationId !== selectedLocationId) return false;
    if (selectedCategoryId !== "all" && m.categoryId !== selectedCategoryId) return false;
    return true;
  });

  const handlePrint = () => {
    if (filteredMaterials.length === 0) {
      toast.error("No hay materiales seleccionados para generar la hoja de conteo.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Las ventanas emergentes están bloqueadas en tu navegador.");
      return;
    }

    const todayDate = new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Grouping logic
    type GroupedData = { groupTitle: string; items: Material[] }[];
    let grouped: GroupedData = [];

    if (groupBy === "location") {
      const map = new Map<string, Material[]>();
      for (const m of filteredMaterials) {
        const key = m.location?.name || "Sin Ubicación Asignada";
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(m);
      }
      grouped = Array.from(map.entries()).map(([groupTitle, items]) => ({
        groupTitle: `📍 UBICACIÓN: ${groupTitle.toUpperCase()}`,
        items: items.sort((a, b) => a.name.localeCompare(b.name)),
      }));
    } else if (groupBy === "category") {
      const map = new Map<string, Material[]>();
      for (const m of filteredMaterials) {
        const key = m.category?.name || "Sin Categoría Asignada";
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(m);
      }
      grouped = Array.from(map.entries()).map(([groupTitle, items]) => ({
        groupTitle: `🏷️ CATEGORÍA: ${groupTitle.toUpperCase()}`,
        items: items.sort((a, b) => a.name.localeCompare(b.name)),
      }));
    } else {
      grouped = [
        {
          groupTitle: "LISTADO GENERAL DE MATERIALES",
          items: [...filteredMaterials].sort((a, b) => a.name.localeCompare(b.name)),
        },
      ];
    }

    const printStyles = `
      @page {
        size: A4 landscape;
        margin: 10mm 12mm;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #0f172a;
        margin: 0;
        padding: 0;
        font-size: 11px;
        line-height: 1.3;
      }
      .header-container {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 2px solid #0f172a;
        padding-bottom: 8px;
        margin-bottom: 12px;
      }
      .title-box h1 {
        font-size: 18px;
        font-weight: 800;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .title-box p {
        margin: 2px 0 0 0;
        color: #475569;
        font-size: 11px;
      }
      .meta-box {
        text-align: right;
        font-size: 10px;
        color: #334155;
      }
      .info-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        padding: 8px 12px;
        margin-bottom: 12px;
        font-size: 11px;
      }
      .info-grid div strong {
        display: block;
        font-size: 9px;
        color: #64748b;
        text-transform: uppercase;
      }
      .group-header {
        background: #0f172a;
        color: #fff;
        padding: 6px 10px;
        font-weight: 700;
        font-size: 12px;
        border-radius: 4px 4px 0 0;
        margin-top: 14px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 14px;
      }
      thead {
        display: table-header-group;
      }
      tr {
        break-inside: avoid;
      }
      th {
        background: #f1f5f9;
        color: #1e293b;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        border: 1px solid #cbd5e1;
        padding: 6px 8px;
        text-align: left;
      }
      td {
        border: 1px solid #cbd5e1;
        padding: 6px 8px;
        font-size: 10px;
        vertical-align: middle;
      }
      .col-check { width: 24px; text-align: center; }
      .col-num { width: 28px; text-align: center; color: #64748b; }
      .col-sku { width: 90px; font-family: monospace; font-size: 9px; }
      .col-unit { width: 65px; text-align: center; }
      .col-stock { width: 75px; text-align: right; font-weight: 600; background: #f8fafc; }
      .col-count { width: 85px; text-align: center; }
      .col-recount { width: 85px; text-align: center; }
      .col-diff { width: 75px; text-align: center; }
      .col-obs { width: 140px; }
      .box-input {
        border: 1px dashed #94a3b8;
        border-radius: 3px;
        height: 18px;
        background: #fff;
      }
      .check-box {
        width: 13px;
        height: 13px;
        border: 1.5px solid #475569;
        border-radius: 2px;
        display: inline-block;
      }
      .extra-row td {
        background: #fcfcfc;
        height: 22px;
      }
      .signatures-section {
        margin-top: 24px;
        break-inside: avoid;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 30px;
        padding-top: 15px;
      }
      .signature-card {
        border-top: 1px solid #475569;
        text-align: center;
        padding-top: 6px;
        font-size: 11px;
      }
      .signature-card strong {
        display: block;
        font-size: 11px;
        color: #0f172a;
      }
      .signature-card span {
        font-size: 9px;
        color: #64748b;
      }
      .footer-legal {
        margin-top: 16px;
        text-align: center;
        font-size: 8px;
        color: #94a3b8;
        border-top: 1px dotted #cbd5e1;
        padding-top: 6px;
      }
    `;

    let itemCounter = 1;

    const tablesHtml = grouped
      .map((g) => {
        const rows = g.items
          .map((m) => {
            const currentNum = itemCounter++;
            return `
              <tr>
                <td class="col-check"><span class="check-box"></span></td>
                <td class="col-num">${currentNum}</td>
                <td class="col-sku">${m.sku || m.id.slice(0, 8)}</td>
                <td>
                  <strong>${m.name}</strong>
                  ${m.category && groupBy !== "category" ? `<div style="font-size: 8px; color: #64748b;">${m.category.name}</div>` : ""}
                </td>
                <td class="col-unit">${m.unit}</td>
                ${groupBy !== "location" ? `<td>${m.location?.name || "Sin asignar"}</td>` : ""}
                ${!blindAudit ? `<td class="col-stock">${m.currentStock}</td>` : ""}
                <td class="col-count"><div class="box-input"></div></td>
                <td class="col-recount"><div class="box-input"></div></td>
                <td class="col-diff"><div class="box-input"></div></td>
                <td class="col-obs"></td>
              </tr>
            `;
          })
          .join("");

        // Add blank extra rows for write-ins
        let extraRowsHtml = "";
        for (let i = 0; i < extraRows; i++) {
          extraRowsHtml += `
            <tr class="extra-row">
              <td class="col-check"><span class="check-box"></span></td>
              <td class="col-num">+</td>
              <td class="col-sku"></td>
              <td style="color: #94a3b8; font-style: italic;">[ Ítem no registrado / hallazgo ]</td>
              <td class="col-unit"></td>
              ${groupBy !== "location" ? `<td></td>` : ""}
              ${!blindAudit ? `<td class="col-stock">-</td>` : ""}
              <td class="col-count"><div class="box-input"></div></td>
              <td class="col-recount"><div class="box-input"></div></td>
              <td class="col-diff"><div class="box-input"></div></td>
              <td class="col-obs"></td>
            </tr>
          `;
        }

        return `
          <div class="group-header">${g.groupTitle} (${g.items.length} materiales registrados)</div>
          <table>
            <thead>
              <tr>
                <th class="col-check">✓</th>
                <th class="col-num">#</th>
                <th class="col-sku">Código/SKU</th>
                <th>Descripción del Material</th>
                <th class="col-unit">Unidad</th>
                ${groupBy !== "location" ? `<th>Ubicación</th>` : ""}
                ${!blindAudit ? `<th class="col-stock">Stock Sist.</th>` : ""}
                <th class="col-count">1er Conteo</th>
                <th class="col-recount">Reconteo</th>
                <th class="col-diff">Diferencia</th>
                <th class="col-obs">Observaciones / Daño</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
              ${extraRowsHtml}
            </tbody>
          </table>
        `;
      })
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Planilla de Conteo Físico - ConstructTrack</title>
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="header-container">
            <div class="title-box">
              <h1>ConstructTrack Enterprise</h1>
              <p>Planilla Oficial de Toma de Inventario Físico y Auditoría de Existencias</p>
            </div>
            <div class="meta-box">
              <div><strong>Fecha de Emisión:</strong> ${todayDate}</div>
              <div><strong>Método:</strong> ${blindAudit ? "Conteo a Ciegas (Sin sesgo)" : "Conteo Comparativo"}</div>
              <div><strong>Total Registros:</strong> ${filteredMaterials.length} ítems</div>
            </div>
          </div>

          <div class="info-grid">
            <div>
              <strong>Instalación / Bodega:</strong>
              ${warehouseTitle || "Bodega Central"}
            </div>
            <div>
              <strong>Auditor / Responsable:</strong>
              ${auditorName || "Personal Asignado"}
            </div>
            <div>
              <strong>Criterio de Agrupación:</strong>
              ${groupBy === "location" ? "Por Ubicación de Bodega" : groupBy === "category" ? "Por Categoría" : "Listado Alfabético"}
            </div>
            <div>
              <strong>Modalidad de Control:</strong>
              ${blindAudit ? "Auditivo a Ciegas" : "Verificación Directa"}
            </div>
          </div>

          ${tablesHtml}

          <div class="signatures-section">
            <div class="signature-card">
              <div style="height: 35px;"></div>
              <strong>Auditor de Inventario</strong>
              <span>Nombre y Cédula de Identidad</span>
            </div>
            <div class="signature-card">
              <div style="height: 35px;"></div>
              <strong>Jefe de Bodega / Almacén</strong>
              <span>Firma y Sello de Recepción</span>
            </div>
            <div class="signature-card">
              <div style="height: 35px;"></div>
              <strong>Supervisor de Obra / Residente</strong>
              <span>Visto Bueno de Cierre de Auditoría</span>
            </div>
          </div>

          <div class="footer-legal">
            ConstructTrack Enterprise • Formulario de control y trazabilidad de activos de construcción.
            Prohibida la alteración de datos sin el visto bueno de jefatura de almacén.
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
    toast.success("Planilla de conteo físico lista para imprimir.");
  };

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <ClipboardList className="h-4 w-4" />
        Hoja de Conteo Físico
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Planilla de Conteo Físico para Bodega
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 overflow-y-auto flex-1 text-xs">
            <p className="text-muted-foreground">
              Genera una plantilla imprimible en formato horizontal (Landscape) con cuadrícula de
              cotejo para inventario cíclico o arqueo físico en almacén y frentes de obra.
            </p>

            {/* Custom Information Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/30 p-3 rounded-lg border">
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Bodega / Instalación
                </label>
                <Input
                  value={warehouseTitle}
                  onChange={(e) => setWarehouseTitle(e.target.value)}
                  placeholder="Ej: Bodega Central - Frente Norte"
                  className="mt-1 h-8 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Auditor / Responsable de Conteo
                </label>
                <Input
                  value={auditorName}
                  onChange={(e) => setAuditorName(e.target.value)}
                  placeholder="Ej: Juan Pérez (Almacenista)"
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-foreground">Filtrar por Ubicación:</label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full mt-1 bg-background border rounded px-2 py-1.5 font-medium text-xs"
                >
                  <option value="all">Todas las ubicaciones ({locations.length})</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground">Filtrar por Categoría:</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full mt-1 bg-background border rounded px-2 py-1.5 font-medium text-xs"
                >
                  <option value="all">Todas las categorías ({categories.length})</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grouping Mode */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Criterio de Agrupación:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setGroupBy("location")}
                  className={`p-2 rounded border text-center transition-all ${
                    groupBy === "location"
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  📍 Por Ubicación
                </button>
                <button
                  type="button"
                  onClick={() => setGroupBy("category")}
                  className={`p-2 rounded border text-center transition-all ${
                    groupBy === "category"
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  🏷️ Por Categoría
                </button>
                <button
                  type="button"
                  onClick={() => setGroupBy("flat")}
                  className={`p-2 rounded border text-center transition-all ${
                    groupBy === "flat"
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  📋 Lista Continua
                </button>
              </div>
            </div>

            {/* Blind Audit & Extra Rows Options */}
            <div className="bg-muted/40 p-3 rounded-lg border space-y-2.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={blindAudit}
                  onChange={(e) => setBlindAudit(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <div>
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                    Auditoría a Ciegas (Ocultar Stock del Sistema)
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Recomendado en auditorías formales: los conteos se realizan sin ver las cantidades
                    del sistema para evitar sesgo de confirmación por parte del personal.
                  </p>
                </div>
              </label>

              <div className="flex items-center justify-between pt-2 border-t text-xs">
                <span className="text-muted-foreground">Filas vacías adicionales por grupo:</span>
                <select
                  value={extraRows}
                  onChange={(e) => setExtraRows(Number(e.target.value))}
                  className="bg-background border rounded px-2 py-1 font-medium"
                >
                  <option value={0}>0 filas</option>
                  <option value={3}>+3 filas en blanco</option>
                  <option value={5}>+5 filas en blanco</option>
                  <option value={10}>+10 filas en blanco</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-xs text-muted-foreground">
              Materiales a incluir:{" "}
              <strong className="text-foreground">{filteredMaterials.length}</strong>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handlePrint}
                disabled={filteredMaterials.length === 0}
                className="gap-1.5 bg-primary text-primary-foreground font-medium"
              >
                <Printer className="h-4 w-4" />
                Imprimir Planilla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
