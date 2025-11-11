'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatDate, formatTime } from '@/lib/utils';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Si es dueño de negocio, buscar sus negocios
      if (session?.user?.role === 'BUSINESS_OWNER') {
        const response = await fetch('/api/businesses');
        const data = await response.json();
        setBusinesses(data.businesses || []);
      }

      // Buscar reservas del usuario
      const bookingsResponse = await fetch('/api/bookings');
      const bookingsData = await bookingsResponse.json();
      setBookings(bookingsData.bookings || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  const isBusinessOwner = session?.user?.role === 'BUSINESS_OWNER';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Bienvenido, {session?.user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost">Inicio</Button>
              </Link>
              {isBusinessOwner && (
                <Link href="/dashboard/negocio/nuevo">
                  <Button variant="primary">Crear Negocio</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isBusinessOwner && businesses.length === 0 && (
          <Card className="mb-8">
            <CardContent className="py-12 text-center">
              <h2 className="mb-2 text-xl font-semibold">No tienes negocios registrados</h2>
              <p className="mb-6 text-gray-600">
                Crea tu primer negocio para empezar a recibir reservas
              </p>
              <Link href="/dashboard/negocio/nuevo">
                <Button variant="primary">Crear Mi Negocio</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {isBusinessOwner && businesses.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Mis Negocios</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business) => (
                <Card key={business.id}>
                  <CardHeader>
                    <CardTitle>{business.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm text-gray-600">{business.description}</p>
                    <div className="mb-4 space-y-2 text-sm">
                      <p>📍 {business.city}</p>
                      <p>📞 {business.phone}</p>
                      <Badge variant={business.isActive ? 'success' : 'gray'}>
                        {business.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <Link href={`/dashboard/negocio/${business.slug}`}>
                      <Button variant="primary" className="w-full">
                        Gestionar
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="mb-4 text-xl font-semibold">
            {isBusinessOwner ? 'Reservas Recientes' : 'Mis Reservas'}
          </h2>
          
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No tienes reservas</p>
                {!isBusinessOwner && (
                  <Link href="/negocios" className="mt-4 inline-block">
                    <Button variant="primary">Buscar Negocios</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 10).map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{booking.business.name}</h3>
                        <p className="text-sm text-gray-600">{booking.service.name}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          📅 {formatDate(booking.startTime, 'long')} - {formatTime(booking.startTime)}
                        </p>
                        {booking.employee && (
                          <p className="text-sm text-gray-500">👤 {booking.employee.name}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            booking.status === 'CONFIRMED'
                              ? 'success'
                              : booking.status === 'PENDING'
                              ? 'warning'
                              : booking.status === 'COMPLETED'
                              ? 'primary'
                              : 'danger'
                          }
                        >
                          {booking.status === 'CONFIRMED' && 'Confirmada'}
                          {booking.status === 'PENDING' && 'Pendiente'}
                          {booking.status === 'COMPLETED' && 'Completada'}
                          {booking.status === 'CANCELLED' && 'Cancelada'}
                        </Badge>
                        <p className="mt-2 text-lg font-bold text-gray-900">
                          {formatPrice(booking.totalPrice)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

