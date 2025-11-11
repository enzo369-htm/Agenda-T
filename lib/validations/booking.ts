import { z } from 'zod';

export const bookingSchema = z.object({
  serviceId: z.string().min(1, 'El servicio es requerido'),
  employeeId: z.string().optional(),
  startTime: z.string().or(z.date()),
  clientName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  clientEmail: z.string().email('Email inválido'),
  clientPhone: z.string().min(10, 'Teléfono inválido'),
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

