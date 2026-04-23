import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ZodError } from 'zod';
import { onboardingBusinessSchema } from '@/lib/validations/onboarding';
import { slugify } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validated = onboardingBusinessSchema.parse(body);

    const slug = slugify(validated.name);
    const existing = await prisma.business.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un negocio con ese nombre. Probá con otro.' },
        { status: 400 }
      );
    }

    const business = await prisma.business.create({
      data: {
        ownerId: session.user.id,
        name: validated.name,
        slug,
        description: validated.description ?? null,
        phone: validated.phone,
        address: validated.address,
        city: validated.city,
        state: 'Buenos Aires',
        country: 'Argentina',
        coverImage: validated.coverImage ?? null,
        logo: validated.logo ?? null,
        settings: { primaryColor: validated.primaryColor },
      },
    });

    await prisma.subscription.create({
      data: {
        businessId: business.id,
        planType: 'FREE',
        status: 'TRIAL',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json(business, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const first = error.errors[0];
      return NextResponse.json(
        { error: first?.message || 'Datos inválidos' },
        { status: 400 }
      );
    }
    console.error('Onboarding business error:', error);
    return NextResponse.json(
      { error: 'Error al crear negocio' },
      { status: 500 }
    );
  }
}
