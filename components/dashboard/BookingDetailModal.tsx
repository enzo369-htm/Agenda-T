'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatDate, formatTime } from '@/lib/utils';
import toast from 'react-hot-toast';

interface BookingDetailModalProps {
  booking: any;
  businessSlug: string;
  onClose: () => void;
  onStatusChange?: () => void;
}

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'primary' | 'secondary' }> = {
  PENDING: { label: 'Pendiente', variant: 'warning' },
  CONFIRMED: { label: 'Confirmada', variant: 'primary' },
  COMPLETED: { label: 'Completada', variant: 'success' },
  CANCELLED: { label: 'Cancelada', variant: 'secondary' },
  NO_SHOW: { label: 'No asistió', variant: 'secondary' },
};

export function BookingDetailModal({ booking, businessSlug, onClose, onStatusChange }: BookingDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const startDate = new Date(booking.startTime);
  const endDate = booking.endTime
    ? new Date(booking.endTime)
    : new Date(startDate.getTime() + (booking.service?.durationMinutes || 30) * 60000);

  const statusInfo = STATUS_MAP[booking.status] || { label: booking.status, variant: 'secondary' as const };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Error al actualizar');
      }
      toast.success(`Estado actualizado a ${STATUS_MAP[newStatus]?.label || newStatus}`);
      onStatusChange?.();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar estado');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-lg rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Detalle de reserva</h2>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 px-6 py-5">
          {/* Cliente */}
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              {(booking.clientName || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900">{booking.clientName || 'Sin nombre'}</h3>
              {booking.clientEmail && (
                <a href={`mailto:${booking.clientEmail}`} className="block truncate text-sm text-primary-600 hover:underline">
                  {booking.clientEmail}
                </a>
              )}
              {booking.clientPhone && (
                <a href={`tel:${booking.clientPhone}`} className="block text-sm text-gray-600 hover:underline">
                  📞 {booking.clientPhone}
                </a>
              )}
            </div>
          </div>

          {/* Servicio */}
          {booking.service && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{booking.service.name}</p>
                  <p className="text-sm text-gray-500">⏱️ {booking.service.durationMinutes} min</p>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(booking.totalPrice ?? booking.service.price)}
                </span>
              </div>
            </div>
          )}

          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-gray-500">Fecha</p>
              <p className="font-medium text-gray-900">
                {formatDate(startDate, 'long')}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-gray-500">Horario</p>
              <p className="font-medium text-gray-900">
                {formatTime(startDate)} - {formatTime(endDate)}
              </p>
            </div>
          </div>

          {/* Profesional */}
          {booking.employee && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-gray-500">Profesional</p>
              <div className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: booking.employee.color || '#9333ea' }}
                >
                  {(booking.employee.name || '?').charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-900">{booking.employee.name}</span>
              </div>
            </div>
          )}

          {/* Notas */}
          {booking.notes && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-gray-500">Notas</p>
              <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                {booking.notes}
              </p>
            </div>
          )}

          {/* Info de creación */}
          <div className="border-t border-gray-100 pt-3 text-xs text-gray-400">
            Creada el {formatDate(booking.createdAt, 'long')} a las {formatTime(booking.createdAt)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-gray-50 px-6 py-4">
          <div className="flex gap-2">
            {booking.status !== 'CONFIRMED' && (
              <button
                onClick={() => handleStatusChange('CONFIRMED')}
                disabled={isUpdating}
                className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
              >
                Confirmar
              </button>
            )}
            {booking.status !== 'COMPLETED' && (
              <button
                onClick={() => handleStatusChange('COMPLETED')}
                disabled={isUpdating}
                className="rounded-lg border border-green-300 bg-white px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
              >
                Completada
              </button>
            )}
            {booking.status !== 'CANCELLED' && (
              <button
                onClick={() => handleStatusChange('CANCELLED')}
                disabled={isUpdating}
                className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
            {booking.status !== 'NO_SHOW' && (
              <button
                onClick={() => handleStatusChange('NO_SHOW')}
                disabled={isUpdating}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                No asistió
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
