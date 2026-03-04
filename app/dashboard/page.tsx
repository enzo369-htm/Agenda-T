'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
        const userBusinesses = data.businesses || [];

        // Si tiene negocios, redirigir al primero
        if (userBusinesses.length > 0) {
          router.push(`/dashboard/negocio/${userBusinesses[0].slug}`);
          return;
        }
      } else {
        // Si es cliente, redirigir a buscar negocios
        router.push('/negocios');
        return;
      }
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

  // Si llegamos aquí, es un dueño de negocio sin negocios
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center">
          <div className="mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <svg
                className="h-8 w-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Crea tu primer negocio</h2>
            <p className="text-gray-600">
              Comienza a recibir reservas online. Configura tu negocio en minutos.
            </p>
          </div>
          <Link href="/dashboard/negocio/nuevo">
            <Button variant="primary" className="w-full">
              Crear Mi Negocio
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

