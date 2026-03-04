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
import { EmailMarketingView } from '@/components/dashboard/clients/EmailMarketingView';
import { OnboardingSidebar } from '@/components/dashboard/OnboardingSidebar';
import { OnboardingTooltip } from '@/components/dashboard/OnboardingTooltip';
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
  const [activeTab, setActiveTab] = useState<'agenda' | 'sales' | 'clients' | 'settings'>(
    (searchParams.get('tab') as any) || 'agenda'
  );
  const [salesSubTab, setSalesSubTab] = useState<SalesSubTab>(() => sanitizeSalesSubTab(searchParams.get('sales')));
  const [clientsSubTab, setClientsSubTab] = useState<'base' | 'email-marketing'>(
    (searchParams.get('clients') as any) || 'base'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'list'>('week');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [modalSelectedDate, setModalSelectedDate] = useState<Date | undefined>();
  const [modalSelectedTime, setModalSelectedTime] = useState<string | undefined>();

  // Onboarding
  const {
    tasks: onboardingTasks,
    progress: onboardingProgress,
    isSidebarOpen: isOnboardingSidebarOpen,
    setSidebarOpen: setIsOnboardingSidebarOpen,
    markTaskAsCompleted,
  } = useOnboarding(business);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

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
      const response = await fetch(`/api/businesses/${slug}/bookings`);
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  }, [slug]);

  useEffect(() => {
    fetchBusiness();
    fetchBookings();
  }, [slug, fetchBusiness, fetchBookings]);

  // Sincronizar activeTab y subTabs con searchParams
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const salesParam = searchParams.get('sales');
    const clientsParam = searchParams.get('clients');

    let hasChanges = false;

    // Actualizar activeTab solo si cambió
    if (tabParam && ['agenda', 'sales', 'clients', 'settings'].includes(tabParam)) {
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

    // Actualizar clientsSubTab solo si cambió
    if (clientsParam && ['base', 'email-marketing'].includes(clientsParam)) {
      setClientsSubTab((currentSubTab) => {
        const newSubTab = clientsParam as typeof currentSubTab;
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
    toast(`Reserva: ${booking.clientName} - ${formatTime(booking.startTime)}`);
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
                    <span className="text-xs text-gray-500">Actualizado hace 0 min</span>
                    <button className="p-2 hover:bg-gray-100 rounded">
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
                          className="rounded-lg border bg-white p-4 hover:shadow-md transition-shadow"
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

          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <div className="h-full">
              {/* Clients Header */}
              <div className="border-b bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {clientsSubTab === 'base' && 'Base de Clientes'}
                    {clientsSubTab === 'email-marketing' && 'Email Marketing'}
                  </h1>
                </div>
          </div>
          
              {/* Clients Content */}
              <div className="flex h-full">
                {/* Sidebar para Email Marketing y Recordatorios */}
                {clientsSubTab === 'email-marketing' && (
                  <div className="w-64 border-r bg-white p-4">
                    <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase">
                      Email marketing
                    </h2>
                    {clientsSubTab === 'email-marketing' && (
                      <nav className="space-y-1">
                        <a
                          href={`/dashboard/negocio/${slug}?tab=clients&clients=email-marketing`}
                          className="flex items-center gap-3 rounded-lg bg-primary-50 px-3 py-2 text-sm font-medium text-primary-600"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                          </svg>
                          Campañas
                        </a>
                        <a
                          href="#"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Audiencias
                        </a>
                        <a
                          href="#"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Emails Suprimidos
                        </a>
                      </nav>
                    )}
                  </div>
                )}

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                  {clientsSubTab === 'base' && (
                    <BaseClientesView bookings={bookings} business={business} />
                  )}
                  {clientsSubTab === 'email-marketing' && (
                    <EmailMarketingView />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-6 space-y-6">
              {/* Banner Informativo */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">¡Configura el horario y la dirección del local!</p>
                    <p className="text-xs mt-1">Con esta información, podrás agendar citas manuales y tus clientes podrán agendar sus citas en el sitio web</p>
                  </div>
                </div>
              </div>

              {/* Perfil Section */}
          <Card>
            <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{business?.name || 'Negocio'}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" id="view-schedule-button">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver horario
                      </Button>
                      <Button variant="primary" size="sm" id="edit-schedule-button">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </Button>
                    </div>
                  </div>
            </CardHeader>
            <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4 font-semibold">Información Básica</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-gray-600">Nombre</p>
                          <p className="font-medium">{business.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Slug</p>
                          <p className="font-medium">{business.slug}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Teléfono</p>
                          <p className="font-medium">{business.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{business.email || 'No configurado'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600">Dirección</p>
                          <p className="font-medium">
                            {business.address}, {business.city}, {business.state}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 font-semibold">URL Pública</h3>
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
                    </div>
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

          {/* Onboarding Tooltips */}
          {activeTab === 'settings' && activeTooltip === 'schedule' && (
            <OnboardingTooltip
              title="¡Excelente! ✨"
              description="Accede a esta sección para configurar tu horario y dirección."
              step="Paso 2 de 4"
              targetId="edit-schedule-button"
              position="right"
              onClose={() => setActiveTooltip(null)}
              onNext={() => setActiveTooltip('schedule-details')}
              show={true}
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
