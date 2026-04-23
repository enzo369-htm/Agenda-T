'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
      if (session?.user?.role === 'BUSINESS_OWNER' || !session?.user?.role) {
        const response = await fetch('/api/businesses?mine=1', { credentials: 'include' });
        let userBusinesses: { slug: string }[] = [];
        try {
          const data = await response.json();
          userBusinesses = Array.isArray(data?.businesses) ? data.businesses : [];
        } catch {
          // Si falla el parse (ej. respuesta vacía), asumir sin negocios
        }

        // Si tiene negocios, redirigir al primero
        if (userBusinesses.length > 0) {
          router.push(`/dashboard/negocio/${userBusinesses[0].slug}`);
          return;
        }
        // Sin negocios: ir al onboarding
        router.push('/onboarding');
        return;
      } else {
        // Si es cliente, redirigir a buscar negocios
        router.push('/negocios');
        return;
      }
    } catch (error) {
      // Silenciar: mostramos opción de crear negocio
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

  return null;
}

