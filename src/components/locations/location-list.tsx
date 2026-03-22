"use client";

import { useState } from "react";
import { createLocation, updateLocation, deleteLocation } from "@/actions/locations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Location {
  id: string;
  name: string;
  description: string | null;
}

interface LocationListProps {
  locations: Location[];
}

export function LocationList({ locations }: LocationListProps) {
  const [open, setOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<Location | null>(null);

  const handleCreate = async (formData: FormData) => {
    const result = await createLocation(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Ubicación creada");
      setOpen(false);
    }
  };

  const handleUpdate = async (formData: FormData) => {
    if (!editLocation) return;
    const result = await updateLocation(editLocation.id, formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Ubicación actualizada");
      setEditLocation(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta ubicación?")) return;

    const result = await deleteLocation(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Ubicación eliminada");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ubicaciones</h1>

        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Ubicación
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Ubicación</DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" placeholder="Ej: Almacén A" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input id="description" name="description" placeholder="Ej: Pasillo 1, Estante 3" />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Crear</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editLocation} onOpenChange={(v) => !v && setEditLocation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ubicación</DialogTitle>
          </DialogHeader>
          {editLocation && <form action={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input id="edit-name" name="name" defaultValue={editLocation?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción (opcional)</Label>
              <Input id="edit-description" name="description" defaultValue={editLocation?.description || ""} />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Actualizar</Button>
            </div>
          </form>}
        </DialogContent>
      </Dialog>

      {locations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay ubicaciones. Crea una para comenzar.
        </div>
      ) : (
        <div className="grid gap-4">
          {locations.map((location) => (
            <div key={location.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <span className="font-medium">{location.name}</span>
                {location.description && (
                  <p className="text-sm text-muted-foreground">{location.description}</p>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditLocation(location)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(location.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
