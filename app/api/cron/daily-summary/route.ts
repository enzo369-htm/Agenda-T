import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendDailySummaryToBusiness } from '@/lib/notifications/email';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const now = new Date();
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(now.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const businesses = await prisma.business.findMany({
      where: { isActive: true },
      include: {
        owner: { select: { email: true } },
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    let sentCount = 0;
    const errors: string[] = [];

    for (const business of businesses) {
      if (!business.owner?.email) continue;

      try {
        const bookings = await prisma.booking.findMany({
          where: {
            businessId: business.id,
            startTime: { gte: tomorrowStart, lte: tomorrowEnd },
          },
          include: {
            service: { select: { name: true } },
            employee: { select: { name: true } },
          },
          orderBy: { startTime: 'asc' },
        });

        if (bookings.length === 0) continue;

        const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length;
        const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
        const cancelledCount = bookings.filter((b) => b.status === 'CANCELLED').length;

        await sendDailySummaryToBusiness({
          businessOwnerEmail: business.owner.email,
          businessName: business.name,
          dashboardUrl: `${baseUrl}/dashboard/negocio/${business.slug}`,
          date: tomorrowStart,
          totalBookings: bookings.length,
          confirmedCount,
          pendingCount,
          cancelledCount,
          bookings: bookings.map((b) => ({
            clientName: b.clientName,
            serviceName: b.service.name,
            startTime: b.startTime,
            status: b.status,
            employeeName: b.employee?.name,
          })),
        });

        await prisma.notification.create({
          data: {
            businessId: business.id,
            channel: 'EMAIL',
            recipient: business.owner.email,
            subject: `Resumen de turnos de mañana - ${business.name}`,
            message: `${bookings.length} turnos para mañana: ${confirmedCount} confirmados, ${pendingCount} pendientes`,
            status: 'SENT',
            sentAt: new Date(),
          },
        });

        sentCount++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Business ${business.id}: ${msg}`);
      }
    }

    return NextResponse.json({
      ok: true,
      businessesProcessed: businesses.length,
      summariesSent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Daily summary cron error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
