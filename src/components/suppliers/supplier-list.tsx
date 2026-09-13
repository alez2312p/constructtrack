"use client";

import { useState } from "react";
import { createSupplier, updateSupplier, deleteSupplier } from "@/actions/suppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Truck, Phone, Mail, FileText, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Supplier {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  taxId: string | null;
  address: string | null;
  _count?: {
    movements: number;
  };
}

interface SupplierListProps {
  suppliers: Supplier[];
}

export function SupplierList({ suppliers }: SupplierListProps) {
  const [open, setOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);

  const handleCreate = async (formData: FormData) => {
    const result = await createSupplier(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Proveedor registrado con éxito");
      setOpen(false);
    }
  };

  const handleUpdate = async (formData: FormData) => {
    if (!editSupplier) return;
    const result = await updateSupplier(editSupplier.id, formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Proveedor actualizado con éxito");
      setEditSupplier(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este proveedor?")) return;

    const result = await deleteSupplier(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Proveedor eliminado");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Proveedores</h1>
          <p className="text-sm text-muted-foreground">Directorio de proveedores y trazabilidad de compras de materiales</p>
        </div>

        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Truck className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-base font-medium">No hay proveedores registrados</p>
              <p className="text-sm">Registra proveedores para vincular las entradas de inventario a sus fuentes.</p>
            </CardContent>
          </Card>
        ) : (
          suppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-semibold text-base">{supplier.name}</span>
                    {supplier.taxId && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-mono">
                        <FileText className="h-3 w-3" />
                        RUT / NIF: {supplier.taxId}
                      </p>
                    )}
                  </div>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                    {supplier._count?.movements ?? 0} entregas
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                  {supplier.contactName && (
                    <p className="font-medium text-foreground">
                      Contacto: {supplier.contactName}
                    </p>
                  )}
                  {supplier.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3" />
                      {supplier.phone}
                    </p>
                  )}
                  {supplier.email && (
                    <p className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3" />
                      {supplier.email}
                    </p>
                  )}
                  {supplier.address && (
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      {supplier.address}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditSupplier(supplier)}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(supplier.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog Nuevo Proveedor */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Proveedor</DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Razón Social o Nombre *</Label>
              <Input id="name" name="name" placeholder="Ej: Aceros Arequipa S.A." required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="taxId">RUT / NIF / CIF</Label>
                <Input id="taxId" name="taxId" placeholder="Ej: 20100055231" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">Persona de Contacto</Label>
                <Input id="contactName" name="contactName" placeholder="Ej: Juan Pérez" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" placeholder="Ej: +51 987 654 321" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" name="email" type="email" placeholder="ventas@proveedor.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" name="address" placeholder="Ej: Zona Industrial Lote 14" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Proveedor</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Proveedor */}
      <Dialog open={!!editSupplier} onOpenChange={(v) => !v && setEditSupplier(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Proveedor</DialogTitle>
          </DialogHeader>
          {editSupplier && (
            <form action={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Razón Social o Nombre *</Label>
                <Input id="edit-name" name="name" defaultValue={editSupplier.name} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-taxId">RUT / NIF / CIF</Label>
                  <Input id="edit-taxId" name="taxId" defaultValue={editSupplier.taxId || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contactName">Persona de Contacto</Label>
                  <Input id="edit-contactName" name="contactName" defaultValue={editSupplier.contactName || ""} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Teléfono</Label>
                  <Input id="edit-phone" name="phone" defaultValue={editSupplier.phone || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Correo Electrónico</Label>
                  <Input id="edit-email" name="email" type="email" defaultValue={editSupplier.email || ""} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-address">Dirección</Label>
                <Input id="edit-address" name="address" defaultValue={editSupplier.address || ""} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditSupplier(null)}>
                  Cancelar
                </Button>
                <Button type="submit">Actualizar Proveedor</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
