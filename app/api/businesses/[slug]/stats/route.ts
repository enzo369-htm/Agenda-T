import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/businesses/[slug]/stats - Obtener estadísticas de un negocio
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    // Obtener el negocio
    const business = await prisma.business.findUnique({
      where: { slug: slug },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Negocio no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el usuario sea el dueño del negocio (o admin plataforma)
    if (business.ownerId !== session.user.id && session.user.role !== 'PLATFORM_ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Reservas de hoy
    const todayBookings = await prisma.booking.count({
      where: {
        businessId: business.id,
        startTime: {
          gte: startOfToday,
          lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000),
        },
        status: {
          notIn: ['CANCELLED'],
        },
      },
    });

    // Reservas de esta semana
    const weekBookings = await prisma.booking.count({
      where: {
        businessId: business.id,
        startTime: {
          gte: startOfWeek,
        },
        status: {
          notIn: ['CANCELLED'],
        },
      },
    });

    // Ingresos del mes
    const monthPayments = await prisma.payment.aggregate({
      where: {
        businessId: business.id,
        status: 'COMPLETED',
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Total de servicios
    const totalServices = await prisma.service.count({
      where: {
        businessId: business.id,
        isActive: true,
      },
    });

    // Total de empleados
    const totalEmployees = await prisma.employee.count({
      where: {
        businessId: business.id,
        isActive: true,
      },
    });

    // Reservas pendientes
    const pendingBookings = await prisma.booking.count({
      where: {
        businessId: business.id,
        status: 'PENDING',
      },
    });

    // Reservas confirmadas próximas
    const upcomingBookings = await prisma.booking.count({
      where: {
        businessId: business.id,
        status: 'CONFIRMED',
        startTime: {
          gte: startOfToday,
        },
      },
    });

    return NextResponse.json({
      todayBookings,
      weekBookings,
      monthRevenue: monthPayments._sum.amount || 0,
      totalServices,
      totalEmployees,
      pendingBookings,
      upcomingBookings,
    });
  } catch (error) {
    console.error('Error fetching business stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}





