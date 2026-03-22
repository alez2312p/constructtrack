"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerMovement } from "@/actions/movements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { StockAlert, StockAlertsProps } from "../../lib/type";
import StockCard from "./StockCard";
import RestockDialog from "./RestockDialog";

export function StockAlerts({ alerts }: StockAlertsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<StockAlert | null>(null);
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [isPending, setIsPending] = useState(false);

  const handleOpen = (material: StockAlert) => {
    setSelectedMaterial(material);
    setOpen(true);
  };

  const handleSubmit = async (formData: FormData) => {
    formData.set("type", type);
    formData.set("date", date);
    formData.set("materialId", selectedMaterial?.id || "");

    setIsPending(true);
    try {
      const result = await registerMovement(formData);

      // Check if result has error property (type guard)
      if ("error" in result) {
        toast.error(result.error, { duration: 5000 });
        return;
      }

      // If we get here, result is the success type
      const action = result.type === "IN" ? "Entrada" : "Salida";
      const sign = result.type === "IN" ? "+" : "-";

      toast.success(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle className="h-4 w-4" />
            ¡Movimiento registrado!
          </div>
          <div className="text-sm">
            {action}: {sign}{" "}{result.quantity}{" "}{result.materialUnit} de {result.materialName}
          </div>
        </div>
      );

      setOpen(false);
      setSelectedMaterial(null);
      setQuantity("");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Error inesperado. Inténtalo de nuevo.");
    } finally {
      setIsPending(false);
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  const critical = alerts.filter((a) => a.currentStock === 0);
  const warning = alerts.filter((a) => a.currentStock > 0);

  return (
    <Card className="border-red-200 dark:border-red-800 gap-2">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="text-red-500 dark:text-red-400" />
          Alertas de Stock
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {critical.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-base font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
              Stock Agotado ({critical.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {critical.map((material) => (
                <StockCard
                  key={material.id}
                  material={material}
                  variant="critical"
                  onRestock={handleOpen}
                />
              ))}
            </div>
          </div>
        )}
        {warning.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-base font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
              Stock Bajo ({warning.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {warning.map((material) => (
                <StockCard
                  key={material.id}
                  material={material}
                  variant="warning"
                  onRestock={handleOpen}
                />
              ))}
            </div>

            {/* Quick Reabastecer Dialog */}
            <RestockDialog
              open={open}
              onOpenChange={setOpen}
              selectedMaterial={selectedMaterial}
              onSubmit={handleSubmit}
              type={type}
              setType={setType}
              quantity={quantity}
              setQuantity={setQuantity}
              date={date}
              setDate={setDate}
              isPending={isPending}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
