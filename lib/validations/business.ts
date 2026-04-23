import { z } from 'zod';

const emptyToUndefined = (val: unknown) =>
  (val == null || (typeof val === 'string' && val.trim() === '')) ? undefined : val;

export const businessSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z
    .string()
    .min(2, 'El slug debe tener al menos 2 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  description: z.preprocess(emptyToUndefined, z.string().optional()),
  category: z.string().default('beauty'),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  city: z.string().min(2, 'La ciudad es requerida'),
  state: z.string().min(2, 'La provincia/estado es requerida'),
  country: z.string().default('Argentina'),
  postalCode: z.preprocess(emptyToUndefined, z.string().optional()),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  email: z.preprocess(emptyToUndefined, z.string().email('Email inválido').optional()),
  website: z.preprocess(emptyToUndefined, z.string().url('URL inválida').optional()),
  timezone: z.string().default('America/Argentina/Buenos_Aires'),
  openingHours: z.record(z.array(z.object({
    start: z.string(),
    end: z.string(),
  }))).optional(),
  settings: z.record(z.any()).optional(),
});

export const serviceSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  durationMinutes: z.number().min(5, 'La duración mínima es 5 minutos').max(480, 'La duración máxima es 8 horas'),
  price: z.number().min(0, 'El precio debe ser mayor a 0'),
  currency: z.string().default('ARS'),
  color: z.string().optional(),
  requiresEmployee: z.boolean().default(true),
});

export const employeeSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().min(10, 'Teléfono inválido').optional(),
  color: z.string().optional(),
  workingHours: z.record(z.array(z.object({
    start: z.string(),
    end: z.string(),
  }))).optional(),
  serviceIds: z.array(z.string()).optional(),
});

export const availabilitySchema = z.object({
  date: z.string().or(z.date()),
  startTime: z.string(),
  endTime: z.string(),
  employeeId: z.string().optional(),
  isBlocked: z.boolean().default(false),
  reason: z.string().optional(),
});

export const businessUpdateSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  description: z.preprocess(emptyToUndefined, z.string().optional()),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos').optional(),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres').optional(),
  city: z.string().min(2, 'La ciudad es requerida').optional(),
  coverImage: z.preprocess(
    emptyToUndefined,
    z.string().refine((v) => !v || v.startsWith('/') || v.startsWith('http'), 'Ruta inválida').optional()
  ),
  logo: z.preprocess(
    emptyToUndefined,
    z.string().refine((v) => !v || v.startsWith('/') || v.startsWith('http'), 'Ruta inválida').optional()
  ),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido (ej: #0ea5e9)')
    .optional(),
  openingHours: z.record(z.any()).optional(),
});

export type BusinessInput = z.infer<typeof businessSchema>;
export type BusinessUpdateInput = z.infer<typeof businessUpdateSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;

