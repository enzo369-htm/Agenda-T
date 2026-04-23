import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBookingReminderWithConfirmation } from '@/lib/notifications/email';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const now = new Date();
    const from = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const to = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const bookings = await prisma.booking.findMany({
      where: {
        reminderSent: false,
        status: { notIn: ['CANCELLED'] },
        startTime: { gte: from, lte: to },
        clientEmail: { not: '' },
      },
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

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    let sentCount = 0;
    const errors: string[] = [];

    for (const booking of bookings) {
      try {
        const token = randomUUID();

        await prisma.booking.update({
          where: { id: booking.id },
          data: { confirmationToken: token, reminderSent: true },
        });

        const confirmUrl = `${baseUrl}/confirmar/${token}?action=confirm`;
        const cancelUrl = `${baseUrl}/confirmar/${token}?action=cancel`;

        const result = await sendBookingReminderWithConfirmation({
          bookingId: booking.id,
          clientName: booking.clientName,
          clientEmail: booking.clientEmail,
          businessName: booking.business.name,
          serviceName: booking.service.name,
          startTime: booking.startTime,
          endTime: booking.endTime,
          price: booking.totalPrice,
          confirmUrl,
          cancelUrl,
          employeeName: booking.employee?.name,
          businessAddress: booking.business.address || undefined,
          businessPhone: booking.business.phone || undefined,
        });

        if (result.success) {
          await prisma.notification.create({
            data: {
              bookingId: booking.id,
              businessId: booking.businessId,
              channel: 'EMAIL',
              recipient: booking.clientEmail,
              subject: `Recordatorio de turno en ${booking.business.name}`,
              message: `Recordatorio enviado para ${booking.service.name} el ${booking.startTime.toISOString()}`,
              status: 'SENT',
              sentAt: new Date(),
            },
          });
          sentCount++;
        } else {
          errors.push(`Booking ${booking.id}: email send failed`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Booking ${booking.id}: ${msg}`);
      }
    }

    return NextResponse.json({
      ok: true,
      found: bookings.length,
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Cron reminders error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
