'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatDate, formatTime } from '@/lib/utils';

interface MisCobrosViewProps {
  bookings: any[];
  business: any;
}

export function MisCobrosView({ bookings, business }: MisCobrosViewProps) {
  const [activeTab, setActiveTab] = useState<'unpaid' | 'sent'>('unpaid');
  const unpaidBookings = bookings.filter((b) => b.paymentStatus !== 'PAID' && b.status !== 'CANCELLED');

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-white p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Período</label>
          <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
            <option>7 días</option>
            <option>30 días</option>
            <option>90 días</option>
            <option>Personalizado</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Local</label>
          <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
            <option>Todos</option>
            <option>{business?.name}</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Cliente</label>
          <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
            <option>Todos</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Profesional</label>
          <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
            <option>Todos</option>
            {business?.employees?.map((emp: any) => (
              <option key={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs y Botón Cobrar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab('unpaid')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'unpaid'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Reservas no pagadas
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'sent'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cobros enviados
          </button>
        </div>
        <Button variant="primary">
          Cobrar ({unpaidBookings.length})
          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </div>

      {/* Tabla */}
      {activeTab === 'unpaid' && (
        <Card>
          <CardContent className="p-0">
            {unpaidBookings.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500">No hay reservas no pagadas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Servicio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Local
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Profesional
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-700">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-700">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {unpaidBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {formatDate(booking.startTime, 'short')} {formatTime(booking.startTime)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {booking.service?.name || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {business?.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {booking.clientName}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {booking.employee?.name || 'Sin asignar'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900">
                          {formatPrice(booking.totalPrice)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <Button size="sm" variant="primary">
                            Cobrar
                            <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'sent' && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No hay cobros enviados</p>
          </CardContent>
        </Card>
      )}

      {/* Paginación */}
      {unpaidBookings.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">página 1 de 1</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              &lt; Anterior
            </Button>
            <Button variant="outline" size="sm" className="bg-primary-50 text-primary-600">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              Siguiente &gt;
            </Button>
            <select className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm">
              <option>25 por página</option>
              <option>50 por página</option>
              <option>100 por página</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

