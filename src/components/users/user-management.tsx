"use client";

import { useState } from "react";
import { createUser, updateUserRole, toggleUserStatus, UserItem } from "@/actions/users";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Shield, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface UserManagementProps {
  initialUsers: UserItem[];
  currentUserId: string;
  currentUserRole: string;
}

export function UserManagement({
  initialUsers,
  currentUserId,
  currentUserRole,
}: UserManagementProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUserRole === "ADMIN";

  const handleCreate = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const res = await createUser(formData);
      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Usuario creado exitosamente");
      setOpen(false);
      // Reload page or refresh
      window.location.reload();
    } catch {
      toast.error("Error al registrar el usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "OPERATOR" | "AUDITOR") => {
    const res = await updateUserRole(userId, newRole);
    if (res?.error) {
      toast.error(res.error);
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast.success("Rol actualizado con éxito");
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const res = await toggleUserStatus(userId, newStatus);
    if (res?.error) {
      toast.error(res.error);
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, active: newStatus } : u))
    );
    toast.success(newStatus ? "Usuario activado" : "Usuario desactivado");
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-300">Administrador</Badge>;
      case "AUDITOR":
        return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300">Auditor</Badge>;
      case "OPERATOR":
      default:
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300">Operador</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
            <p className="text-sm text-muted-foreground">
              Control de accesos y roles (RBAC: Admin, Operador, Auditor)
            </p>
          </div>
        </div>

        {isAdmin && (
          <Button onClick={() => setOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id} className={!user.active ? "opacity-60 bg-muted/20" : ""}>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                {getRoleBadge(user.role)}
              </div>

              <div className="flex items-center justify-between pt-2 border-t text-xs">
                <div className="flex items-center gap-1.5">
                  {user.active ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Activo
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600 font-medium">
                      <XCircle className="h-3.5 w-3.5" /> Inactivo
                    </span>
                  )}
                  {user.id === currentUserId && (
                    <span className="text-muted-foreground font-semibold">(Tú)</span>
                  )}
                </div>

                {isAdmin && user.id !== currentUserId && (
                  <div className="flex items-center gap-2">
                    <Select
                      defaultValue={user.role}
                      onValueChange={(newRole) => {
                        if (newRole) handleRoleChange(user.id, newRole as "ADMIN" | "OPERATOR" | "AUDITOR");
                      }}
                    >
                      <SelectTrigger className="h-7 text-xs w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                        <SelectItem value="OPERATOR">OPERATOR</SelectItem>
                        <SelectItem value="AUDITOR">AUDITOR</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      variant={user.active ? "outline" : "secondary"}
                      className="h-7 px-2 text-xs"
                      onClick={() => handleToggleStatus(user.id, user.active)}
                    >
                      {user.active ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog Nuevo Usuario */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Crear Nuevo Usuario
            </DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input id="name" name="name" placeholder="Ej: Carlos Mendoza" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input id="email" name="email" type="email" placeholder="carlos@constructtrack.com" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña Inicial *</Label>
              <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol en el Sistema</Label>
              <Select name="role" defaultValue="OPERATOR">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN - Control total y gestión de usuarios</SelectItem>
                  <SelectItem value="OPERATOR">OPERATOR - Registro de inventario y movimientos</SelectItem>
                  <SelectItem value="AUDITOR">AUDITOR - Solo lectura y revisión de auditoría</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Crear Usuario"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
