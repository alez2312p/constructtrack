"use client";

import { useState } from "react";
import { Sparkles, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetDemoAction } from "@/actions/demo";
import { toast } from "sonner";

export function DemoBanner() {
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const res = await resetDemoAction();
      if (res.success) {
        toast.success("Datos de prueba restablecidos al estado inicial");
      } else {
        toast.error(res.error || "No se pudo restablecer los datos");
      }
    } catch {
      toast.error("Error al restablecer los datos de demostración");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-950 dark:text-amber-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center p-1 bg-amber-500/20 rounded-full text-amber-600 dark:text-amber-400">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <span className="font-semibold">Modo Demostración Activo:</span>
        <span className="text-muted-foreground hidden sm:inline">
          Interactúa libremente. Ningún cambio afectará la base de datos real.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
          disabled={isResetting}
          className="h-7 text-xs border-amber-500/30 hover:bg-amber-500/10 gap-1.5"
        >
          {isResetting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RotateCcw className="h-3 w-3" />
          )}
          Reiniciar datos
        </Button>
      </div>
    </div>
  );
}
