'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  city: string;
  address: string;
  _count: {
    reviews: number;
    bookings: number;
  };
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchBusinesses();
  }, [search, category]);

  const fetchBusinesses = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const response = await fetch(`/api/businesses?${params.toString()}`);
      const data = await response.json();
      setBusinesses(data.businesses || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="mb-4 text-3xl font-bold text-gray-900">Buscar Negocios</h1>
            <p className="text-lg text-gray-600">
              Encuentra peluquerías, barberías y centros estéticos cerca de ti
            </p>
          </div>

          {/* Filtros */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              <option value="beauty">Peluquería / Belleza</option>
              <option value="barber">Barbería</option>
              <option value="spa">Spa / Estética</option>
              <option value="nails">Manicura / Pedicura</option>
              <option value="massage">Masajes</option>
            </select>
          </div>

          {/* Lista de negocios */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-lg bg-white" />
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <Card>
              <div className="py-12 text-center">
                <p className="text-gray-500">No se encontraron negocios</p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business) => (
                <Link key={business.id} href={`/negocio/${business.slug}`}>
                  <Card className="h-full transition-shadow hover:shadow-lg">
                    <div className="mb-4">
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">{business.name}</h3>
                        <Badge variant="primary">
                          {business.category === 'beauty' && '💇'}
                          {business.category === 'barber' && '💈'}
                          {business.category === 'spa' && '🧖'}
                          {business.category === 'nails' && '💅'}
                          {business.category === 'massage' && '💆'}
                        </Badge>
                      </div>
                      <p className="mb-2 text-sm text-gray-600 line-clamp-2">
                        {business.description}
                      </p>
                      <p className="text-sm text-gray-500">📍 {business.city}</p>
                    </div>

                    <div className="flex items-center justify-between border-t pt-4 text-sm text-gray-600">
                      <span>⭐ {business._count.reviews} reseñas</span>
                      <span className="font-medium text-primary-600">
                        Ver disponibilidad →
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

