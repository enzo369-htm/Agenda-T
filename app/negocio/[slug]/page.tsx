'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { formatPrice, formatDate, formatTime, generateTimeSlots } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function BusinessPage() {
  const params = useParams();
  const router = useRouter();
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

  useEffect(() => {
    fetchBusiness();
  }, [slug]);

  const fetchBusiness = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/businesses/${slug}`);
      const data = await response.json();
      setBusiness(data);
    } catch (error) {
      console.error('Error fetching business:', error);
      toast.error('Error al cargar negocio');
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

      toast.success('¡Reserva confirmada! Te enviamos un email con los detalles.');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear reserva');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="h-96 animate-pulse rounded-lg bg-white" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <Card>
              <div className="py-12 text-center">
                <p className="text-gray-500">Negocio no encontrado</p>
              </div>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const timeSlots = selectedDate && business.openingHours
    ? generateTimeSlots('09:00', '19:00', selectedService?.durationMinutes || 30)
    : [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Header del negocio */}
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold text-gray-900">{business.name}</h1>
            <p className="mb-4 text-lg text-gray-600">{business.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>📍 {business.address}, {business.city}</span>
              <span>📞 {business.phone}</span>
              {business.averageRating > 0 && (
                <span>⭐ {business.averageRating} ({business._count.reviews} reseñas)</span>
              )}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Columna izquierda - Servicios */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Selecciona un servicio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {business.services.map((service: any) => (
                      <div
                        key={service.id}
                        className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                          selectedService?.id === service.id
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                        onClick={() => setSelectedService(service)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{service.name}</h3>
                            <p className="text-sm text-gray-600">{service.description}</p>
                            <p className="mt-1 text-sm text-gray-500">
                              ⏱️ {service.durationMinutes} min
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {formatPrice(service.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedService && (
                <>
                  {/* Selección de empleado */}
                  {business.employees.length > 0 && (
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle>Selecciona un profesional (opcional)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div
                            className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                              !selectedEmployee
                                ? 'border-primary-600 bg-primary-50'
                                : 'border-gray-200 hover:border-primary-300'
                            }`}
                            onClick={() => setSelectedEmployee(null)}
                          >
                            <p className="font-medium">Sin preferencia</p>
                            <p className="text-sm text-gray-600">Cualquier disponible</p>
                          </div>
                          {business.employees.map((employee: any) => (
                            <div
                              key={employee.id}
                              className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                                selectedEmployee?.id === employee.id
                                  ? 'border-primary-600 bg-primary-50'
                                  : 'border-gray-200 hover:border-primary-300'
                              }`}
                              onClick={() => setSelectedEmployee(employee)}
                            >
                              <p className="font-medium">{employee.name}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Selección de fecha y hora */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Selecciona fecha y hora</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <Input
                          label="Fecha"
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      {selectedDate && (
                        <div>
                          <label className="label">Horarios disponibles</label>
                          <div className="grid grid-cols-4 gap-2">
                            {timeSlots.map((time) => (
                              <button
                                key={time}
                                className={`rounded-lg border-2 px-4 py-2 text-sm transition-colors ${
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
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Columna derecha - Resumen y datos */}
            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Resumen de reserva</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedService ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Servicio</p>
                        <p className="font-medium">{selectedService.name}</p>
                      </div>
                      {selectedEmployee && (
                        <div>
                          <p className="text-sm text-gray-600">Profesional</p>
                          <p className="font-medium">{selectedEmployee.name}</p>
                        </div>
                      )}
                      {selectedDate && (
                        <div>
                          <p className="text-sm text-gray-600">Fecha</p>
                          <p className="font-medium">{formatDate(new Date(selectedDate), 'long')}</p>
                        </div>
                      )}
                      {selectedTime && (
                        <div>
                          <p className="text-sm text-gray-600">Hora</p>
                          <p className="font-medium">{selectedTime}</p>
                        </div>
                      )}
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPrice(selectedService.price)}
                        </p>
                      </div>

                      <div className="space-y-3 border-t pt-4">
                        <Input
                          label="Tu nombre"
                          type="text"
                          placeholder="Juan Pérez"
                          value={clientData.name}
                          onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                        />
                        <Input
                          label="Email"
                          type="email"
                          placeholder="tu@email.com"
                          value={clientData.email}
                          onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                        />
                        <Input
                          label="Teléfono"
                          type="tel"
                          placeholder="+54 9 11 1234-5678"
                          value={clientData.phone}
                          onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                        />
                        <div>
                          <label className="label">Notas (opcional)</label>
                          <textarea
                            className="input"
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
                        disabled={!selectedDate || !selectedTime}
                      >
                        Confirmar Reserva
                      </Button>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-gray-500">
                      Selecciona un servicio para continuar
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reseñas */}
          {business.reviews.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Reseñas de clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {business.reviews.map((review: any) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-medium">{review.user.name}</p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

