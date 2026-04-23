'use client';

import { useEffect, useState, Suspense, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { formatPrice, formatDate, formatTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { WeekCalendarView } from '@/components/dashboard/WeekCalendarView';
import { NewBookingModal } from '@/components/dashboard/NewBookingModal';
import { SalesFacturadasView } from '@/components/dashboard/sales/SalesFacturadasView';
import { MisCobrosView } from '@/components/dashboard/sales/MisCobrosView';
import { BaseClientesView } from '@/components/dashboard/clients/BaseClientesView';
import { EditarNegocioView } from '@/components/dashboard/EditarNegocioView';
import { ServiciosView } from '@/components/dashboard/ServiciosView';
import { BookingDetailModal } from '@/components/dashboard/BookingDetailModal';
import { OnboardingSidebar } from '@/components/dashboard/OnboardingSidebar';
import { useOnboarding } from '@/hooks/useOnboarding';

type SalesSubTab = 'facturadas' | 'cobros';

function BusinessDashboardContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const sanitizeSalesSubTab = useCallback((value: string | null): SalesSubTab => {
    return value === 'cobros' ? 'cobros' : 'facturadas';
  }, []);

  const [business, setBusiness] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'agenda' | 'sales' | 'services' | 'clients' | 'settings'>(
    (searchParams.get('tab') as any) || 'agenda'
  );
  const [salesSubTab, setSalesSubTab] = useState<SalesSubTab>(() => sanitizeSalesSubTab(searchParams.get('sales')));
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'list'>('week');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [modalSelectedDate, setModalSelectedDate] = useState<Date | undefined>();
  const [modalSelectedTime, setModalSelectedTime] = useState<string | undefined>();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Onboarding
  const {
    tasks: onboardingTasks,
    progress: onboardingProgress,
    isSidebarOpen: isOnboardingSidebarOpen,
    setSidebarOpen: setIsOnboardingSidebarOpen,
    markTaskAsCompleted,
  } = useOnboarding(business);
  const fetchBusiness = useCallback(async () => {
    try {
      const response = await fetch(`/api/businesses/${slug}`);
      const data = await response.json();
      setBusiness(data);
      // NO marcamos tareas automáticamente aquí - solo cuando el usuario realiza acciones
    } catch (error) {
      console.error('Error fetching business:', error);
      toast.error('Error al cargar negocio');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  const fetchBookings = useCallback(async () => {
    try {
      const response = await fetch(`/api/businesses/${slug}/bookings`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403) {
          toast.error('No tenés acceso a este negocio. Redirigiendo...');
          router.push('/dashboard');
          return;
        }
        toast.error(data.error || 'Error al cargar reservas');
        setBookings([]);
        return;
      }
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Error al cargar reservas');
      setBookings([]);
    }
  }, [slug, router]);

  useEffect(() => {
    fetchBusiness();
    fetchBookings();
  }, [slug, fetchBusiness, fetchBookings]);

  // Refrescar reservas al volver a la pestaña (p.ej. tras agendar desde web pública)
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && business) {
        fetchBookings();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [fetchBookings, business]);

  // Sincronizar activeTab y subTabs con searchParams
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const salesParam = searchParams.get('sales');

    let hasChanges = false;

    // Actualizar activeTab solo si cambió
    if (tabParam && ['agenda', 'sales', 'services', 'clients', 'settings'].includes(tabParam)) {
      setActiveTab((currentTab) => {
        const newTab = tabParam as typeof currentTab;
        if (newTab !== currentTab) {
          hasChanges = true;
          return newTab;
        }
        return currentTab;
      });
    }

    // Actualizar salesSubTab solo si cambió
    if (salesParam && ['facturadas', 'cobros'].includes(salesParam)) {
      setSalesSubTab((currentSubTab) => {
        const newSubTab = sanitizeSalesSubTab(salesParam);
        if (newSubTab !== currentSubTab) {
          hasChanges = true;
          return newSubTab;
        }
        return currentSubTab;
      });
    }

    // Si hay cambios, activar transición breve
    if (hasChanges) {
      const timer = setTimeout(() => {
        // no-op: dejamos el hook por compatibilidad si se necesita animar más adelante
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchParams, sanitizeSalesSubTab]);

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'prev' ? -7 : 7));
      return newDate;
    });
  }, []);

  const { weekStart, weekEnd } = useMemo(() => {
    const start = new Date(selectedDate);
    start.setDate(selectedDate.getDate() - selectedDate.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { weekStart: start, weekEnd: end };
  }, [selectedDate]);

  const filteredBookings = useMemo(() => {
    if (!selectedEmployee || selectedEmployee === 'all') return bookings;
    return bookings.filter((b) => b.employeeId === selectedEmployee);
  }, [bookings, selectedEmployee]);

  const handleTimeSlotClick = useCallback((date: Date, time: string) => {
    setModalSelectedDate(date);
    setModalSelectedTime(time);
    setIsNewBookingModalOpen(true);
  }, []);

  const handleBookingClick = useCallback((booking: any) => {
    setSelectedBooking(booking);
  }, []);

  const handleNewBookingClose = useCallback(() => {
    setIsNewBookingModalOpen(false);
    setModalSelectedDate(undefined);
    setModalSelectedTime(undefined);
  }, []);

  const handleBookingCreated = useCallback(() => {
    fetchBookings();
    markTaskAsCompleted('test-booking');
  }, [fetchBookings, markTaskAsCompleted]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-gray-500">Negocio no encontrado</p>
              <Link href="/dashboard">
                <Button variant="primary">Volver al Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
        <div className="flex min-h-screen flex-col bg-gray-50">
          <DashboardHeader 
            activeTab={activeTab} 
            business={business}
            onboardingProgress={onboardingProgress}
            onOnboardingClick={() => setIsOnboardingSidebarOpen(true)}
          />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          business={business}
          selectedEmployee={selectedEmployee}
          onEmployeeChange={setSelectedEmployee}
          onDateSelect={setSelectedDate}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'agenda' && (
            <div className="h-full">
              {/* Calendar Header */}
              <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode('week')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                          viewMode === 'week'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Semana
                      </button>
                      <button
                        onClick={() => setViewMode('day')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                          viewMode === 'day'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Día
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                          viewMode === 'list'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Lista
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigateWeek('prev')}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => navigateWeek('next')}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <span className="text-sm font-medium text-gray-900">
                        {weekStart.toLocaleDateString('es-AR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}{' '}
                        -{' '}
                        {weekEnd.toLocaleDateString('es-AR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {bookings.length} reserva{bookings.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        fetchBookings();
                        toast.success('Actualizando reservas...');
                      }}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Actualizar reservas"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setIsNewBookingModalOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                      >
                        Nuevo
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar View */}
              <div className="p-6">
                {viewMode === 'week' && (
                  <WeekCalendarView
                    bookings={filteredBookings}
                    selectedDate={selectedDate}
                    selectedEmployee={selectedEmployee}
                    onTimeSlotClick={handleTimeSlotClick}
                    onBookingClick={handleBookingClick}
                  />
                )}
                {viewMode === 'list' && (
                  <div className="space-y-4">
                    {filteredBookings.length === 0 ? (
                      <p className="text-center text-gray-500">No hay reservas</p>
                    ) : (
                      filteredBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="cursor-pointer rounded-lg border bg-white p-4 hover:shadow-md transition-shadow"
                          onClick={() => handleBookingClick(booking)}
                        >
                          <div className="flex items-start justify-between">
            <div>
                              <p className="font-semibold text-gray-900">{booking.clientName}</p>
                              <p className="text-sm text-gray-600">{booking.service?.name}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(booking.startTime, 'long')} - {formatTime(booking.startTime)}
                              </p>
            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">{formatPrice(booking.totalPrice)}</p>
                              <Badge
                                variant={
                                  booking.status === 'CONFIRMED'
                                    ? 'success'
                                    : booking.status === 'PENDING'
                                    ? 'warning'
                                    : 'primary'
                                }
                              >
                                {booking.status}
            </Badge>
          </div>
        </div>
        </div>
                      ))
                    )}
      </div>
                )}
              </div>
            </div>
          )}

          {/* Sales Tab */}
          {activeTab === 'sales' && (
            <div className="h-full">
              {/* Sales Header */}
              <div className="border-b bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {salesSubTab === 'facturadas' && 'Ventas Facturadas'}
                      {salesSubTab === 'cobros' && 'Mis cobros'}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={salesSubTab}
                      onChange={(e) => {
                        setSalesSubTab(e.target.value as SalesSubTab);
                        router.push(`/dashboard/negocio/${slug}?tab=sales&sales=${e.target.value}`);
                      }}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="facturadas">Ventas Facturadas</option>
                      <option value="cobros">Mis cobros</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Buscar por..."
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <Button variant="primary">
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      + Nueva venta
                    </Button>
                  </div>
        </div>
      </div>

              {/* Sales Content */}
              <div className="p-6">
                {salesSubTab === 'facturadas' && (
                  <SalesFacturadasView bookings={bookings} />
                )}
                {salesSubTab === 'cobros' && (
                  <MisCobrosView bookings={bookings} business={business} />
                )}
              </div>
          </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="h-full">
              <div className="border-b bg-white px-6 py-4">
                <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
              </div>
              <div className="p-6">
                <ServiciosView business={business} onServicesChanged={fetchBusiness} />
              </div>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <div className="h-full">
              <div className="border-b bg-white px-6 py-4">
                <h1 className="text-2xl font-bold text-gray-900">Base de Clientes</h1>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <BaseClientesView bookings={bookings} business={business} />
              </div>
            </div>
          )}

          {/* Settings Tab - Administración */}
          {activeTab === 'settings' && (
            <div className="p-6 space-y-6">
              <EditarNegocioView
                business={business}
                onSuccess={fetchBusiness}
              />

              <Card>
                <CardHeader>
                  <CardTitle>URL de tu página de agendado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Input
                      value={`${process.env.NEXT_PUBLIC_APP_URL || 'https://tu-dominio.com'}/negocio/${business.slug}`}
                      readOnly
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${process.env.NEXT_PUBLIC_APP_URL || 'https://tu-dominio.com'}/negocio/${business.slug}`
                        );
                        toast.success('Link copiado');
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upgrade Plan Section */}
              <Card className="border-primary-200 bg-primary-50">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    ¿Tu negocio creció y necesitas más? ¡Tenemos un plan para ti!
                  </h3>
                  <ul className="mb-4 space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Más profesionales/agendas
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Control de inventario
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Cálculo de comisiones
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Terminal de venta (POS)
                    </li>
                  </ul>
                  <p className="mb-4 text-sm text-gray-600">
                    ¡Mejora tu plan ahora para obtener estos y más beneficios!
                  </p>
                  <Button variant="primary">Quiero mejorar mi plan</Button>
                </CardContent>
              </Card>
            </div>
          )}
      </main>
    </div>

          {/* Booking Detail Modal */}
          {selectedBooking && (
            <BookingDetailModal
              booking={selectedBooking}
              businessSlug={slug}
              onClose={() => setSelectedBooking(null)}
              onStatusChange={() => {
                fetchBookings();
                setSelectedBooking(null);
              }}
            />
          )}

          {/* New Booking Modal */}
          <NewBookingModal
            isOpen={isNewBookingModalOpen}
            onClose={handleNewBookingClose}
            business={business}
            selectedDate={modalSelectedDate}
            selectedTime={modalSelectedTime}
            selectedEmployee={selectedEmployee !== 'all' ? selectedEmployee : undefined}
            onBookingCreated={handleBookingCreated}
          />

          {/* Onboarding Sidebar */}
          {isOnboardingSidebarOpen && (
            <OnboardingSidebar
              business={business}
              tasks={onboardingTasks}
              progress={onboardingProgress}
              onClose={() => setIsOnboardingSidebarOpen(false)}
              onTaskAction={(task) => {
                // Marcar tarea como completada si corresponde
                if (task.id === 'test-booking' && bookings.length > 0) {
                  markTaskAsCompleted('test-booking');
                }
              }}
            />
          )}

        </div>
      );
    }

export default function BusinessDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    }>
      <BusinessDashboardContent />
    </Suspense>
  );
}
