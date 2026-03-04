import { z } from 'zod';

const emptyToUndefined = (value: unknown) => {
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
};

export const bookingSchema = z.object({
  serviceId: z.string().min(1, 'El servicio es requerido'),
  employeeId: z.string().optional(),
  startTime: z.string().or(z.date()),
  // En el dashboard (dueño de negocio) permitimos crear reservas sin datos del cliente.
  clientName: z.preprocess(emptyToUndefined, z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional()),
  clientEmail: z.preprocess(emptyToUndefined, z.string().email('Email inválido').optional()),
  clientPhone: z.preprocess(emptyToUndefined, z.string().min(10, 'Teléfono inválido').optional()),
  notes: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
});

export const rescheduleBookingSchema = z.object({
  startTime: z.string().or(z.date()),
  employeeId: z.string().optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;

