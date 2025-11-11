'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { slugify } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function NewBusinessPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'beauty',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
  });

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: slugify(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear negocio');
      }

      toast.success('¡Negocio creado exitosamente!');
      router.push(`/dashboard/negocio/${data.slug}`);
    } catch (error: any) {
      toast.error(error.message || 'Error al crear negocio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Crear Negocio</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Información del Negocio</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nombre del negocio"
                  type="text"
                  placeholder="Ej: Belleza & Estilo"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />

                <Input
                  label="URL amigable (slug)"
                  type="text"
                  placeholder="belleza-estilo"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                  required
                />

                <div>
                  <label className="label">Descripción</label>
                  <textarea
                    className="input"
                    rows={4}
                    placeholder="Describe tu negocio..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Categoría</label>
                  <select
                    className="input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="beauty">Peluquería / Belleza</option>
                    <option value="barber">Barbería</option>
                    <option value="spa">Spa / Estética</option>
                    <option value="nails">Manicura / Pedicura</option>
                    <option value="massage">Masajes</option>
                  </select>
                </div>

                <Input
                  label="Dirección"
                  type="text"
                  placeholder="Av. Santa Fe 1234"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Ciudad"
                    type="text"
                    placeholder="Buenos Aires"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />

                  <Input
                    label="Provincia/Estado"
                    type="text"
                    placeholder="CABA"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Código Postal"
                    type="text"
                    placeholder="1425"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  />

                  <Input
                    label="Teléfono"
                    type="tel"
                    placeholder="+54 9 11 1234-5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <Input
                  label="Email (opcional)"
                  type="email"
                  placeholder="info@tunegocio.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    isLoading={isSubmitting}
                  >
                    Crear Negocio
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

