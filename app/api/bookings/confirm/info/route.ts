import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { confirmationToken: token },
      include: {
        service: { select: { name: true, durationMinutes: true, price: true } },
        employee: { select: { name: true } },
        business: { select: { name: true, address: true, phone: true, slug: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        clientName: booking.clientName,
        serviceName: booking.service.name,
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
        status: booking.status,
        price: booking.totalPrice,
        employeeName: booking.employee?.name || null,
        businessName: booking.business.name,
        businessAddress: booking.business.address,
        businessPhone: booking.business.phone,
        businessSlug: booking.business.slug,
      },
    });
  } catch (error) {
    console.error('Confirm info error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
