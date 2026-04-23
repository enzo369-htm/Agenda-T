import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ZodError } from 'zod';
import { businessUpdateSchema } from '@/lib/validations/business';
import { slugify } from '@/lib/utils';

// GET /api/businesses/[slug] - Obtener negocio por slug (público)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const business = await prisma.business.findUnique({
      where: {
        slug: slug,
        isActive: true,
      },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        employees: {
          where: { isActive: true },
          include: {
            employeeServices: {
              include: {
                service: true,
              },
            },
          },
        },
        reviews: {
          where: { isVisible: true },
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
            bookings: true,
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Negocio no encontrado' },
        { status: 404 }
      );
    }

    // Calcular rating promedio
    const reviews = await prisma.review.findMany({
      where: {
        businessId: business.id,
        isVisible: true,
      },
      select: {
        rating: true,
      },
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      ...business,
      averageRating: Math.round(averageRating * 10) / 10,
    });
  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { error: 'Error al obtener negocio' },
      { status: 500 }
    );
  }
}

// PATCH /api/businesses/[slug] - Actualizar negocio (solo owner)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { slug } = await params;
    const business = await prisma.business.findUnique({
      where: { slug },
    });

    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    if (business.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'No tenés permiso para editar este negocio' }, { status: 403 });
    }

    const body = await request.json();
    const validated = businessUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = {};

    if (validated.name !== undefined) {
      const newSlug = slugify(validated.name);
      if (newSlug !== slug) {
        const existing = await prisma.business.findUnique({ where: { slug: newSlug } });
        if (existing) {
          return NextResponse.json(
            { error: 'Ya existe un negocio con ese nombre' },
            { status: 400 }
          );
        }
        updateData.slug = newSlug;
      }
      updateData.name = validated.name;
    }
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.phone !== undefined) updateData.phone = validated.phone;
    if (validated.address !== undefined) updateData.address = validated.address;
    if (validated.city !== undefined) updateData.city = validated.city;
    if (validated.coverImage !== undefined) updateData.coverImage = validated.coverImage;
    if (validated.logo !== undefined) updateData.logo = validated.logo;
    if (validated.primaryColor !== undefined) {
      const settings = (business.settings as Record<string, unknown>) || {};
      updateData.settings = { ...settings, primaryColor: validated.primaryColor };
    }
    if (validated.openingHours !== undefined) {
      const hours = validated.openingHours as Record<string, { open?: boolean; start?: string; end?: string }>;
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
      const isDaySchedule = (d: unknown): d is { open: boolean; start?: string; end?: string } => {
        if (d === null || typeof d !== 'object') return false;
        return 'open' in d && typeof (d as { open: unknown }).open === 'boolean';
      };
      const transformed: Record<string, { start: string; end: string }[]> = {};
      for (const day of days) {
        const d = hours[day];
        if (isDaySchedule(d) && d.open) {
          transformed[day] = [{ start: d.start || '09:00', end: d.end || '18:00' }];
        } else {
          transformed[day] = [];
        }
      }
      updateData.openingHours = transformed;
    }

    const updated = await prisma.business.update({
      where: { id: business.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      const first = error.errors[0];
      return NextResponse.json(
        { error: first?.message || 'Datos inválidos' },
        { status: 400 }
      );
    }
    console.error('Error updating business:', error);
    return NextResponse.json(
      { error: 'Error al actualizar negocio' },
      { status: 500 }
    );
  }
}

