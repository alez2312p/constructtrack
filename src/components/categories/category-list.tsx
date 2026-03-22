"use client";

import { useState } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const [open, setOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const handleCreate = async (formData: FormData) => {
    const result = await createCategory(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Categoría creada");
      setOpen(false);
    }
  };

  const handleUpdate = async (formData: FormData) => {
    if (!editCategory) return;
    const result = await updateCategory(editCategory.id, formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Categoría actualizada");
      setEditCategory(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;

    const result = await deleteCategory(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Categoría eliminada");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categorías</h1>

        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Categoría</DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" placeholder="Ej: Cementos" required />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Crear</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editCategory} onOpenChange={(v) => !v && setEditCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
          </DialogHeader>
          {editCategory && (
            <form action={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input id="edit-name" name="name" defaultValue={editCategory.name} required />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Actualizar</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {categories.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay categorías. Crea una para comenzar.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg p-4 flex items-center justify-between">
              <span className="font-medium">{category.name}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditCategory(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(category.id)}
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
