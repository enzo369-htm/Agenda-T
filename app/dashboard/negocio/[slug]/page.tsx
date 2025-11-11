'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { formatPrice, formatDate, formatTime } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function BusinessDashboardPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'employees' | 'bookings' | 'settings'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayBookings: 0,
    weekBookings: 0,
    monthRevenue: 0,
    totalServices: 0,
    totalEmployees: 0,
  });

  // Formulario de nuevo servicio
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    durationMinutes: 30,
    price: 0,
  });

  // Formulario de nuevo empleado
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchBusiness();
    fetchBookings();
    fetchStats();
  }, [slug]);

  const fetchBusiness = async () => {
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

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/businesses/${slug}/bookings`);
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/businesses/${slug}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/businesses/${slug}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService),
      });

      if (!response.ok) throw new Error('Error al crear servicio');

      toast.success('Servicio creado exitosamente');
      setNewService({ name: '', description: '', durationMinutes: 30, price: 0 });
      fetchBusiness();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/businesses/${slug}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      });

      if (!response.ok) throw new Error('Error al crear empleado');

      toast.success('Empleado creado exitosamente');
      setNewEmployee({ name: '', email: '', phone: '' });
      fetchBusiness();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Error al actualizar reserva');

      toast.success('Reserva actualizada');
      fetchBookings();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
              <p className="text-sm text-gray-600">{business.address}, {business.city}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href={`/negocio/${business.slug}`} target="_blank">
                <Button variant="outline">Ver página pública</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            {[
              { id: 'overview', label: 'Resumen' },
              { id: 'bookings', label: 'Reservas' },
              { id: 'services', label: 'Servicios' },
              { id: 'employees', label: 'Empleados' },
              { id: 'settings', label: 'Configuración' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Reservas Hoy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.todayBookings}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Reservas Esta Semana</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.weekBookings}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Ingresos del Mes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{formatPrice(stats.monthRevenue)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Empleados Activos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalEmployees}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Próximas Reservas</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-center text-gray-500">No hay reservas próximas</p>
                ) : (
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">{booking.clientName}</p>
                          <p className="text-sm text-gray-600">{booking.service.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(booking.startTime, 'long')} - {formatTime(booking.startTime)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={booking.status === 'CONFIRMED' ? 'success' : 'warning'}>
                            {booking.status}
                          </Badge>
                          <p className="mt-1 font-bold">{formatPrice(booking.totalPrice)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <Card>
            <CardHeader>
              <CardTitle>Todas las Reservas</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-center text-gray-500">No hay reservas</p>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="rounded-lg border p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{booking.clientName}</p>
                          <p className="text-sm text-gray-600">{booking.clientEmail}</p>
                          <p className="text-sm text-gray-600">{booking.clientPhone}</p>
                        </div>
                        <Badge variant={booking.status === 'CONFIRMED' ? 'success' : 'warning'}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="mb-3 grid gap-2 text-sm">
                        <p>
                          <span className="font-medium">Servicio:</span> {booking.service.name}
                        </p>
                        <p>
                          <span className="font-medium">Fecha:</span>{' '}
                          {formatDate(booking.startTime, 'long')} - {formatTime(booking.startTime)}
                        </p>
                        {booking.employee && (
                          <p>
                            <span className="font-medium">Profesional:</span> {booking.employee.name}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Precio:</span> {formatPrice(booking.totalPrice)}
                        </p>
                        {booking.notes && (
                          <p>
                            <span className="font-medium">Notas:</span> {booking.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {booking.status === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                          >
                            Confirmar
                          </Button>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                          >
                            Marcar completada
                          </Button>
                        )}
                        {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Crear Nuevo Servicio</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateService} className="space-y-4">
                  <Input
                    label="Nombre del servicio"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    required
                  />
                  <div>
                    <label className="label">Descripción</label>
                    <textarea
                      className="input"
                      rows={3}
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Duración (minutos)"
                    type="number"
                    value={newService.durationMinutes}
                    onChange={(e) =>
                      setNewService({ ...newService, durationMinutes: parseInt(e.target.value) })
                    }
                    min={5}
                    required
                  />
                  <Input
                    label="Precio (ARS)"
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                    min={0}
                    step={0.01}
                    required
                  />
                  <Button type="submit" variant="primary" className="w-full">
                    Crear Servicio
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Servicios Actuales ({business.services?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {!business.services || business.services.length === 0 ? (
                  <p className="text-center text-gray-500">No hay servicios creados</p>
                ) : (
                  <div className="space-y-3">
                    {business.services.map((service: any) => (
                      <div key={service.id} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{service.name}</h3>
                            <p className="text-sm text-gray-600">{service.description}</p>
                          </div>
                          <Badge variant={service.isActive ? 'success' : 'gray'}>
                            {service.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">⏱️ {service.durationMinutes} min</span>
                          <span className="font-bold text-gray-900">{formatPrice(service.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Agregar Nuevo Empleado</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateEmployee} className="space-y-4">
                  <Input
                    label="Nombre completo"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  />
                  <Input
                    label="Teléfono"
                    type="tel"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  />
                  <Button type="submit" variant="primary" className="w-full">
                    Agregar Empleado
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Empleados ({business.employees?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {!business.employees || business.employees.length === 0 ? (
                  <p className="text-center text-gray-500">No hay empleados registrados</p>
                ) : (
                  <div className="space-y-3">
                    {business.employees.map((employee: any) => (
                      <div key={employee.id} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{employee.name}</h3>
                            {employee.email && (
                              <p className="text-sm text-gray-600">{employee.email}</p>
                            )}
                            {employee.phone && (
                              <p className="text-sm text-gray-600">{employee.phone}</p>
                            )}
                          </div>
                          <Badge variant={employee.isActive ? 'success' : 'gray'}>
                            {employee.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Negocio</CardTitle>
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

                <div>
                  <h3 className="mb-4 font-semibold">Plan Actual</h3>
                  {business.subscription && (
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{business.subscription.planType}</p>
                          <p className="text-sm text-gray-600">
                            Estado: {business.subscription.status}
                          </p>
                        </div>
                        <Button variant="primary">Actualizar Plan</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
