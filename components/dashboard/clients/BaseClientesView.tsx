'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface BaseClientesViewProps {
  bookings: any[];
  business: any;
}

export function BaseClientesView({ bookings, business }: BaseClientesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Extraer clientes únicos de las reservas
  const clients = Array.from(
    new Map(
      bookings.map((b) => [b.clientEmail, {
        name: b.clientName?.split(' ')[0] || '',
        lastName: b.clientName?.split(' ').slice(1).join(' ') || '',
        email: b.clientEmail,
        phone: b.clientPhone,
        dni: '', // No tenemos DNI en el modelo actual
        bookings: bookings.filter((booking) => booking.clientEmail === b.clientEmail),
      }])
    ).values()
  );

  const filteredClients = clients.filter((client) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      client.lastName.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.phone?.toLowerCase().includes(query) ||
      client.dni?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex h-full">
      {/* Sidebar con Filtros Avanzados */}
      <div className="w-64 border-r bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Filtros avanzados</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Local/sede</label>
            <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option>Selecciona...</option>
              <option>{business?.name}</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Profesional/prestador</label>
            <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option>Selecciona...</option>
              <option>Todos</option>
              {business?.employees?.map((emp: any) => (
                <option key={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Servicios</label>
            <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option>Selecciona...</option>
              {business?.services?.map((service: any) => (
                <option key={service.id}>{service.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Estado de la reserva</label>
            <div className="flex items-center gap-2">
              <select className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                <option>Selecciona...</option>
                <option>Confirmada</option>
                <option>Pendiente</option>
                <option>Completada</option>
                <option>Cancelada</option>
              </select>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Género</label>
            <div className="flex items-center gap-2">
              <select className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                <option>Selecciona...</option>
                <option>Masculino</option>
                <option>Femenino</option>
                <option>Otro</option>
              </select>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Cumpleaños</label>
            <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option>Desde / hasta</option>
              <option>Este mes</option>
              <option>Próximo mes</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Cliente creado en el periodo</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                ↑ Cargar clientes
              </Button>
              <Button variant="primary">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                + Nuevo cliente
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                Crear una audiencia con este listado
              </button>
              <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                <option>Acciones</option>
                <option>Exportar</option>
                <option>Eliminar seleccionados</option>
              </select>
            </div>
          </div>

          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Buscar por apellido, DNI, email y teléfono"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {filteredClients.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-500">No hay clientes registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                          Nombre
                          <svg className="ml-1 inline h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                          Apellido
                          <svg className="ml-1 inline h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                          Correo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                          Teléfono
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                          DNI
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-700">
                          Opciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredClients.map((client, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {client.name}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {client.lastName}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                            {client.email}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                            {client.phone || '-'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                            {client.dni || '-'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-600">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Paginación */}
          {filteredClients.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Mostrando {filteredClients.length} de {clients.length} clientes
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">página 1 de 1</span>
                <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
                  &lt; Anterior
                </button>
                <button className="rounded-lg border border-primary-600 bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-600">
                  1
                </button>
                <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
                  Siguiente &gt;
                </button>
                <select className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm">
                  <option>25 por página</option>
                  <option>50 por página</option>
                  <option>100 por página</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

