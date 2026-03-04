'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function EmailMarketingView() {
  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">
            ¡Crea tu primera campaña de email marketing!
          </h2>
          <p className="mb-6 text-gray-600">
            ¿Tienes algo que decir a tus clientes? informa de las novedades de tu negocio, descuentos y promociones de manera directa por medio de Turnos In.
          </p>
          <Button variant="primary" size="lg">
            Crear mi primera campaña
          </Button>
        </div>
      </div>

      {/* Email Editor Preview */}
      <div className="w-96 border-l bg-gray-50 p-6">
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          <p className="font-medium">Emails enviados: 0 de 50</p>
          <p className="text-xs text-green-600">El contador se reinicia el primer día de cada mes</p>
        </div>

        {/* Email Editor */}
        <Card>
          <CardContent className="p-0">
            <div className="flex">
              {/* Drag & Drop Elements */}
              <div className="w-24 border-r bg-gray-50 p-2">
                <div className="mb-2 rounded border border-dashed border-gray-300 bg-white p-2 text-center text-xs">
                  <svg className="mx-auto mb-1 h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  IMAGEN
                </div>
                <div className="mb-2 rounded border border-dashed border-gray-300 bg-white p-2 text-center text-xs">
                  <svg className="mx-auto mb-1 h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  TEXTO
                </div>
                <div className="rounded border border-dashed border-gray-300 bg-white p-2 text-center text-xs">
                  <svg className="mx-auto mb-1 h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  BOTÓN
                </div>
              </div>

              {/* Email Preview */}
              <div className="flex-1 p-4">
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                  {/* Email Header Image */}
                  <div className="h-32 rounded-t-lg bg-gradient-to-br from-pink-200 to-purple-200"></div>
                  
                  {/* Email Content */}
                  <div className="p-6">
                    <h3 className="mb-3 text-xl font-bold text-gray-900">
                      ¡Celebra esa fecha especial!
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                      Si deseas celebrar tu cumpleaños con todo, te ofrecemos un 40% de descuento en cualquiera de nuestros servicios. Sólo debes presentar este correo en nuestro local y te atenderemos
                    </p>
                    <Button variant="primary" className="mb-4 w-full">
                      Reservar para fecha especial
                    </Button>
                    <p className="mb-3 text-sm text-gray-600">Compártelo con tus amigos</p>
                    <div className="flex gap-2">
                      <button className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </button>
                      <button className="rounded bg-pink-600 p-2 text-white hover:bg-pink-700">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </button>
                      <button className="rounded bg-green-600 p-2 text-white hover:bg-green-700">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </button>
                      <button className="rounded bg-gray-600 p-2 text-white hover:bg-gray-700">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="mt-4 flex justify-end">
                  <Button variant="primary">
                    Guardar y enviar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

