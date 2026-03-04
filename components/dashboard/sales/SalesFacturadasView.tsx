'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatDate } from '@/lib/utils';

interface SalesFacturadasViewProps {
  bookings: any[];
}

export function SalesFacturadasView({ bookings }: SalesFacturadasViewProps) {
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  // Desglose por tipo (todos son servicios por ahora)
  const serviciosRevenue = totalRevenue;
  const productosRevenue = 0;
  const planesRevenue = 0;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-white p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Desde / Hasta</label>
          <input
            type="date"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <input
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Métodos de pago</label>
          <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
            <option>Todos seleccionados</option>
            <option>Efectivo</option>
            <option>Tarjeta</option>
            <option>Online</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Tipo de comprobante</label>
          <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
            <option>Todos seleccionados</option>
            <option>Factura</option>
            <option>Ticket</option>
          </select>
        </div>
        <Button variant="primary">Buscar</Button>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Ventas Facturadas Totales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Ventas Facturadas totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
          </CardContent>
        </Card>

        {/* Ventas Facturadas - Desglose */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Ventas Facturadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Servicios</span>
                <span className="text-sm font-semibold text-gray-900">{formatPrice(serviciosRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Productos</span>
                <span className="text-sm font-semibold text-gray-900">{formatPrice(productosRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Planes</span>
                <span className="text-sm font-semibold text-gray-900">{formatPrice(planesRevenue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medios de pago */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Medios de pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Efectivo (Vuelto)</span>
                <span className="font-semibold text-gray-900">$0 ($0)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tarjeta de Crédito</span>
                <span className="font-semibold text-gray-900">$0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tarjeta de Débito</span>
                <span className="font-semibold text-gray-900">$0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cheque</span>
                <span className="font-semibold text-gray-900">$0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Otro</span>
                <span className="font-semibold text-gray-900">$0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Online</span>
                <span className="font-semibold text-gray-900">$0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Pagos */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Pagos</span>
        </div>
        <Button variant="outline">
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Descargar pagos
        </Button>
      </div>

      {/* Tabla */}
      {completedBookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500">No hay pagos registrados</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Método de pago
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-700">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {completedBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {formatDate(booking.startTime, 'short')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {booking.clientName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {booking.service?.name || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {booking.paymentStatus === 'PAID' ? 'Online' : 'Pendiente'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        {formatPrice(booking.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

