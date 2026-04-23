'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  order: number;
}

interface ServiciosViewProps {
  business: any;
  onServicesChanged?: () => void;
}

export function ServiciosView({ business, onServicesChanged }: ServiciosViewProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    durationMinutes: 30,
    price: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch(`/api/businesses/${business.slug}/services`);
      const data = await res.json();
      if (res.ok) {
        setServices(data.services || []);
      }
    } catch {
      toast.error('Error al cargar servicios');
    } finally {
      setIsLoading(false);
    }
  }, [business.slug]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const resetForm = () => {
    setForm({ name: '', description: '', durationMinutes: 30, price: 0 });
    setEditingId(null);
    setShowNewForm(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (form.durationMinutes <= 0) {
      toast.error('La duración debe ser mayor a 0');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/businesses/${business.slug}/services`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...form }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Error al actualizar');
        }
        toast.success('Servicio actualizado');
      } else {
        const res = await fetch(`/api/businesses/${business.slug}/services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Error al crear');
        }
        toast.success('Servicio creado');
      }
      resetForm();
      fetchServices();
      onServicesChanged?.();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (service: Service) => {
    setForm({
      name: service.name,
      description: service.description || '',
      durationMinutes: service.durationMinutes,
      price: service.price,
    });
    setEditingId(service.id);
    setShowNewForm(true);
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const res = await fetch(`/api/businesses/${business.slug}/services`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: service.id, isActive: !service.isActive }),
      });
      if (!res.ok) throw new Error('Error al actualizar');
      toast.success(service.isActive ? 'Servicio desactivado' : 'Servicio activado');
      fetchServices();
      onServicesChanged?.();
    } catch {
      toast.error('Error al cambiar estado');
    }
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`¿Eliminar "${service.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`/api/businesses/${business.slug}/services?id=${service.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar');
      toast.success('Servicio eliminado');
      fetchServices();
      onServicesChanged?.();
    } catch {
      toast.error('Error al eliminar servicio');
    }
  };

  const formatPrice = (price: number) =>
    price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Servicios</CardTitle>
              <p className="mt-1 text-sm text-gray-600">
                Gestioná los servicios que ofrecés a tus clientes
              </p>
            </div>
            {!showNewForm && (
              <Button
                variant="primary"
                onClick={() => {
                  resetForm();
                  setShowNewForm(true);
                }}
              >
                + Nuevo servicio
              </Button>
            )}
          </div>
        </CardHeader>

        {showNewForm && (
          <CardContent>
            <div className="mb-6 rounded-lg border-2 border-primary-200 bg-primary-50/50 p-6">
              <h4 className="mb-4 font-semibold text-gray-900">
                {editingId ? 'Editar servicio' : 'Nuevo servicio'}
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Nombre del servicio *"
                  placeholder="Ej: Corte de pelo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Duración (min) *"
                    type="number"
                    min={5}
                    value={form.durationMinutes || ''}
                    onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })}
                  />
                  <Input
                    label="Precio *"
                    type="number"
                    min={0}
                    step={100}
                    value={form.price || ''}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Descripción (opcional)
                </label>
                <textarea
                  className="input w-full"
                  rows={2}
                  placeholder="Describe el servicio..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
                  {editingId ? 'Guardar cambios' : 'Crear servicio'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        )}

        <CardContent>
          {services.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
                📋
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No tenés servicios creados
              </h3>
              <p className="mb-4 text-gray-600">
                Agregá tu primer servicio para que los clientes puedan agendar turnos.
              </p>
              {!showNewForm && (
                <Button
                  variant="primary"
                  onClick={() => {
                    resetForm();
                    setShowNewForm(true);
                  }}
                >
                  + Crear primer servicio
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`flex items-center justify-between gap-4 py-4 ${
                    !service.isActive ? 'opacity-50' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      {!service.isActive && (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </div>
                    {service.description && (
                      <p className="mt-0.5 truncate text-sm text-gray-600">{service.description}</p>
                    )}
                    <div className="mt-1 flex gap-4 text-sm text-gray-500">
                      <span>⏱️ {service.durationMinutes} min</span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(service.price)}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(service)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(service)}
                      className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                        service.isActive
                          ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                          : 'border-green-300 text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {service.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(service)}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
