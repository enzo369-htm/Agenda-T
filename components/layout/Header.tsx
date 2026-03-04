'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/">
          <Logo variant="full" size="md" />
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/#como-funciona" className="text-sm font-medium text-gray-700 hover:text-primary-600">
            Cómo Funciona
          </Link>
          <Link href="/#precios" className="text-sm font-medium text-gray-700 hover:text-primary-600">
            Planes
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {status === 'loading' ? (
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
          ) : session ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="sm">
                  Registrarse
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

