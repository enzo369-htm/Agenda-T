import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { onboardingHoursSchema } from '@/lib/validations/onboarding';

export async function PATCH(request: NextRequest) {
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
    const hours = onboardingHoursSchema.parse(body);

    const openingHours: Record<string, { start: string; end: string }[]> = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
    for (const day of days) {
      const d = hours[day];
      openingHours[day] = d.open ? [{ start: d.start, end: d.end }] : [];
    }

    await prisma.business.update({
      where: { id: businessId },
      data: { openingHours },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      const zodError = error as { errors: Array<{ path: string[]; message: string }> };
      const first = zodError.errors[0];
      return NextResponse.json(
        { error: first?.message || 'Datos inválidos' },
        { status: 400 }
      );
    }
    console.error('Onboarding hours error:', error);
    return NextResponse.json(
      { error: 'Error al guardar horarios' },
      { status: 500 }
    );
  }
}
