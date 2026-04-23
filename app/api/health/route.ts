import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$connect();
    return NextResponse.json({ ok: true, database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { ok: false, database: 'error', error: message },
      { status: 503 }
    );
  }
}
