import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
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
  notes: z.string().optional(),
});

export const updateMaterialSchema = materialSchema.partial().extend({
  id: z.string().min(1, "El ID es requerido"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type MaterialFormData = z.infer<typeof materialSchema>;
export type MovementFormData = z.infer<typeof movementSchema>;
export type UpdateMaterialFormData = z.infer<typeof updateMaterialSchema>;
