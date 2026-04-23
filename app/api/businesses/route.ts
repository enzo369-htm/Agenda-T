import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ZodError } from 'zod';
import { businessSchema } from '@/lib/validations/business';

// GET /api/businesses - Listar negocios (público) o ?mine=1 para solo los del usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mine = searchParams.get('mine') === '1';
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    // Si ?mine=1 y hay sesión, filtrar solo negocios del usuario
    if (mine) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ businesses: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } });
      }
      where.ownerId = session.user.id;
    }

    if (category) {
      where.category = category;
    }

    if (city) {
      where.city = city;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        include: {
          _count: {
            select: {
              reviews: true,
              bookings: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.business.count({ where }),
    ]);

    return NextResponse.json({
      businesses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    const message = error instanceof Error ? error.message : 'Error al obtener negocios';
    return NextResponse.json(
      { error: 'Error al obtener negocios', details: process.env.NODE_ENV === 'development' ? message : undefined },
      { status: 500 }
    );
  }
}

// POST /api/businesses - Crear negocio (requiere autenticación)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = businessSchema.parse(body);

    // Verificar que el slug no exista
    const existingBusiness = await prisma.business.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingBusiness) {
      return NextResponse.json(
        { error: 'El slug ya está en uso' },
        { status: 400 }
      );
    }

    // Crear negocio (excluir openingHours/settings si vienen vacíos para evitar errores de Prisma)
    const { openingHours, settings, ...rest } = validatedData;
    const business = await prisma.business.create({
      data: {
        ...rest,
        ownerId: session.user.id,
      },
    });

    // Crear suscripción FREE por defecto
    await prisma.subscription.create({
      data: {
        businessId: business.id,
        planType: 'FREE',
        status: 'TRIAL',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 días de prueba
      },
    });

    return NextResponse.json(business, { status: 201 });
  } catch (error) {
    console.error('Error creating business:', error);

    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      const field = firstError?.path?.join('.') || 'campo';
      const message = firstError?.message || 'Datos inválidos';
      return NextResponse.json(
        { error: `${field}: ${message}`, details: error.errors },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Error al crear negocio';
    return NextResponse.json(
      {
        error: 'Error al crear negocio',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500 }
    );
  }
}

