import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma, checkDatabaseConnection } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth';

export async function POST(request: NextRequest) {
  try {
    // Verificar conexión a la base de datos
    const dbCheck = await checkDatabaseConnection();
    if (!dbCheck.connected) {
      return NextResponse.json(
        { 
          error: 'Error de conexión a la base de datos. Por favor, verifica que la base de datos esté configurada correctamente.',
          details: dbCheck.error
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
        phone: validatedData.phone,
        // Forzamos BUSINESS_OWNER: esta app no registra clientes.
        role: validatedData.role ?? 'BUSINESS_OWNER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Usuario registrado exitosamente',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en registro:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}

