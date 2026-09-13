"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { MovementData } from "@/lib/type";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, FileText, CheckCircle2, Building2, Truck, UserCheck } from "lucide-react";

interface MovementReceiptModalProps {
  movement: MovementData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovementReceiptModal({
  movement,
  open,
  onOpenChange,
}: MovementReceiptModalProps) {
  const [qrUrl, setQrUrl] = useState<string>("");
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && movement) {
      const payload = JSON.stringify({
        id: movement.id,
        tipo: movement.type,
        material: movement.material.name,
        cantidad: movement.quantity,
        unidad: movement.material.unit,
        fecha: movement.date,
        obra: movement.project?.name || null,
        receptor: movement.receiverName || null,
      });

      QRCode.toDataURL(payload, {
        width: 150,
        margin: 1,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((url) => setQrUrl(url))
        .catch((err) => console.error("Error generating QR:", err));
    }
  }, [open, movement]);

  if (!movement) return null;

  const isExit = movement.type === "OUT";
  const docTitle = isExit ? "VALE DE SALIDA A OBRA" : "COMPROBANTE DE INGRESO";
  const formattedDate = new Date(movement.date).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrint = (format: "standard" | "ticket") => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const ticketStyles = `
      @page { size: 80mm auto; margin: 3mm; }
      body {
        font-family: 'Courier New', Courier, monospace, sans-serif;
        width: 74mm;
        margin: 0 auto;
        padding: 4px;
        color: #000;
        font-size: 11px;
      }
      .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
      .title { font-size: 13px; font-weight: bold; margin: 4px 0; }
      .meta-row { display: flex; justify-content: space-between; margin: 2px 0; }
      .divider { border-top: 1px dashed #000; margin: 6px 0; }
      .item-table { width: 100%; text-align: left; border-collapse: collapse; margin: 6px 0; }
      .item-table th { border-bottom: 1px solid #000; font-size: 10px; }
      .signature-box { text-align: center; margin-top: 15px; border-top: 1px dotted #000; padding-top: 4px; }
      .sig-img { max-height: 40px; margin: 4px auto; display: block; }
      .qr-center { text-align: center; margin-top: 8px; }
      .qr-center img { width: 80px; height: 80px; }
    `;

    const standardStyles = `
      @page { size: letter; margin: 15mm; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #111;
        padding: 10px;
        margin: 0;
        font-size: 13px;
        line-height: 1.4;
      }
      .receipt-container {
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 24px;
        max-width: 750px;
        margin: 0 auto;
      }
      .header-flex {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 2px solid #0f172a;
        padding-bottom: 12px;
        margin-bottom: 16px;
      }
      .company-name { font-size: 20px; font-weight: 800; color: #0f172a; }
      .doc-badge {
        background: ${isExit ? "#ef4444" : "#10b981"};
        color: white;
        padding: 4px 10px;
        border-radius: 4px;
        font-weight: bold;
        font-size: 12px;
        display: inline-block;
        margin-top: 4px;
      }
      .meta-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        background: #f8fafc;
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 16px;
      }
      .meta-item { font-size: 12px; }
      .meta-item strong { display: block; color: #475569; font-size: 11px; text-transform: uppercase; }
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 16px;
      }
      .items-table th {
        background: #f1f5f9;
        text-align: left;
        padding: 8px 10px;
        font-size: 11px;
        text-transform: uppercase;
        border-bottom: 1px solid #cbd5e1;
      }
      .items-table td {
        padding: 10px;
        border-bottom: 1px solid #e2e8f0;
      }
      .signatures-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
        margin-top: 30px;
        padding-top: 16px;
      }
      .signature-card {
        border-top: 1px solid #94a3b8;
        padding-top: 8px;
        text-align: center;
      }
      .sig-image-container {
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 4px;
      }
      .sig-image-container img { max-height: 55px; }
      .footer-note {
        margin-top: 20px;
        text-align: center;
        font-size: 10px;
        color: #94a3b8;
        border-top: 1px dashed #e2e8f0;
        padding-top: 8px;
      }
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle} - ${movement.id.slice(0, 8)}</title>
          <style>${format === "ticket" ? ticketStyles : standardStyles}</style>
        </head>
        <body>
          ${
            format === "ticket"
              ? `
            <div class="header">
              <div style="font-weight: bold; font-size: 14px;">CONSTRUCTTRACK</div>
              <div>Control de Materiales y Obras</div>
              <div class="title">${docTitle}</div>
              <div style="font-size: 10px;">Folio: ${movement.id}</div>
            </div>

            <div class="meta-row"><span>Fecha:</span><span>${formattedDate}</span></div>
            <div class="meta-row"><span>Tipo:</span><span>${isExit ? "SALIDA" : "ENTRADA"}</span></div>
            ${movement.project ? `<div class="meta-row"><span>Obra:</span><span>${movement.project.name}</span></div>` : ""}
            ${movement.supplier ? `<div class="meta-row"><span>Proveedor:</span><span>${movement.supplier.name}</span></div>` : ""}
            ${movement.receiverName ? `<div class="meta-row"><span>Receptor:</span><span>${movement.receiverName}</span></div>` : ""}

            <div class="divider"></div>

            <table class="item-table">
              <thead>
                <tr><th>Material</th><th style="text-align: right;">Cant.</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    ${movement.material.name}
                    ${movement.material.sku ? `<br/><small>${movement.material.sku}</small>` : ""}
                  </td>
                  <td style="text-align: right; font-weight: bold;">
                    ${movement.quantity} ${movement.material.unit}
                  </td>
                </tr>
              </tbody>
            </table>

            ${movement.notes ? `<div style="font-size: 10px; margin: 4px 0;"><strong>Notas:</strong> ${movement.notes}</div>` : ""}

            ${
              movement.signature
                ? `
              <div class="signature-box">
                <img src="${movement.signature}" class="sig-img" />
                <div>Firma: ${movement.receiverName || "Receptor"}</div>
              </div>
            `
                : `
              <div class="signature-box" style="padding-top: 30px;">
                <div>__________________________</div>
                <div>Firma: ${movement.receiverName || "Receptor"}</div>
              </div>
            `
            }

            <div class="qr-center">
              <img src="${qrUrl}" />
              <div style="font-size: 9px; color: #555;">Escaneo de Verificación</div>
            </div>
          `
              : `
            <div class="receipt-container">
              <div class="header-flex">
                <div>
                  <div class="company-name">ConstructTrack</div>
                  <div style="color: #64748b; font-size: 12px;">Sistema Integral de Control de Inventario y Frentes de Obra</div>
                  <div class="doc-badge">${docTitle}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 11px; color: #64748b;">Folio Único:</div>
                  <div style="font-family: monospace; font-size: 13px; font-weight: bold;">${movement.id}</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Fecha de emisión:</div>
                  <div style="font-weight: 500;">${formattedDate}</div>
                </div>
              </div>

              <div class="meta-grid">
                <div class="meta-item">
                  <strong>Responsable Almacén (Despachador)</strong>
                  <span>${movement.user.name}</span>
                </div>
                <div class="meta-item">
                  <strong>${isExit ? "Obra / Frente de Destino" : "Proveedor de Origen"}</strong>
                  <span>
                    ${
                      isExit
                        ? movement.project
                          ? `${movement.project.name} ${movement.project.code ? `(${movement.project.code})` : ""}`
                          : "Almacén Central / No asignada"
                        : movement.supplier?.name || "Proveedor general"
                    }
                  </span>
                </div>
                <div class="meta-item">
                  <strong>Responsable de Recepción</strong>
                  <span>${movement.receiverName || "Personal en obra / Sin especificar"}</span>
                </div>
                <div class="meta-item">
                  <strong>Estado de Trazabilidad</strong>
                  <span style="color: #16a34a; font-weight: 600;">✓ Registrado y Auditado</span>
                </div>
              </div>

              <table class="items-table">
                <thead>
                  <tr>
                    <th>Código / SKU</th>
                    <th>Descripción del Material</th>
                    <th>Categoría</th>
                    <th style="text-align: right;">Cantidad</th>
                    <th style="text-align: right;">Unidad</th>
                    <th style="text-align: right;">Precio Unit.</th>
                    <th style="text-align: right;">Total Estimado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="font-family: monospace;">${movement.material.sku || movement.material.id.slice(0, 8)}</td>
                    <td style="font-weight: 600;">${movement.material.name}</td>
                    <td>${movement.material.category?.name || "General"}</td>
                    <td style="text-align: right; font-weight: bold; font-size: 14px;">${movement.quantity}</td>
                    <td style="text-align: right;">${movement.material.unit}</td>
                    <td style="text-align: right;">${movement.unitPrice ? `$${movement.unitPrice.toFixed(2)}` : "-"}</td>
                    <td style="text-align: right; font-weight: 600;">
                      ${movement.unitPrice ? `$${(movement.unitPrice * movement.quantity).toFixed(2)}` : "-"}
                    </td>
                  </tr>
                </tbody>
              </table>

              ${
                movement.notes
                  ? `
                <div style="background: #f8fafc; padding: 10px; border-radius: 4px; margin-bottom: 20px; font-size: 12px;">
                  <strong>Observaciones / Notas:</strong> ${movement.notes}
                </div>
              `
                  : ""
              }

              <div class="signatures-grid">
                <div class="signature-card">
                  <div class="sig-image-container">
                    <span style="color: #94a3b8; font-size: 11px;">(Firma autorizada)</span>
                  </div>
                  <strong>Entregado por (Almacén)</strong>
                  <div style="font-size: 11px; color: #64748b;">${movement.user.name}</div>
                </div>

                <div class="signature-card">
                  <div class="sig-image-container">
                    ${
                      movement.signature
                        ? `<img src="${movement.signature}" alt="Firma digital" />`
                        : `<span style="color: #94a3b8; font-size: 11px;">(Firma física al recibir)</span>`
                    }
                  </div>
                  <strong>Recibido a Conformidad (Obra)</strong>
                  <div style="font-size: 11px; color: #64748b;">${movement.receiverName || "Receptor en Obra"}</div>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                <div style="font-size: 10px; color: #94a3b8;">
                  ConstructTrack Enterprise • Documento de control interno no válido como factura tributaria.<br/>
                  Impreso el ${new Date().toLocaleString("es-ES")}
                </div>
                <div>
                  <img src="${qrUrl}" style="width: 70px; height: 70px;" />
                </div>
              </div>
            </div>
          `
          }
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Comprobante de Movimiento
          </DialogTitle>
        </DialogHeader>

        <div ref={receiptRef} className="border rounded-lg p-5 space-y-4 bg-muted/20">
          {/* Header Preview */}
          <div className="flex items-start justify-between border-b pb-3">
            <div>
              <span className="font-bold text-base tracking-tight">ConstructTrack</span>
              <p className="text-xs text-muted-foreground">Control de Materiales y Obras</p>
              <div className="mt-1">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded text-white ${
                    isExit ? "bg-red-600" : "bg-emerald-600"
                  }`}
                >
                  {docTitle}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Folio</p>
              <p className="font-mono text-xs font-bold">{movement.id.slice(0, 10)}</p>
              <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-background p-3 rounded border">
            <div>
              <p className="text-muted-foreground font-medium">Material:</p>
              <p className="font-semibold text-sm">{movement.material.name}</p>
              {movement.material.sku && (
                <p className="text-muted-foreground font-mono">SKU: {movement.material.sku}</p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Cantidad despachada:</p>
              <p className="font-bold text-base text-primary">
                {movement.quantity} {movement.material.unit}
              </p>
            </div>

            {movement.project && (
              <div className="col-span-2 flex items-center gap-1.5 pt-1 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span>Obra: <strong>{movement.project.name}</strong></span>
              </div>
            )}

            {movement.supplier && (
              <div className="col-span-2 flex items-center gap-1.5 pt-1 text-muted-foreground">
                <Truck className="h-3.5 w-3.5 text-primary" />
                <span>Proveedor: <strong>{movement.supplier.name}</strong></span>
              </div>
            )}

            {movement.receiverName && (
              <div className="col-span-2 flex items-center gap-1.5 pt-1 text-muted-foreground">
                <UserCheck className="h-3.5 w-3.5 text-primary" />
                <span>Receptor: <strong>{movement.receiverName}</strong></span>
              </div>
            )}
          </div>

          {/* Digital Signature Preview */}
          {movement.signature && (
            <div className="space-y-1.5 bg-background p-3 rounded border">
              <p className="text-xs font-medium flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Firma Digital de Recepción:
              </p>
              <div className="border rounded bg-white p-2 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={movement.signature} alt="Firma" className="max-h-16 object-contain" />
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                Firmado digitalmente por {movement.receiverName || "Receptor"}
              </p>
            </div>
          )}
        </div>

        {/* Print Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t">
          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2"
            onClick={() => handlePrint("ticket")}
          >
            <Printer className="h-4 w-4" />
            Imprimir Ticket (80mm)
          </Button>

          <Button
            className="w-full sm:w-auto gap-2 bg-primary"
            onClick={() => handlePrint("standard")}
          >
            <Printer className="h-4 w-4" />
            Imprimir Hoja Carta / A4
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
