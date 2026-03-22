"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { registerMovement, getMaterialsForSelect } from "@/actions/movements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Package, Plus, Minus, AlertTriangle, CheckCircle, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Material {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  category?: { name: string } | null;
  location?: { name: string } | null;
}


export function MovementForm() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hour}:${minute}`;
  });
  const [quickAmounts] = useState<number[]>([1, 5, 10]);
  const [materialSearch, setMaterialSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadMaterials() {
      const data = await getMaterialsForSelect();
      setMaterials(data);
    }
    loadMaterials();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMaterials = materials.filter((m) =>
    m.name.toLowerCase().includes(materialSearch.toLowerCase())
  );

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

      if (result.willBeLowStock) {
        toast.warning(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle className="h-4 w-4" />
              ¡Movimiento registrado!
            </div>
            <div className="text-sm">
              {action}: {sign}{" "}{result.quantity}{" "}{result.materialUnit} de {result.materialName}
            </div>
            <div className="text-sm font-semibold text-amber-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              El stock ha bajando del mínimo permitido
            </div>
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.success(
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle className="h-4 w-4" />
              ¡Movimiento registrado!
            </div>
            <div className="text-sm">
              {action}: {sign}{" "}{result.quantity}{" "}{result.materialUnit} de {result.materialName}
            </div>
            <div className="text-sm text-muted-foreground">
              Stock actual: {result.newStock} {result.materialUnit}
            </div>
          </div>
        );
      }

      setSelectedMaterial(null);
      setQuantity("");
      // Reset date to current datetime-local value
      setDate(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hour = String(now.getHours()).padStart(2, "0");
        const minute = String(now.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hour}:${minute}`;
      });
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Error inesperado. Inténtalo de nuevo.");
    } finally {
      setIsPending(false);
    }
  };

  const isLowStock = selectedMaterial
    ? selectedMaterial.currentStock <= selectedMaterial.minStock
    : false;

  const canSubmit = selectedMaterial && quantity && parseFloat(quantity) > 0;

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Material Selection with Custom Search */}
      <div className="space-y-2 relative" ref={containerRef}>
        <Label>Material</Label>

        {/* Search Input */}
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder="Buscar material..."
            value={selectedMaterial ? selectedMaterial.name : materialSearch}
            onChange={(e) => {
              setMaterialSearch(e.target.value);
              setSelectedMaterial(null);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="h-12 pr-10"
            autoComplete="off"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {selectedMaterial && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMaterial(null);
                  setMaterialSearch("");
                  inputRef.current?.focus();
                }}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
          </div>
        </div>

        {/* Dropdown Results */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
            {filteredMaterials.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                No se encontraron materiales
              </div>
            ) : (
              filteredMaterials.map((material) => (
                <button
                  key={material.id}
                  type="button"
                  onClick={() => {
                    setSelectedMaterial(material);
                    setMaterialSearch(material.name);
                    setIsOpen(false);
                  }}
                  className="w-full p-3 text-left hover:bg-muted flex items-center justify-between transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-medium">{material.name}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {material.category && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                          {material.category.name}
                        </Badge>
                      )}
                      {material.location && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                          {material.location.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {material.currentStock} {material.unit}
                  </span>
                </button>
              )))}
          </div>
        )}

        {/* Stock Info */}
        {selectedMaterial && (
          <div className={cn(
            "flex items-center gap-2 p-3 rounded-lg text-sm",
            isLowStock ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400" : "bg-muted"
          )}>
            <Package className="h-4 w-4" />
            <span>
              <strong>Stock disponible:</strong> {selectedMaterial.currentStock} {selectedMaterial.unit}
              {isLowStock && (
                <span className="ml-2 font-medium">(Por debajo del mínimo: {selectedMaterial.minStock})</span>
              )}
            </span>
          </div>
        )}

        {/* Movement Type */}
        <div className="space-y-2">
          <Label>Tipo de Movimiento</Label>
          <RadioGroup
            value={type}
            onValueChange={(value) => setType(value as "IN" | "OUT")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="IN" id="in" />
              <Label htmlFor="in" className="flex items-center gap-1 cursor-pointer font-medium">
                <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                Entrada (+)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="OUT" id="out" />
              <Label htmlFor="out" className="flex items-center gap-1 cursor-pointer font-medium">
                <Minus className="h-4 w-4 text-red-600 dark:text-red-400" />
                Salida (-)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Quantity with Quick Buttons */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Cantidad</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            step="any"
            min="0"
            placeholder="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="h-12 text-lg"
          />

          {/* Quick Amount Buttons */}
          <div className="flex gap-2">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const current = parseFloat(quantity) || 0;
                  setQuantity(String(current + amount));
                }}
                className="flex-1"
              >
                +{amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Date and Time */}
        <div className="space-y-2">
          <Label htmlFor="date">Fecha y Hora</Label>
          <Input
            id="date"
            name="date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notas (opcional)</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Ej: Piso 2, Torre A - Proyecto X"
            rows={2}
            className="resize-none"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!canSubmit || isPending}
          className={cn(
            "w-full h-12 text-lg font-medium",
            type === "IN"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          )}
        >
          {isPending ? "Registrando..." : type === "IN" ? "Registrar Entrada" : "Registrar Salida"}
        </Button>
      </div>
    </form>
  );
}