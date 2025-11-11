import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/businesses/[slug] - Obtener negocio por slug (público)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const business = await prisma.business.findUnique({
      where: {
        slug: params.slug,
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

