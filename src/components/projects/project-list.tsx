"use client";

import { useState } from "react";
import { createProject, updateProject, deleteProject } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Building2, MapPin, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  address: string | null;
  status: string;
  budget: number | null;
  _count?: {
    movements: number;
  };
}

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  const [open, setOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const handleCreate = async (formData: FormData) => {
    const result = await createProject(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Obra registrada con éxito");
      setOpen(false);
    }
  };

  const handleUpdate = async (formData: FormData) => {
    if (!editProject) return;
    const result = await updateProject(editProject.id, formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Obra actualizada con éxito");
      setEditProject(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta obra?")) return;

    const result = await deleteProject(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Obra eliminada");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">En Ejecución</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">Finalizada</Badge>;
      case "PAUSED":
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">Pausada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Obras y Proyectos</h1>
          <p className="text-sm text-muted-foreground">Control de destinos de material y consumo por frente de obra</p>
        </div>

        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Obra
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-base font-medium">No hay obras registradas</p>
              <p className="text-sm">Registra una obra para asignarle salidas de materiales.</p>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => (
            <Card key={project.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">{project.name}</span>
                      {project.code && (
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                          {project.code}
                        </span>
                      )}
                    </div>
                    {project.address && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{project.address}</span>
                      </div>
                    )}
                  </div>
                  {getStatusBadge(project.status)}
                </div>

                {project.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                    <span>
                      Presupuesto: {project.budget ? `$${project.budget.toLocaleString("es-ES")}` : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span>{project._count?.movements ?? 0} despachos</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditProject(project)}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog Nueva Obra */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Obra o Proyecto</DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Obra *</Label>
              <Input id="name" name="name" placeholder="Ej: Torre Los Andes - Etapa 2" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="code">Código / Identificador</Label>
                <Input id="code" name="code" placeholder="Ej: OBR-2026-01" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select name="status" defaultValue="ACTIVE">
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">En Ejecución</SelectItem>
                    <SelectItem value="PAUSED">Pausada</SelectItem>
                    <SelectItem value="COMPLETED">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección o Ubicación</Label>
              <Input id="address" name="address" placeholder="Ej: Av. Libertador #450" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Presupuesto Estimado ($)</Label>
              <Input id="budget" name="budget" type="number" step="0.01" placeholder="Ej: 50000" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción / Notas</Label>
              <Textarea id="description" name="description" placeholder="Detalles de la obra..." rows={2} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Obra</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Obra */}
      <Dialog open={!!editProject} onOpenChange={(v) => !v && setEditProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Obra</DialogTitle>
          </DialogHeader>
          {editProject && (
            <form action={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre de la Obra *</Label>
                <Input id="edit-name" name="name" defaultValue={editProject.name} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Código / Identificador</Label>
                  <Input id="edit-code" name="code" defaultValue={editProject.code || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select name="status" defaultValue={editProject.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">En Ejecución</SelectItem>
                      <SelectItem value="PAUSED">Pausada</SelectItem>
                      <SelectItem value="COMPLETED">Finalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-address">Dirección o Ubicación</Label>
                <Input id="edit-address" name="address" defaultValue={editProject.address || ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-budget">Presupuesto Estimado ($)</Label>
                <Input
                  id="edit-budget"
                  name="budget"
                  type="number"
                  step="0.01"
                  defaultValue={editProject.budget ?? ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción / Notas</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editProject.description || ""}
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditProject(null)}>
                  Cancelar
                </Button>
                <Button type="submit">Actualizar Obra</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
