"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";

interface CameraScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanSuccess: (decodedValue: string) => void;
}

export function CameraScannerModal({
  open,
  onOpenChange,
  onScanSuccess,
}: CameraScannerModalProps) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerId = "html5-qr-reader";

  useEffect(() => {
    if (!open) {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current
            .stop()
            .then(() => {
              scannerRef.current?.clear();
              scannerRef.current = null;
            })
            .catch(() => {});
        } else {
          scannerRef.current = null;
        }
      }
      return;
    }

    const timer = setTimeout(() => {
      setError(null);
      try {
        const scanner = new Html5Qrcode(readerId);
        scannerRef.current = scanner;

        scanner
          .start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 240, height: 240 },
            },
            (decodedText) => {
              // Parse possible JSON payload or plain ID/SKU
              let resolvedId = decodedText;
              try {
                const parsed = JSON.parse(decodedText);
                if (parsed.id) resolvedId = parsed.id;
              } catch {
                // Not JSON, use raw text
              }

              onScanSuccess(resolvedId);
              onOpenChange(false);
            },
            () => {
              // scanning frame without detection
            }
          )
          .catch((err) => {
            console.error("Camera error:", err);
            setError(
              "No se pudo acceder a la cámara. Verifica los permisos de tu navegador o prueba en HTTPS."
            );
          });
      } catch (e) {
        console.error("Scanner init error:", e);
        setError("Error al inicializar el lector de cámara.");
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {});
        }
      }
    };
  }, [open, onOpenChange, onScanSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Escanear Código QR de Material
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-2 space-y-3">
          <p className="text-xs text-muted-foreground text-center">
            Apunta la cámara al código QR impreso o en pantalla para autoseleccionar el material.
          </p>

          <div className="w-full relative overflow-hidden rounded-lg bg-black/90 aspect-square flex items-center justify-center">
            <div id={readerId} className="w-full h-full" />
            {error && (
              <div className="absolute inset-0 p-4 bg-background/90 flex flex-col items-center justify-center text-center">
                <p className="text-sm text-destructive font-medium mb-3">{error}</p>
                <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
                  Cerrar
                </Button>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-1.5 text-muted-foreground"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            Cancelar escaneo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
