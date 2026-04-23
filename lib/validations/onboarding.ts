import { z } from 'zod';

const emptyToUndefined = (val: unknown) =>
  (val == null || (typeof val === 'string' && val.trim() === '')) ? undefined : val;

export const onboardingBusinessSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.preprocess(emptyToUndefined, z.string().optional()),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  city: z.string().min(2, 'La ciudad es requerida'),
  coverImage: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine(
        (val) => !val || val.startsWith('/') || val.startsWith('http'),
        'Ruta o URL inválida'
      )
      .optional()
  ),
  logo: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine(
        (val) => !val || val.startsWith('/') || val.startsWith('http'),
        'Ruta o URL inválida'
      )
      .optional()
  ),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido (ej: #0ea5e9)')
    .default('#0ea5e9'),
});

export const onboardingServiceSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  durationMinutes: z.number().min(5, 'Mínimo 5 min').max(480, 'Máximo 8 horas'),
  price: z.number().min(0, 'El precio debe ser mayor a 0'),
});

export const onboardingServicesSchema = z.object({
  services: z.array(onboardingServiceSchema).min(1, 'Agregá al menos un servicio'),
});

export const onboardingEmployeeSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido')
    .default('#9333ea'),
});

export const onboardingEmployeesSchema = z.object({
  employees: z.array(onboardingEmployeeSchema),
});

const dayScheduleSchema = z.object({
  open: z.boolean(),
  start: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:mm').default('09:00'),
  end: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:mm').default('18:00'),
});

export const onboardingHoursSchema = z.object({
  monday: dayScheduleSchema,
  tuesday: dayScheduleSchema,
  wednesday: dayScheduleSchema,
  thursday: dayScheduleSchema,
  friday: dayScheduleSchema,
  saturday: dayScheduleSchema,
  sunday: dayScheduleSchema,
});

export type OnboardingBusinessInput = z.infer<typeof onboardingBusinessSchema>;
export type OnboardingServiceInput = z.infer<typeof onboardingServiceSchema>;
export type OnboardingEmployeeInput = z.infer<typeof onboardingEmployeeSchema>;
export type OnboardingHoursInput = z.infer<typeof onboardingHoursSchema>;
