'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { slugify } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Logo } from '@/components/ui/Logo';

const STEPS = [
  { id: 1, title: 'Tu negocio', description: 'Información básica' },
  { id: 2, title: 'Servicios', description: 'Qué ofrecés' },
  { id: 3, title: 'Profesionales', description: 'Tu equipo' },
  { id: 4, title: 'Horarios', description: 'Cuándo atendés' },
];

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
] as const;

const DEFAULT_DAY = { open: true, start: '09:00', end: '18:00' };

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [business, setBusiness] = useState<{ id: string; slug: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [businessForm, setBusinessForm] = useState({
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

  const [services, setServices] = useState<{ name: string; durationMinutes: number; price: number }[]>([
    { name: '', durationMinutes: 30, price: 0 },
  ]);

  const [employees, setEmployees] = useState<{ name: string; color: string }[]>([
    { name: '', color: '#9333ea' },
  ]);

  const [hours, setHours] = useState<Record<string, { open: boolean; start: string; end: string }>>(
    Object.fromEntries(DAYS.map((d) => [d.key, { ...DEFAULT_DAY }]))
  );

  // Si ya tiene negocio, redirigir al dashboard del negocio
  useEffect(() => {
    if (!session?.user || business || status !== 'authenticated') return;
    if (session.user.role !== 'BUSINESS_OWNER' && session.user.role) return;
    const check = async () => {
      const res = await fetch('/api/businesses?mine=1', { credentials: 'include' });
      const data = await res.json();
      const businesses = data?.businesses || [];
      if (businesses.length > 0) {
        router.push(`/dashboard/negocio/${businesses[0].slug}`);
      }
    };
    check();
  }, [session?.user, session?.user?.role, business, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  if (session?.user?.role !== 'BUSINESS_OWNER' && session?.user?.role) {
    router.push('/dashboard');
    return null;
  }

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let coverImageUrl = businessForm.coverImage;
      if (businessForm.coverImageFile) {
        const fd = new FormData();
        fd.append('cover', businessForm.coverImageFile);
        const uploadRes = await fetch('/api/upload/logo', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Error al subir imagen');
        coverImageUrl = uploadData.url;
      }
      let logoUrl = businessForm.logo;
      if (businessForm.logoFile) {
        const fd = new FormData();
        fd.append('logo', businessForm.logoFile);
        const uploadRes = await fetch('/api/upload/logo', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Error al subir logo');
        logoUrl = uploadData.url;
      }
      const res = await fetch('/api/onboarding/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...businessForm,
          coverImage: coverImageUrl || undefined,
          coverImageFile: undefined,
          logo: logoUrl || undefined,
          logoFile: undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setBusiness({ id: data.id, slug: data.slug });
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear negocio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = services.filter((s) => s.name.trim() && s.durationMinutes > 0 && s.price >= 0);
    if (valid.length === 0) {
      toast.error('Agregá al menos un servicio');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/onboarding/services?businessId=${business?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services: valid.map((s) => ({
            name: s.name,
            durationMinutes: s.durationMinutes,
            price: Number(s.price),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar servicios');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = employees.filter((e) => e.name.trim());
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/onboarding/employees?businessId=${business?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employees: valid.map((e) => ({ name: e.name, color: e.color || '#9333ea' })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setStep(4);
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar profesionales');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep4 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/onboarding/hours?businessId=${business?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hours),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      toast.success('¡Configuración completada!');
      router.push(`/dashboard/negocio/${business?.slug}`);
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar horarios');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Logo variant="full" size="md" />
          <div className="flex gap-2">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step >= s.id ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s.id}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{STEPS[step - 1].title}</h1>
          <p className="text-gray-600">{STEPS[step - 1].description}</p>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Información del negocio</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep1} className="space-y-4">
                <Input
                  label="Nombre del negocio"
                  value={businessForm.name}
                  onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })}
                  placeholder="Ej: Estética María"
                  required
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={businessForm.description}
                    onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })}
                    placeholder="Describe tu negocio..."
                  />
                </div>
                <Input
                  label="Teléfono"
                  type="tel"
                  value={businessForm.phone}
                  onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })}
                  placeholder="+54 9 11 1234-5678"
                  required
                />
                <Input
                  label="Dirección"
                  value={businessForm.address}
                  onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                  placeholder="Av. Santa Fe 1234"
                  required
                />
                <Input
                  label="Ciudad"
                  value={businessForm.city}
                  onChange={(e) => setBusinessForm({ ...businessForm, city: e.target.value })}
                  placeholder="Buenos Aires"
                  required
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Imagen del negocio (foto principal)
                  </label>
                  <p className="mb-2 text-xs text-gray-500">Se mostrará grande en la página de agenda</p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const preview = URL.createObjectURL(f);
                          setBusinessForm({
                            ...businessForm,
                            coverImageFile: f,
                            coverImage: preview,
                          });
                        }
                      }}
                      className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
                    />
                    {businessForm.coverImage && (
                      <div className="flex items-center gap-2">
                        <img
                          src={businessForm.coverImage}
                          alt="Vista previa"
                          className="h-24 w-32 rounded-lg border object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (businessForm.coverImage.startsWith('blob:')) {
                              URL.revokeObjectURL(businessForm.coverImage);
                            }
                            setBusinessForm({
                              ...businessForm,
                              coverImage: '',
                              coverImageFile: null,
                            });
                          }}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Quitar
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">JPG, PNG, GIF o WebP. Máx. 10 MB.</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Logo (opcional)
                  </label>
                  <p className="mb-2 text-xs text-gray-500">Se mostrará pequeño en el encabezado</p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const preview = URL.createObjectURL(f);
                          setBusinessForm({
                            ...businessForm,
                            logoFile: f,
                            logo: preview,
                          });
                        }
                      }}
                      className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
                    />
                    {businessForm.logo && (
                      <div className="flex items-center gap-2">
                        <img
                          src={businessForm.logo}
                          alt="Vista previa logo"
                          className="h-12 w-12 rounded-lg border object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (businessForm.logo.startsWith('blob:')) {
                              URL.revokeObjectURL(businessForm.logo);
                            }
                            setBusinessForm({
                              ...businessForm,
                              logo: '',
                              logoFile: null,
                            });
                          }}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Quitar
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">JPG, PNG, GIF o WebP. Máx. 10 MB.</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Color primario
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={businessForm.primaryColor}
                      onChange={(e) =>
                        setBusinessForm({ ...businessForm, primaryColor: e.target.value })
                      }
                      className="h-10 w-14 cursor-pointer rounded border"
                    />
                    <Input
                      value={businessForm.primaryColor}
                      onChange={(e) =>
                        setBusinessForm({ ...businessForm, primaryColor: e.target.value })
                      }
                      placeholder="#0ea5e9"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  URL amigable: {businessForm.name ? slugify(businessForm.name) : '—'}
                </p>
                <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
                  Continuar
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Servicios que ofrecés</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep2} className="space-y-4">
                {services.map((s, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="mb-3 flex justify-between">
                      <span className="font-medium">Servicio {i + 1}</span>
                      {services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setServices(services.filter((_, j) => j !== i))}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Input
                        placeholder="Nombre"
                        value={s.name}
                        onChange={(e) => {
                          const next = [...services];
                          next[i] = { ...next[i], name: e.target.value };
                          setServices(next);
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Duración (min)"
                        value={s.durationMinutes || ''}
                        onChange={(e) => {
                          const next = [...services];
                          next[i] = { ...next[i], durationMinutes: parseInt(e.target.value) || 0 };
                          setServices(next);
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Precio"
                        value={s.price || ''}
                        onChange={(e) => {
                          const next = [...services];
                          next[i] = { ...next[i], price: parseFloat(e.target.value) || 0 };
                          setServices(next);
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setServices([...services, { name: '', durationMinutes: 30, price: 0 }])
                  }
                >
                  + Agregar servicio
                </Button>
                <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
                  Continuar
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Profesionales</CardTitle>
              <p className="text-sm text-gray-600">Podés agregar más después</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep3} className="space-y-4">
                {employees.map((emp, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="color"
                      value={emp.color}
                      onChange={(e) => {
                        const next = [...employees];
                        next[i] = { ...next[i], color: e.target.value };
                        setEmployees(next);
                      }}
                      className="h-10 w-12 cursor-pointer rounded border"
                    />
                    <Input
                      className="flex-1"
                      placeholder="Nombre del profesional"
                      value={emp.name}
                      onChange={(e) => {
                        const next = [...employees];
                        next[i] = { ...next[i], name: e.target.value };
                        setEmployees(next);
                      }}
                    />
                    {employees.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setEmployees(employees.filter((_, j) => j !== i))}
                        className="text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEmployees([...employees, { name: '', color: '#9333ea' }])}
                >
                  + Agregar profesional
                </Button>
                <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
                  Continuar
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Horarios de atención</CardTitle>
              <p className="text-sm text-gray-600">Marcá los días y horarios en que atendés</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep4} className="space-y-4">
                {DAYS.map(({ key, label }) => (
                  <div key={key} className="flex flex-wrap items-center gap-4 rounded-lg border p-4">
                    <div className="flex w-28 items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hours[key]?.open}
                        onChange={(e) =>
                          setHours({
                            ...hours,
                            [key]: { ...hours[key], open: e.target.checked },
                          })
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
                            setHours({
                              ...hours,
                              [key]: { ...hours[key], start: e.target.value },
                            })
                          }
                        />
                        <span className="self-center">a</span>
                        <Input
                          type="time"
                          value={hours[key]?.end}
                          onChange={(e) =>
                            setHours({
                              ...hours,
                              [key]: { ...hours[key], end: e.target.value },
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
                <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
                  Finalizar configuración
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
