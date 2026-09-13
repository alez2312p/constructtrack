import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const materialSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  unit: z.string().min(1, "La unidad es requerida"),
  minStock: z.coerce
    .number()
    .nonnegative("El stock mínimo debe ser un número positivo"),
  initialStock: z.coerce
    .number()
    .nonnegative("El stock inicial debe ser un número positivo")
    .optional(),
  unitCost: z.coerce
    .number()
    .nonnegative("El costo unitario debe ser positivo")
    .optional(),
  sku: z.string().optional().nullable(),
  categoryId: z.string().nullable().optional(),
  locationId: z.string().nullable().optional(),
});

export const movementSchema = z.object({
  materialId: z.string().min(1, "El material es requerido"),
  type: z.enum(["IN", "OUT"]),
  quantity: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Fecha y hora inválida"),
  notes: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  unitPrice: z.coerce.number().nonnegative().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  signature: z.string().optional().nullable(),
});

export const updateMaterialSchema = materialSchema.partial().extend({
  id: z.string().min(1, "El ID es requerido"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

export const locationSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional().nullable(),
});

export const updateLocationSchema = locationSchema.partial().extend({
  id: z.string().min(1, "El ID es requerido"),
});

export const projectSchema = z.object({
  name: z.string().min(1, "El nombre de la obra es requerido"),
  code: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "COMPLETED", "PAUSED"]).default("ACTIVE"),
  budget: z.coerce.number().nonnegative("El presupuesto debe ser positivo").optional().nullable(),
});

export const supplierSchema = z.object({
  name: z.string().min(1, "El nombre del proveedor es requerido"),
  contactName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Correo inválido").optional().nullable().or(z.literal("")),
  taxId: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export const userSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  role: z.enum(["ADMIN", "OPERATOR", "AUDITOR"]).default("OPERATOR"),
  active: z.boolean().default(true),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
export type LocationFormData = z.infer<typeof locationSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type MaterialFormData = z.infer<typeof materialSchema>;
export type MovementFormData = z.infer<typeof movementSchema>;
export type UpdateMaterialFormData = z.infer<typeof updateMaterialSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type SupplierFormData = z.infer<typeof supplierSchema>;
export type UserFormData = z.infer<typeof userSchema>;
