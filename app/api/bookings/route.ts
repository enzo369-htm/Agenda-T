import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bookingSchema } from '@/lib/validations/booking';
import { sendBookingConfirmationEmail, sendNewBookingNotificationToBusiness } from '@/lib/notifications/email';
import { sendBookingConfirmationWhatsApp } from '@/lib/notifications/whatsapp';

// POST /api/bookings - Crear reserva
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const validatedData = bookingSchema.parse(body);
    const clientName = validatedData.clientName ?? 'Sin nombre';
    const clientEmail = validatedData.clientEmail ?? '';
    const clientPhone = validatedData.clientPhone ?? '';

    // Obtener servicio y negocio
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
      include: {
        business: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      );
    }

    // Calcular tiempo de fin
    const startTime = new Date(validatedData.startTime);
    const endTime = new Date(startTime.getTime() + service.durationMinutes * 60000);

    // Verificar disponibilidad
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        businessId: service.businessId,
        employeeId: validatedData.employeeId,
        status: {
          notIn: ['CANCELLED'],
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
        ],
      },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'El horario seleccionado no está disponible' },
        { status: 400 }
      );
    }

    // Obtener información del dueño del negocio
    const businessWithOwner = await prisma.business.findUnique({
      where: { id: service.businessId },
      include: {
        owner: {
          select: {
            email: true,
          },
        },
      },
    });

    // Crear reserva
    const booking = await prisma.booking.create({
      data: {
        businessId: service.businessId,
        serviceId: service.id,
        employeeId: validatedData.employeeId,
        userId: session?.user?.id,
        clientName,
        clientEmail,
        clientPhone,
        startTime,
        endTime,
        notes: validatedData.notes,
        totalPrice: service.price,
        currency: service.currency,
        status: 'CONFIRMED',
        paymentStatus: 'PENDING',
      },
      include: {
        service: true,
        employee: true,
        business: true,
      },
    });

    // Crear pago pendiente
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        businessId: service.businessId,
        amount: service.price,
        currency: service.currency,
        provider: 'CASH',
        status: 'PENDING',
      },
    });

    // Enviar confirmación por email
    if (booking.clientEmail) {
      try {
        await sendBookingConfirmationEmail({
          bookingId: booking.id,
          clientName: booking.clientName,
          clientEmail: booking.clientEmail,
          businessName: booking.business.name,
          serviceName: booking.service.name,
          startTime: booking.startTime,
          endTime: booking.endTime,
          price: booking.totalPrice,
          employeeName: booking.employee?.name,
          businessAddress: booking.business.address,
          businessPhone: booking.business.phone,
          notes: booking.notes || undefined,
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }
    }

    // Generar link de WhatsApp para confirmación
    if (booking.clientPhone) {
      try {
        await sendBookingConfirmationWhatsApp({
          phone: booking.clientPhone,
          clientName: booking.clientName,
          businessName: booking.business.name,
          serviceName: booking.service.name,
          startTime: booking.startTime,
          price: booking.totalPrice,
          employeeName: booking.employee?.name,
          businessAddress: booking.business.address,
        });
      } catch (whatsappError) {
        console.error('Error sending WhatsApp:', whatsappError);
      }
    }

    // Enviar notificación al negocio
    if (businessWithOwner?.owner?.email) {
      try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        await sendNewBookingNotificationToBusiness({
          bookingId: booking.id,
          businessOwnerEmail: businessWithOwner.owner.email,
          businessName: booking.business.name,
          clientName: booking.clientName,
          clientEmail: booking.clientEmail,
          clientPhone: booking.clientPhone,
          serviceName: booking.service.name,
          startTime: booking.startTime,
          endTime: booking.endTime,
          price: booking.totalPrice,
          employeeName: booking.employee?.name,
          notes: booking.notes || undefined,
          dashboardUrl: `${baseUrl}/dashboard/negocio/${booking.business.slug}`,
        });
      } catch (businessEmailError) {
        console.error('Error sending business notification email:', businessEmailError);
      }
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear reserva' },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings - Actualizar estado de una reserva
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, status } = body;

    if (!bookingId || !status) {
      return NextResponse.json({ error: 'bookingId y status son requeridos' }, { status: 400 });
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { business: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
    }

    if (booking.business.ownerId !== session.user.id && session.user.role !== 'PLATFORM_ADMIN') {
      return NextResponse.json({ error: 'No tenés permiso' }, { status: 403 });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: { service: true, employee: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Error al actualizar reserva' }, { status: 500 });
  }
}

// GET /api/bookings - Obtener reservas del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: true,
        employee: true,
        business: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Error al obtener reservas' },
      { status: 500 }
    );
  }
}

