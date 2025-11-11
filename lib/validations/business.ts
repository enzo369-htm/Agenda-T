import { z } from 'zod';

export const businessSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z
    .string()
    .min(2, 'El slug debe tener al menos 2 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  description: z.string().optional(),
  category: z.string().default('beauty'),
  address: z.string().min(5, 'La dirección es requerida'),
  city: z.string().min(2, 'La ciudad es requerida'),
  state: z.string().min(2, 'La provincia/estado es requerida'),
  country: z.string().default('Argentina'),
  postalCode: z.string().optional(),
  phone: z.string().min(10, 'Teléfono inválido'),
  email: z.string().email('Email inválido').optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
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

export type BusinessInput = z.infer<typeof businessSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;

