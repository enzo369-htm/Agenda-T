'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '../ui/Button';

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold">
            AT
          </div>
          <span className="text-xl font-bold text-gray-900">Agenda Turnos Pro</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/negocios" className="text-sm font-medium text-gray-700 hover:text-primary-600">
            Buscar Negocios
          </Link>
          <Link href="/como-funciona" className="text-sm font-medium text-gray-700 hover:text-primary-600">
            Cómo Funciona
          </Link>
          <Link href="/para-negocios" className="text-sm font-medium text-gray-700 hover:text-primary-600">
            Para Negocios
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

