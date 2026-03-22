import { z } from "zod";

export const locationSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional().nullable(),
});

export const updateLocationSchema = locationSchema.partial().extend({
  id: z.string().min(1, "El ID es requerido"),
});

export type LocationFormData = z.infer<typeof locationSchema>;
export type UpdateLocationFormData = z.infer<typeof updateLocationSchema>;