'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';

interface BookingInfo {
  id: string;
  clientName: string;
  serviceName: string;
  startTime: string;
  businessName: string;
}

type PageState = 'loading' | 'ready' | 'confirming' | 'done' | 'error' | 'expired';

export default function ConfirmarPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params.token as string;
  const preAction = searchParams.get('action');

  const [state, setState] = useState<PageState>('loading');
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [resultAction, setResultAction] = useState<'confirm' | 'cancel' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const res = await fetch(`/api/bookings/confirm/info?token=${token}`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (res.status === 404) {
          setErrorMsg('Este link no es válido o ya expiró.');
          setState('error');
          return;
        }
        setErrorMsg(data?.error || 'Error al validar el link');
        setState('error');
        return;
      }
      const data = await res.json();
      setBooking(data.booking);

      if (new Date(data.booking.startTime) < new Date()) {
        setState('expired');
        return;
      }

      setState('ready');
    } catch {
      setErrorMsg('Error de conexión. Intentá de nuevo.');
      setState('error');
    }
  };

  const handleAction = async (action: 'confirm' | 'cancel') => {
    setState('confirming');
    try {
      const res = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Error al procesar');
        setState('error');
        return;
      }
      setResultAction(action);
      setState('done');
    } catch {
      setErrorMsg('Error de conexión');
      setState('error');
    }
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const time = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b bg-white py-4">
        <div className="container mx-auto flex items-center justify-center px-4">
          <Logo variant="full" size="md" />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {state === 'loading' && (
            <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
              <p className="mt-4 text-gray-600">Cargando información del turno...</p>
            </div>
          )}

          {state === 'ready' && booking && (
            <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-8 text-center text-white">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl">
                  🔔
                </div>
                <h1 className="text-2xl font-bold">Confirmá tu turno</h1>
                <p className="mt-1 text-amber-100">{booking.businessName}</p>
              </div>

              <div className="p-6">
                <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-500">Servicio</p>
                      <p className="text-lg font-semibold text-gray-900">{booking.serviceName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">Fecha</p>
                        <p className="font-medium text-gray-900">
                          {formatDateTime(booking.startTime).date}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">Hora</p>
                        <p className="font-medium text-gray-900">
                          {formatDateTime(booking.startTime).time}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mb-6 text-center text-sm text-gray-600">
                  Hola <strong>{booking.clientName}</strong>, confirmanos si vas a asistir a tu turno.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => handleAction('confirm')}
                    className="w-full rounded-xl bg-green-600 px-6 py-4 text-lg font-bold text-white transition-all hover:bg-green-700 hover:shadow-lg active:scale-[0.98]"
                  >
                    ✅ Confirmo mi asistencia
                  </button>
                  <button
                    onClick={() => handleAction('cancel')}
                    className="w-full rounded-xl border-2 border-red-300 bg-white px-6 py-4 text-lg font-bold text-red-600 transition-all hover:bg-red-50 active:scale-[0.98]"
                  >
                    ❌ Necesito cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {state === 'confirming' && (
            <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
              <p className="mt-4 text-gray-600">Procesando...</p>
            </div>
          )}

          {state === 'done' && (
            <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
              <div
                className={`px-6 py-10 text-center text-white ${
                  resultAction === 'confirm'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : 'bg-gradient-to-r from-red-500 to-rose-600'
                }`}
              >
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-5xl">
                  {resultAction === 'confirm' ? '✅' : '❌'}
                </div>
                <h1 className="text-2xl font-bold">
                  {resultAction === 'confirm' ? '¡Turno confirmado!' : 'Turno cancelado'}
                </h1>
              </div>
              <div className="p-6 text-center">
                {resultAction === 'confirm' ? (
                  <>
                    <p className="text-gray-700">
                      Tu turno en <strong>{booking?.businessName}</strong> quedó confirmado.
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      ¡Te esperamos! No olvides llegar a tiempo.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-700">
                      Tu turno en <strong>{booking?.businessName}</strong> fue cancelado.
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      El negocio fue notificado. Si querés reprogramar, visitá su página de agendado.
                    </p>
                  </>
                )}
                <div className="mt-6">
                  <a
                    href="/"
                    className="inline-block rounded-lg bg-gray-100 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    Ir al inicio
                  </a>
                </div>
              </div>
            </div>
          )}

          {state === 'error' && (
            <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-8 text-center text-white">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl">
                  ⚠️
                </div>
                <h1 className="text-xl font-bold">No pudimos procesar tu solicitud</h1>
              </div>
              <div className="p-6 text-center">
                <p className="text-gray-600">{errorMsg}</p>
                <button
                  onClick={() => { setState('loading'); validateToken(); }}
                  className="mt-4 rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {state === 'expired' && (
            <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
              <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-8 text-center text-white">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl">
                  ⏰
                </div>
                <h1 className="text-xl font-bold">Este turno ya pasó</h1>
              </div>
              <div className="p-6 text-center">
                <p className="text-gray-600">
                  El turno ya fue realizado y no se puede modificar.
                </p>
                <a
                  href="/"
                  className="mt-4 inline-block rounded-lg bg-gray-100 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Ir al inicio
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t bg-white py-4">
        <div className="container mx-auto text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Turnos In. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
