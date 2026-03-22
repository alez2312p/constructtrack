"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createMaterial, updateMaterial } from "@/actions/materials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MaterialFormProps } from "../../lib/type";


export function MaterialForm({ material, userId, trigger, categories = [], locations = [] }: MaterialFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(formRef.current!);

    try {
      let result;

      if (material) {
        result = await updateMaterial(material.id, formData);
      } else {
        result = await createMaterial(formData, userId);
      }

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.success) {
        setOpen(false);
        router.refresh();
      }
    } catch (err) {
      setError("Error inesperado. Intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className={cn("cursor-pointer", !material && "inline-block", material && "flex-1")}
      >
        {trigger || (
          <Button type="button">
            + Nuevo Material
          </Button>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {material ? "Editar Material" : "Nuevo Material"}
            </DialogTitle>
          </DialogHeader>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ej: Cemento Portland"
                defaultValue={material?.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unidad</Label>
              <Input
                id="unit"
                name="unit"
                placeholder="Ej: kg, m3, unidades"
                defaultValue={material?.unit}
                required
              />
            </div>

            {categories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoría</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={material?.categoryId || ""}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

            {locations.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="locationId">Ubicación</Label>
                <select
                  id="locationId"
                  name="locationId"
                  defaultValue={material?.locationId || ""}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Sin ubicación</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="minStock">Stock Mínimo</Label>
              <Input
                id="minStock"
                name="minStock"
                type="number"
                step="any"
                min="0"
                defaultValue={material?.minStock ?? 0}
              />
            </div>
            {!material && (
              <div className="space-y-2">
                <Label htmlFor="initialStock">Stock Inicial (opcional)</Label>
                <Input
                  id="initialStock"
                  name="initialStock"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0"
                  disabled={!userId}
                />
                {!userId && (
                  <p className="text-xs text-amber-600">
                    Se requiere un usuario para registrar stock inicial.
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Si ingresa un valor mayor a 0, se creará un movimiento de entrada automáticamente
                </p>
              </div>
            )}
            {material && (
              <div className="space-y-2">
                <Label>Stock Actual</Label>
                <div className="p-2 bg-muted rounded-md">
                  {material.currentStock} {material.unit}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : material ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
