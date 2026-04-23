'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { formatPrice, formatDate, generateTimeSlots, getInitials } from '@/lib/utils';
import { DatePicker } from '@/components/ui/DatePicker';
import toast from 'react-hot-toast';

const DEFAULT_BRAND = '#0ea5e9';

function getBrandColor(settings: unknown): string {
  if (!settings) return DEFAULT_BRAND;
  let obj = settings;
  if (typeof settings === 'string') {
    try {
      obj = JSON.parse(settings);
    } catch {
      return DEFAULT_BRAND;
    }
  }
  if (!obj || typeof obj !== 'object') return DEFAULT_BRAND;
  const s = obj as { primaryColor?: string };
  const color = s.primaryColor;
  return color && /^#[0-9A-Fa-f]{6}$/.test(color) ? color : DEFAULT_BRAND;
}

function getLogoUrl(business: { logo?: string | null }): string | null {
  return business.logo || null;
}

function getHeroImageUrl(business: { coverImage?: string | null; logo?: string | null }): string | null {
  return business.coverImage || business.logo || null;
}

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
  const reservationFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBusiness();
  }, [slug]);

  useEffect(() => {
    if (selectedService && !showSuccess && reservationFormRef.current) {
      reservationFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedService, showSuccess]);

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
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-transparent" style={{ borderTopColor: DEFAULT_BRAND }} />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Negocio no encontrado</p>
            <Link href="/negocios" className="mt-4 inline-block text-sm font-medium text-primary-600 hover:underline">
              Ver todos los negocios
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const brandColor = getBrandColor(business.settings);
  const logoUrl = getLogoUrl(business);
  const heroImageUrl = getHeroImageUrl(business);
  const timeSlots = selectedDate && business.openingHours
    ? generateTimeSlots('09:00', '19:00', selectedService?.durationMinutes || 30)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Franja de color del negocio - muy visible */}
      <div className="h-3 w-full shrink-0" style={{ backgroundColor: brandColor }} />

      {/* Header con borde inferior del color */}
      <header className="sticky top-0 z-10 border-b-4 bg-white shadow-sm" style={{ borderBottomColor: brandColor }}>
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl.startsWith('/') ? logoUrl : logoUrl}
                alt={business.name ?? 'Logo'}
                className="h-10 w-10 rounded-lg object-cover md:h-12 md:w-12"
              />
            ) : (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold text-white md:h-12 md:w-12"
                style={{ backgroundColor: brandColor }}
              >
                {(business.name ?? '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-gray-900 md:text-xl">{business.name ?? 'Negocio'}</h1>
              {business.description && (
                <p className="line-clamp-1 text-xs text-gray-600">{business.description}</p>
              )}
            </div>
          </div>
          <div className="hidden items-center gap-4 text-sm text-gray-600 md:flex">
            {business.phone && (
              <a href={`tel:${business.phone}`} className="flex items-center gap-1 font-medium hover:opacity-80" style={{ color: brandColor }}>
                📞 {business.phone}
              </a>
            )}
            {business.address && (
              <span className="flex items-center gap-1">
                📍 {business.address}, {business.city}
              </span>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Imagen grande del negocio (hero) */}
        <section className="bg-white">
          <div className="container mx-auto max-w-6xl px-4 py-6">
            <div className="overflow-hidden rounded-2xl">
              {heroImageUrl ? (
                <img
                  src={heroImageUrl.startsWith('/') ? heroImageUrl : heroImageUrl}
                  alt={business.name ?? 'Negocio'}
                  className="h-56 w-full object-cover md:h-72 lg:h-80"
                />
              ) : (
                <div
                  className="flex h-56 w-full items-center justify-center md:h-72 lg:h-80"
                  style={{ backgroundColor: `${brandColor}20` }}
                >
                  <div className="text-center">
                    <div
                      className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-2xl text-4xl font-bold text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      {(business.name ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xl font-semibold text-gray-700">{business.name ?? 'Negocio'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Servicios - sección con franja de color */}
        <section className="relative bg-white py-6">
          <div className="absolute left-0 right-0 top-0 h-2" style={{ backgroundColor: brandColor }} />
          <div className="container mx-auto max-w-6xl px-4 pt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Agendá tu turno</h2>
              <div className="mt-2 flex gap-2">
                <div className="h-2 w-24 rounded-full" style={{ backgroundColor: brandColor }} />
                <div className="h-2 w-4 rounded-full opacity-60" style={{ backgroundColor: brandColor }} />
                <div className="h-2 w-4 rounded-full opacity-40" style={{ backgroundColor: brandColor }} />
              </div>
              <p className="mt-2 text-gray-600">Elegí el servicio y completá tus datos</p>
            </div>

            {showSuccess ? (
              <Card className="mb-8 overflow-hidden border-green-200 bg-green-50">
                <CardContent className="py-16 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">✅</div>
                  <h3 className="mb-2 text-2xl font-bold text-green-900">¡Reserva confirmada!</h3>
                  <p className="text-green-700">Te enviamos un email con los detalles de tu reserva.</p>
                  <p className="mt-2 text-sm text-green-600">Recibirás un recordatorio antes de tu cita.</p>
                </CardContent>
              </Card>
            ) : (business.services ?? []).length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">📋</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-700">Próximamente</h3>
                <p className="text-gray-500">Este negocio aún está configurando sus servicios.</p>
              </div>
            ) : (
              <>
                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(business.services ?? []).map((service: any) => {
                    const isSelected = selectedService?.id === service.id;
                    return (
                      <div
                        key={service.id}
                        className={`relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          isSelected ? 'ring-2 shadow-lg' : ''
                        }`}
                        style={isSelected ? { borderColor: brandColor, boxShadow: `0 0 0 2px ${brandColor}40` } : undefined}
                        onClick={() => {
                          setSelectedService(service);
                          setSelectedEmployee(null);
                          setSelectedDate('');
                          setSelectedTime('');
                        }}
                      >
                        <div className="h-2 w-full" style={{ backgroundColor: brandColor }} />
                        <div className="p-6">
                          <h3 className="mb-2 text-lg font-bold text-gray-900">{service.name}</h3>
                          {service.description && (
                            <p className="mb-4 line-clamp-2 text-sm text-gray-600">{service.description}</p>
                          )}
                          <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm text-gray-500">⏱️ {service.durationMinutes} min</span>
                            <span className="text-xl font-bold text-gray-900">{formatPrice(service.price)}</span>
                          </div>
                          <button
                            type="button"
                            className="w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all"
                            style={
                              isSelected
                                ? { backgroundColor: brandColor, color: 'white', boxShadow: `0 4px 14px ${brandColor}60` }
                                : { border: `2px solid ${brandColor}`, color: brandColor }
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedService(service);
                            }}
                          >
                            {isSelected ? '✓ Seleccionado' : 'Agendar servicio'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Formulario de reserva */}
                {selectedService && !showSuccess && (
                  <Card ref={reservationFormRef} className="overflow-hidden">
                    <div
                      className="border-b border-gray-100 bg-white px-6 py-5"
                      style={{ borderLeft: `4px solid ${brandColor}` }}
                    >
                      <h3 className="text-xl font-semibold text-gray-900">Completá tu reserva</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {selectedService.name} · {formatPrice(selectedService.price)}
                      </p>
                    </div>
                    <CardContent className="p-6">
                      <div className="grid gap-8 lg:grid-cols-2">
                        <div className="space-y-6">
                          {(() => {
                            const employeesForService = (business.employees ?? []).filter((emp: any) => {
                              const services = emp.employeeServices ?? [];
                              if (services.length === 0) return true;
                              return services.some((es: any) => es.serviceId === selectedService.id);
                            });
                            return employeesForService.length > 0 && (
                            <div>
                              <label className="mb-3 block text-sm font-medium text-gray-700">
                                Profesional (opcional)
                              </label>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <button
                                  type="button"
                                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                                    !selectedEmployee ? 'ring-2' : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                  style={!selectedEmployee ? { borderColor: brandColor, backgroundColor: `${brandColor}25` } : undefined}
                                  onClick={() => setSelectedEmployee(null)}
                                >
                                  <p className="font-medium text-gray-900">Sin preferencia</p>
                                  <p className="text-sm text-gray-600">Cualquier disponible</p>
                                </button>
                                {employeesForService.map((employee: any) => {
                                  const isSelected = selectedEmployee?.id === employee.id;
                                  return (
                                    <button
                                      key={employee.id}
                                      type="button"
                                      className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                                        isSelected ? 'ring-2' : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                      style={isSelected ? { borderColor: brandColor, backgroundColor: `${brandColor}25` } : undefined}
                                      onClick={() => setSelectedEmployee(employee)}
                                    >
                                      <div
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold text-white"
                                        style={{ backgroundColor: employee.color || brandColor }}
                                      >
                                        {getInitials(employee.name ?? '?')}
                                      </div>
                                      <p className="font-medium text-gray-900">{employee.name}</p>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            );
                          })()}

                          <div>
                            <label className="mb-3 block text-sm font-medium text-gray-700">
                              Fecha
                            </label>
                            <DatePicker
                              selected={selectedDate ? new Date(selectedDate) : undefined}
                              onSelect={(d) => {
                                if (d) {
                                  setSelectedDate(d.toISOString().split('T')[0]);
                                  setSelectedTime('');
                                }
                              }}
                              brandColor={brandColor}
                            />
                          </div>

                          {selectedDate && (
                            <div>
                              <label className="mb-3 block text-sm font-medium text-gray-700">
                                Horario disponible
                              </label>
                              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                                {timeSlots.map((time) => {
                                  const isSelected = selectedTime === time;
                                  return (
                                    <button
                                      key={time}
                                      type="button"
                                      className={`rounded-xl px-4 py-3 text-base font-medium transition-all ${
                                        isSelected ? 'text-white shadow-md' : 'border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                      }`}
                                      style={isSelected ? { backgroundColor: brandColor } : undefined}
                                      onClick={() => setSelectedTime(time)}
                                    >
                                      {time}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
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
                                  <span className="font-medium">{formatDate(new Date(selectedDate), 'long')}</span>
                                </div>
                              )}
                              {selectedTime && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Hora:</span>
                                  <span className="font-medium">{selectedTime}</span>
                                </div>
                              )}
                              <div className="mt-3 flex justify-between border-t border-gray-200 pt-3">
                                <span className="font-semibold text-gray-900">Total:</span>
                                <span className="text-xl font-bold" style={{ color: brandColor }}>
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
                                className="input w-full"
                                rows={3}
                                placeholder="Comentarios adicionales..."
                                value={clientData.notes}
                                onChange={(e) => setClientData({ ...clientData, notes: e.target.value })}
                              />
                            </div>
                          </div>

                          <Button
                            className="w-full py-3 text-base font-semibold"
                            style={{
                              backgroundColor: brandColor,
                              color: 'white',
                            }}
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
              </>
            )}
          </div>
        </section>

        {/* Info del negocio - con franja de color */}
        <section className="relative border-t border-gray-200 bg-gray-50 py-8">
          <div className="absolute left-0 right-0 top-0 h-1.5" style={{ backgroundColor: brandColor }} />
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                {(logoUrl || heroImageUrl) ? (
                  <img
                    src={logoUrl || heroImageUrl || ''}
                    alt={business.name ?? 'Logo'}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                ) : (
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-xl text-2xl font-bold text-white"
                    style={{ backgroundColor: brandColor }}
                  >
                    {(business.name ?? '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{business.name}</h3>
                  {business.description && (
                    <p className="mt-0.5 line-clamp-2 text-sm text-gray-600">{business.description}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-6 text-sm">
                {business.address && (
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{business.address}, {business.city}</span>
                  </div>
                )}
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="flex items-center gap-2 font-medium" style={{ color: brandColor }}>
                    📞 {business.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-gray-200 bg-white py-6">
        <div className="absolute left-0 right-0 top-0 h-1" style={{ backgroundColor: brandColor }} />
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo variant="icon" size="sm" />
            <span className="text-sm font-medium text-gray-600">Turnos In</span>
          </div>
          <div className="flex gap-6 text-xs text-gray-500">
            <a href="/terminos" className="hover:text-gray-700">Términos</a>
            <a href="/privacidad" className="hover:text-gray-700">Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
