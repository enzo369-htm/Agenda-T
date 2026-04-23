import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ZodError } from 'zod';
import { onboardingServicesSchema } from '@/lib/validations/onboarding';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    if (!businessId) {
      return NextResponse.json({ error: 'businessId requerido' }, { status: 400 });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business || business.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { services } = onboardingServicesSchema.parse(body);

    const created = await prisma.service.createMany({
      data: services.map((s, i) => ({
        businessId,
        name: s.name,
        durationMinutes: s.durationMinutes,
        price: s.price,
        order: i,
      })),
    });

    return NextResponse.json({ count: created.count }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const first = error.errors[0];
      return NextResponse.json(
        { error: first?.message || 'Datos inválidos' },
        { status: 400 }
      );
    }
    console.error('Onboarding services error:', error);
    return NextResponse.json(
      { error: 'Error al crear servicios' },
      { status: 500 }
    );
  }
}
