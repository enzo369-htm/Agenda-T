'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: any;
  selectedDate?: Date;
  selectedTime?: string;
  selectedEmployee?: string;
  onBookingCreated?: () => void;
}

export function NewBookingModal({
  isOpen,
  onClose,
  business,
  selectedDate,
  selectedTime,
  selectedEmployee,
  onBookingCreated,
}: NewBookingModalProps) {
  const [status, setStatus] = useState('CONFIRMED');
  const [date, setDate] = useState(selectedDate || new Date());
  const [startTime, setStartTime] = useState(selectedTime || '13:00');
  const [endTime, setEndTime] = useState('13:30');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(selectedEmployee || '');
  const [price, setPrice] = useState(0);
  const [sharedNotes, setSharedNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      setDate(selectedDate);
    }
    if (selectedTime) {
      setStartTime(selectedTime);
      const [hours, minutes] = selectedTime.split(':');
      const end = new Date();
      end.setHours(parseInt(hours), parseInt(minutes));
      end.setMinutes(end.getMinutes() + 30);
      setEndTime(`${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`);
    }
    if (selectedEmployee) {
      setSelectedEmployeeId(selectedEmployee);
    }
  }, [selectedDate, selectedTime, selectedEmployee]);

  useEffect(() => {
    if (selectedService) {
      const service = business?.services?.find((s: any) => s.id === selectedService);
      if (service) {
        setPrice(service.price);
        const [hours, minutes] = startTime.split(':');
        const end = new Date();
        end.setHours(parseInt(hours), parseInt(minutes));
        end.setMinutes(end.getMinutes() + service.durationMinutes);
        setEndTime(`${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`);
      }
    }
  }, [selectedService, startTime, business]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService) {
      toast.error('Selecciona un servicio');
      return;
    }

    try {
      const startDateTime = new Date(date);
      const [startHours, startMinutes] = startTime.split(':');
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

      const endDateTime = new Date(date);
      const [endHours, endMinutes] = endTime.split(':');
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          serviceId: selectedService,
          employeeId: selectedEmployeeId || null,
          clientName: clientName || undefined,
          clientEmail: clientEmail || undefined,
          clientPhone: clientPhone || undefined,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          totalPrice: price,
          notes: sharedNotes || internalNotes ? `${sharedNotes}\n${internalNotes}`.trim() : null,
          status,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Error al crear reserva');
      }

      toast.success('Reserva creada exitosamente');
      onBookingCreated?.();
      onClose();
      // Reset form
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setSelectedService('');
      setPrice(0);
      setSharedNotes('');
      setInternalNotes('');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear reserva');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold text-gray-900">Nueva reserva</h2>
          <div className="flex items-center gap-4">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="PENDING">Pendiente</option>
              <option value="CONFIRMED">Reservado</option>
              <option value="COMPLETED">Completado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Date */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={date.toISOString().split('T')[0]}
                  onChange={(e) => setDate(new Date(e.target.value))}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
                <span className="text-sm text-gray-600">
                  {date.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Hora</label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
                <span className="text-gray-500">-</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
                <button
                  type="button"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Repetir
                </button>
              </div>
            </div>

            {/* Client */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Cliente</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Busca por nombre, apellido, rut, email"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button
                  type="button"
                  className="rounded-lg border border-primary-600 bg-white px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
                >
                  + Nuevo cliente
                </button>
              </div>
              {clientName && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <input
                    type="email"
                    placeholder="Email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              )}
            </div>

            {/* Professional */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Profesional</label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Sin asignar</option>
                  {business?.employees?.filter((e: any) => e.isActive).map((employee: any) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Bloquear selección"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Service */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Servicio</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              >
                <option value="">Selecciona un servicio</option>
                {business?.services?.filter((s: any) => s.isActive).map((service: any) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.durationMinutes} min) - {service.price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Info Toggle */}
            <button
              type="button"
              onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
              className="flex w-full items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <span>Información adicional</span>
              <svg
                className={`h-5 w-5 transition-transform ${showAdditionalInfo ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAdditionalInfo && (
              <>
                {/* Price */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Precio</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    min={0}
                    step={0.01}
                    required
                  />
                </div>

                {/* Shared Notes */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Notas compartidas con el cliente
                  </label>
                  <textarea
                    value={sharedNotes}
                    onChange={(e) => setSharedNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Estas notas serán visibles para el cliente"
                  />
                </div>

                {/* Internal Notes */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nota interna</label>
                  <textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Solo visible para ti"
                  />
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancelar
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Agregar otra reserva
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Guardar reserva
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

