import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/businesses/[slug]/services - Listar servicios del negocio
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const business = await prisma.business.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    const services = await prisma.service.findMany({
      where: { businessId: business.id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Error al obtener servicios' }, { status: 500 });
  }
}

// POST /api/businesses/[slug]/services - Crear servicio
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { slug } = await params;
    const business = await prisma.business.findUnique({
      where: { slug },
    });
    if (!business || business.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'No tenés permiso' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, durationMinutes, price } = body;

    if (!name || !durationMinutes || price === undefined) {
      return NextResponse.json({ error: 'Nombre, duración y precio son requeridos' }, { status: 400 });
    }

    const maxOrder = await prisma.service.aggregate({
      where: { businessId: business.id },
      _max: { order: true },
    });

    const service = await prisma.service.create({
      data: {
        businessId: business.id,
        name,
        description: description || null,
        durationMinutes: Number(durationMinutes),
        price: Number(price),
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Error al crear servicio' }, { status: 500 });
  }
}

// PATCH /api/businesses/[slug]/services - Actualizar servicio
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { slug } = await params;
    const business = await prisma.business.findUnique({
      where: { slug },
    });
    if (!business || business.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'No tenés permiso' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, description, durationMinutes, price, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de servicio requerido' }, { status: 400 });
    }

    const service = await prisma.service.findFirst({
      where: { id, businessId: business.id },
    });
    if (!service) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (durationMinutes !== undefined) updateData.durationMinutes = Number(durationMinutes);
    if (price !== undefined) updateData.price = Number(price);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Error al actualizar servicio' }, { status: 500 });
  }
}

// DELETE /api/businesses/[slug]/services - Eliminar servicio
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { slug } = await params;
    const business = await prisma.business.findUnique({
      where: { slug },
    });
    if (!business || business.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'No tenés permiso' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('id');
    if (!serviceId) {
      return NextResponse.json({ error: 'ID de servicio requerido' }, { status: 400 });
    }

    const service = await prisma.service.findFirst({
      where: { id: serviceId, businessId: business.id },
    });
    if (!service) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
    }

    await prisma.service.delete({ where: { id: serviceId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Error al eliminar servicio' }, { status: 500 });
  }
}
