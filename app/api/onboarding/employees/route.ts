import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ZodError } from 'zod';
import { onboardingEmployeesSchema } from '@/lib/validations/onboarding';

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
    const { employees } = onboardingEmployeesSchema.parse(body);

    if (employees.length === 0) {
      return NextResponse.json({ count: 0 }, { status: 201 });
    }

    const created = await prisma.employee.createMany({
      data: employees.map((e) => ({
        businessId,
        name: e.name,
        color: e.color,
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
    console.error('Onboarding employees error:', error);
    return NextResponse.json(
      { error: 'Error al crear empleados' },
      { status: 500 }
    );
  }
}
