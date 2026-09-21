"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Material } from "@/lib/type";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Printer, Download } from "lucide-react";

interface MaterialQRModalProps {
  material: Material;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaterialQRModal({ material, open, onOpenChange }: MaterialQRModalProps) {
  const [qrUrl, setQrUrl] = useState<string>("");

  useEffect(() => {
    if (open && material) {
      // Encode a structured payload or material ID for scanner compatibility
      const payload = JSON.stringify({
        id: material.id,
        sku: material.sku || material.id,
        name: material.name,
      });

      QRCode.toDataURL(payload, {
        width: 300,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((url) => setQrUrl(url))
        .catch((err) => console.error("Error generating QR:", err));
    }
  }, [open, material]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiqueta QR - ${material.name}</title>
          <style>
            @page { size: auto; margin: 10mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 20px;
            }
            .label-card {
              border: 2px dashed #333;
              border-radius: 8px;
              padding: 16px;
              text-align: center;
              width: 240px;
            }
            .title { font-weight: bold; font-size: 16px; margin-bottom: 4px; word-break: break-word; }
            .sku { font-size: 11px; color: #666; font-family: monospace; margin-bottom: 12px; }
            .qr-img { width: 180px; height: 180px; display: block; margin: 0 auto; }
            .footer { font-size: 10px; color: #888; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="title">${material.name}</div>
            <div class="sku">SKU: ${material.sku || material.id.slice(0, 10)} | ${material.unit}</div>
            <img src="${qrUrl}" class="qr-img" />
            <div class="footer">ConstructTrack • Control de Inventario</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `QR_${material.name.replace(/\s+/g, "_")}.png`;
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Etiqueta QR de Material
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4 space-y-4">
          <div className="p-3 bg-white border rounded-xl shadow-sm flex items-center justify-center">
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrUrl} alt={`QR ${material.name}`} className="w-56 h-56 object-contain" />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-muted-foreground text-sm">
                Generando QR...
              </div>
            )}
          </div>

          <div className="text-center space-y-1">
            <p className="font-semibold text-base">{material.name}</p>
            <p className="text-xs text-muted-foreground font-mono">
              SKU: {material.sku || "Sin SKU"} • Unidad: {material.unit}
            </p>
            {material.category && (
              <p className="text-xs text-muted-foreground">Categoría: {material.category.name}</p>
            )}
          </div>

          <div className="flex items-center gap-2 w-full pt-2">
            <Button variant="outline" className="flex-1 gap-1.5 text-xs" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Descargar
            </Button>
            <Button className="flex-1 gap-1.5 text-xs" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
