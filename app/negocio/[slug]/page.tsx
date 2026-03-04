'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { formatPrice, formatDate, generateTimeSlots } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function BusinessPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchBusiness();
  }, [slug]);

  const fetchBusiness = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/businesses/${slug}`);
      const data = await response.json();
      if (!response.ok) {
        setBusiness(null);
        return;
      }
      setBusiness(data);
    } catch (error) {
      console.error('Error fetching business:', error);
      toast.error('Error al cargar negocio');
      setBusiness(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (!clientData.name || !clientData.email || !clientData.phone) {
      toast.error('Por favor completa tus datos de contacto');
      return;
    }

    setIsSubmitting(true);

    try {
      const startTime = new Date(`${selectedDate}T${selectedTime}`);
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          employeeId: selectedEmployee?.id,
          startTime: startTime.toISOString(),
          clientName: clientData.name,
          clientEmail: clientData.email,
          clientPhone: clientData.phone,
          notes: clientData.notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear reserva');
      }

      setShowSuccess(true);
      toast.success('¡Reserva confirmada! Te enviamos un email con los detalles.');
      
      // Reset form
      setTimeout(() => {
        setSelectedService(null);
        setSelectedEmployee(null);
        setSelectedDate('');
        setSelectedTime('');
        setClientData({ name: '', email: '', phone: '', notes: '' });
        setShowSuccess(false);
      }, 5000);
    } catch (error: any) {
      toast.error(error.message || 'Error al crear reserva');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
                <p className="text-gray-500">Negocio no encontrado</p>
          </CardContent>
            </Card>
      </div>
    );
  }

  const timeSlots = selectedDate && business.openingHours
    ? generateTimeSlots('09:00', '19:00', selectedService?.durationMinutes || 30)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Negocio - Sin header de plataforma */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{business.name ?? 'Negocio'}</h1>
              {business.description && (
                <p className="text-sm text-gray-600">{business.description}</p>
              )}
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
              {business.phone && <span>📞 {business.phone}</span>}
              {business.address && (
              <span>📍 {business.address}, {business.city}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section con imagen/descripción */}
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Left: Imagen/Info del negocio */}
              <div>
                {business.imageUrl ? (
                  <img
                    src={business.imageUrl}
                    alt={business.name ?? 'Negocio'}
                    className="h-64 w-full rounded-lg object-cover md:h-96"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-secondary-100 md:h-96">
                    <div className="text-center">
                      <div className="mb-4 text-6xl font-bold text-primary-600">
                        {(business.name ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <p className="text-lg font-semibold text-gray-700">{business.name ?? 'Negocio'}</p>
                    </div>
                  </div>
                )}
                
                {/* Información de contacto */}
                <div className="mt-6 space-y-3">
                  {business.address && (
                    <div className="flex items-start gap-3">
                      <span className="text-xl">📍</span>
                          <div>
                        <p className="font-medium text-gray-900">Dirección</p>
                        <p className="text-sm text-gray-600">
                          {business.address}, {business.city}
                            </p>
                          </div>
                    </div>
                  )}
                  {business.phone && (
                    <div className="flex items-start gap-3">
                      <span className="text-xl">📞</span>
                      <div>
                        <p className="font-medium text-gray-900">Teléfono</p>
                        <a
                          href={`tel:${business.phone}`}
                          className="text-sm text-primary-600 hover:underline"
                        >
                          {business.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {business.openingHours && (
                    <div className="flex items-start gap-3">
                      <span className="text-xl">🕐</span>
                      <div>
                        <p className="font-medium text-gray-900">Horario</p>
                        <button className="text-sm text-primary-600 hover:underline">
                          Ver horario
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profesionales */}
                {business.employees && business.employees.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Profesionales</h3>
                    <div className="flex flex-wrap gap-3">
                      {business.employees.map((employee: any) => (
                        <div
                          key={employee.id}
                          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold">
                            {(employee.name ?? '?')
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{employee.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                      </div>

              {/* Right: Mapa (si hay coordenadas) */}
              {business.latitude && business.longitude && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Ubicación</h3>
                  <div className="h-64 rounded-lg border border-gray-200 bg-gray-100 md:h-96">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${business.latitude},${business.longitude}`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Servicios Section */}
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Servicios</h2>
            </div>

            {showSuccess ? (
              <Card className="mb-8 border-green-500 bg-green-50">
                <CardContent className="py-12 text-center">
                  <div className="mb-4 text-6xl">✅</div>
                  <h3 className="mb-2 text-2xl font-bold text-green-900">
                    ¡Reserva confirmada!
                  </h3>
                  <p className="text-green-700">
                    Te enviamos un email con los detalles de tu reserva.
                  </p>
                  <p className="mt-2 text-sm text-green-600">
                    Recibirás un recordatorio antes de tu cita.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {(business.services ?? []).map((service: any) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedService?.id === service.id
                        ? 'border-2 border-primary-600 shadow-md'
                        : ''
                    }`}
                    onClick={() => {
                      setSelectedService(service);
                      setSelectedEmployee(null);
                      setSelectedDate('');
                      setSelectedTime('');
                    }}
                  >
                    <CardContent className="p-6">
                      <h3 className="mb-2 text-xl font-bold text-gray-900">{service.name}</h3>
                      {service.description && (
                        <p className="mb-4 text-sm text-gray-600">{service.description}</p>
                      )}
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          ⏱️ {service.durationMinutes} min
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                      <Button
                        variant={selectedService?.id === service.id ? 'primary' : 'outline'}
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedService(service);
                        }}
                      >
                        {selectedService?.id === service.id ? 'Seleccionado' : 'Agendar servicio'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Formulario de Reserva */}
            {selectedService && !showSuccess && (
              <Card className="mt-8">
                      <CardHeader>
                  <CardTitle>Completa tu reserva</CardTitle>
                      </CardHeader>
                      <CardContent>
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Columna izquierda */}
                    <div className="space-y-6">
                      {/* Selección de profesional */}
                      {business.employees && business.employees.length > 0 && (
                        <div>
                          <label className="mb-3 block text-sm font-medium text-gray-700">
                            Selecciona un profesional (opcional)
                          </label>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <button
                              type="button"
                              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                              !selectedEmployee
                                ? 'border-primary-600 bg-primary-50'
                                : 'border-gray-200 hover:border-primary-300'
                            }`}
                            onClick={() => setSelectedEmployee(null)}
                          >
                              <p className="font-medium text-gray-900">Sin preferencia</p>
                            <p className="text-sm text-gray-600">Cualquier disponible</p>
                            </button>
                          {business.employees.map((employee: any) => (
                              <button
                              key={employee.id}
                                type="button"
                                className={`rounded-lg border-2 p-4 text-left transition-colors ${
                                selectedEmployee?.id === employee.id
                                  ? 'border-primary-600 bg-primary-50'
                                  : 'border-gray-200 hover:border-primary-300'
                              }`}
                              onClick={() => setSelectedEmployee(employee)}
                            >
                                <p className="font-medium text-gray-900">{employee.name}</p>
                              </button>
                            ))}
                            </div>
                        </div>
                  )}

                      {/* Selección de fecha */}
                      <div>
                        <Input
                          label="Fecha"
                          type="date"
                          value={selectedDate}
                          onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setSelectedTime('');
                          }}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>

                      {/* Selección de hora */}
                      {selectedDate && (
                        <div>
                          <label className="mb-3 block text-sm font-medium text-gray-700">
                            Horarios disponibles
                          </label>
                          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                            {timeSlots.map((time) => (
                              <button
                                key={time}
                                type="button"
                                className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${
                                  selectedTime === time
                                    ? 'border-primary-600 bg-primary-600 text-white'
                                    : 'border-gray-200 hover:border-primary-300'
                                }`}
                                onClick={() => setSelectedTime(time)}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
              )}
            </div>

                    {/* Columna derecha - Datos del cliente */}
                    <div className="space-y-4">
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h4 className="mb-3 font-semibold text-gray-900">Resumen</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Servicio:</span>
                            <span className="font-medium">{selectedService.name}</span>
                      </div>
                      {selectedEmployee && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Profesional:</span>
                              <span className="font-medium">{selectedEmployee.name}</span>
                        </div>
                      )}
                      {selectedDate && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Fecha:</span>
                              <span className="font-medium">
                                {formatDate(new Date(selectedDate), 'long')}
                              </span>
                        </div>
                      )}
                      {selectedTime && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Hora:</span>
                              <span className="font-medium">{selectedTime}</span>
                            </div>
                          )}
                          <div className="mt-3 flex justify-between border-t pt-2">
                            <span className="font-semibold text-gray-900">Total:</span>
                            <span className="text-xl font-bold text-gray-900">
                              {formatPrice(selectedService.price)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Input
                          label="Tu nombre *"
                          type="text"
                          placeholder="Juan Pérez"
                          value={clientData.name}
                          onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                          required
                        />
                        <Input
                          label="Email *"
                          type="email"
                          placeholder="tu@email.com"
                          value={clientData.email}
                          onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                          required
                        />
                        <Input
                          label="Teléfono *"
                          type="tel"
                          placeholder="+54 9 11 1234-5678"
                          value={clientData.phone}
                          onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                          required
                        />
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Notas (opcional)
                          </label>
                          <textarea
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                            rows={3}
                            placeholder="Comentarios adicionales..."
                            value={clientData.notes}
                            onChange={(e) => setClientData({ ...clientData, notes: e.target.value })}
                          />
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleBooking}
                        isLoading={isSubmitting}
                        disabled={!selectedDate || !selectedTime || !clientData.name || !clientData.email || !clientData.phone}
                      >
                        Confirmar Reserva
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      {/* Footer mínimo - Solo branding de la plataforma */}
      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Logo variant="icon" size="sm" />
              <span className="text-sm font-medium text-gray-600">Turnos In</span>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <a href="/terminos" className="hover:text-primary-600">
                Términos y condiciones
              </a>
              <a href="/privacidad" className="hover:text-primary-600">
                Política de privacidad
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
