'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
] as const;

function getBrandColor(settings: unknown): string {
  if (!settings || typeof settings !== 'object') return '#0ea5e9';
  const s = settings as { primaryColor?: string };
  return (s.primaryColor && /^#[0-9A-Fa-f]{6}$/.test(s.primaryColor)) ? s.primaryColor : '#0ea5e9';
}

function getOpeningHours(hours: unknown): Record<string, { open: boolean; start: string; end: string }> {
  const result: Record<string, { open: boolean; start: string; end: string }> = {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
  const raw = hours as Record<string, { start?: string; end?: string }[] | { open?: boolean; start?: string; end?: string }> | undefined;
  if (!raw) {
    return Object.fromEntries(days.map((d) => [d, { open: true, start: '09:00', end: '18:00' }]));
  }
  for (const day of days) {
    const d = raw[day];
    if (Array.isArray(d) && d.length > 0) {
      result[day] = { open: true, start: d[0].start || '09:00', end: d[0].end || '18:00' };
    } else if (d && typeof d === 'object' && 'open' in d) {
      result[day] = {
        open: (d as { open?: boolean }).open ?? true,
        start: (d as { start?: string }).start || '09:00',
        end: (d as { end?: string }).end || '18:00',
      };
    } else {
      result[day] = { open: true, start: '09:00', end: '18:00' };
    }
  }
  return result;
}

export function EditarNegocioView({ business, onSuccess }: { business: any; onSuccess?: () => void }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    city: '',
    coverImage: '',
    coverImageFile: null as File | null,
    logo: '',
    logoFile: null as File | null,
    primaryColor: '#0ea5e9',
  });
  const [hours, setHours] = useState<Record<string, { open: boolean; start: string; end: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (business) {
      setForm({
        name: business.name || '',
        description: business.description || '',
        phone: business.phone || '',
        address: business.address || '',
        city: business.city || '',
        coverImage: business.coverImage || '',
        coverImageFile: null,
        logo: business.logo || '',
        logoFile: null,
        primaryColor: getBrandColor(business.settings),
      });
      setHours(getOpeningHours(business.openingHours));
    }
  }, [business]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setIsSubmitting(true);
    try {
      let coverImageUrl = form.coverImage;
      if (form.coverImageFile) {
        const fd = new FormData();
        fd.append('cover', form.coverImageFile);
        const res = await fetch('/api/upload/logo', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al subir imagen');
        coverImageUrl = data.url;
      }
      let logoUrl = form.logo;
      if (form.logoFile) {
        const fd = new FormData();
        fd.append('logo', form.logoFile);
        const res = await fetch('/api/upload/logo', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al subir logo');
        logoUrl = data.url;
      }

      const updatePayload: Record<string, unknown> = {
        name: form.name,
        description: form.description || undefined,
        phone: form.phone,
        address: form.address,
        city: form.city,
        coverImage: coverImageUrl || undefined,
        logo: logoUrl || undefined,
        primaryColor: form.primaryColor,
        openingHours: hours,
      };

      const res = await fetch(`/api/businesses/${business.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      toast.success('Negocio actualizado correctamente');
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!business) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar negocio</CardTitle>
        <p className="text-sm text-gray-600">
          Los cambios se reflejan en tu página de agendado de turnos
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Nombre del negocio"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Teléfono"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              className="input w-full"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe tu negocio..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Dirección"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
            <Input
              label="Ciudad"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Imagen principal (foto del negocio)
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setForm({
                      ...form,
                      coverImageFile: f,
                      coverImage: URL.createObjectURL(f),
                    });
                  }
                }}
                className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700"
              />
              {form.coverImage && (
                <div className="flex items-center gap-2">
                  <img
                    src={form.coverImage}
                    alt="Vista previa"
                    className="h-20 w-28 rounded-lg border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (form.coverImage.startsWith('blob:')) URL.revokeObjectURL(form.coverImage);
                      setForm({ ...form, coverImage: '', coverImageFile: null });
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Quitar
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Logo (opcional)</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setForm({
                      ...form,
                      logoFile: f,
                      logo: URL.createObjectURL(f),
                    });
                  }
                }}
                className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700"
              />
              {form.logo && (
                <div className="flex items-center gap-2">
                  <img
                    src={form.logo}
                    alt="Logo"
                    className="h-12 w-12 rounded-lg border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (form.logo.startsWith('blob:')) URL.revokeObjectURL(form.logo);
                      setForm({ ...form, logo: '', logoFile: null });
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Quitar
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Color primario</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="h-10 w-14 cursor-pointer rounded border"
              />
              <Input
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                placeholder="#0ea5e9"
              />
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Horarios de atención</h3>
            <div className="space-y-3">
              {DAYS.map(({ key, label }) => (
                <div key={key} className="flex flex-wrap items-center gap-4 rounded-lg border p-4">
                  <div className="flex w-28 items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hours[key]?.open}
                      onChange={(e) =>
                        setHours({ ...hours, [key]: { ...hours[key], open: e.target.checked } })
                      }
                      className="h-4 w-4 rounded"
                    />
                    <span className="font-medium">{label}</span>
                  </div>
                  {hours[key]?.open && (
                    <div className="flex gap-2">
                      <Input
                        type="time"
                        value={hours[key]?.start}
                        onChange={(e) =>
                          setHours({ ...hours, [key]: { ...hours[key], start: e.target.value } })
                        }
                      />
                      <span className="self-center">a</span>
                      <Input
                        type="time"
                        value={hours[key]?.end}
                        onChange={(e) =>
                          setHours({ ...hours, [key]: { ...hours[key], end: e.target.value } })
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Guardar cambios
            </Button>
            <a
              href={`/negocio/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Ver página de agendado
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
