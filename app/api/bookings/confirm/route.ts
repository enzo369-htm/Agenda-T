import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  sendClientActionNotificationToBusiness,
  sendBookingCancellationEmail,
} from '@/lib/notifications/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action } = body;

    if (!token || !action || !['confirm', 'cancel'].includes(action)) {
      return NextResponse.json(
        { error: 'Token y acción (confirm/cancel) son requeridos' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { confirmationToken: token },
      include: {
        service: true,
        employee: true,
        business: {
          include: {
            owner: { select: { email: true } },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Token inválido o reserva no encontrada' },
        { status: 404 }
      );
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Esta reserva ya fue cancelada', booking: { status: 'CANCELLED' } },
        { status: 400 }
      );
    }

    if (new Date() > booking.startTime) {
      return NextResponse.json(
        { error: 'Este turno ya pasó' },
        { status: 400 }
      );
    }

    const newStatus = action === 'confirm' ? 'CONFIRMED' : 'CANCELLED';

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: newStatus },
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Notify business owner
    if (booking.business.owner?.email) {
      await sendClientActionNotificationToBusiness({
        businessOwnerEmail: booking.business.owner.email,
        businessName: booking.business.name,
        clientName: booking.clientName,
        serviceName: booking.service.name,
        startTime: booking.startTime,
        action: action === 'confirm' ? 'confirmed' : 'cancelled',
        dashboardUrl: `${baseUrl}/dashboard/negocio/${booking.business.slug}`,
      });
    }

    // If cancelled, also notify the client
    if (action === 'cancel') {
      await sendBookingCancellationEmail({
        bookingId: booking.id,
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        businessName: booking.business.name,
        serviceName: booking.service.name,
        startTime: booking.startTime,
        endTime: booking.endTime,
        price: booking.totalPrice,
        employeeName: booking.employee?.name,
        businessAddress: booking.business.address || undefined,
        businessPhone: booking.business.phone || undefined,
      });
    }

    await prisma.notification.create({
      data: {
        bookingId: booking.id,
        businessId: booking.businessId,
        channel: 'EMAIL',
        recipient: booking.business.owner?.email || '',
        subject: action === 'confirm'
          ? `${booking.clientName} confirmó su turno`
          : `${booking.clientName} canceló su turno`,
        message: `Cliente ${action === 'confirm' ? 'confirmó' : 'canceló'} turno de ${booking.service.name}`,
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      action,
      status: newStatus,
      booking: {
        id: updated.id,
        clientName: booking.clientName,
        serviceName: booking.service.name,
        startTime: booking.startTime,
        businessName: booking.business.name,
      },
    });
  } catch (error) {
    console.error('Booking confirm error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la confirmación' },
      { status: 500 }
    );
  }
}
