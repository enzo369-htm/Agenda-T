import { PrismaClient, UserRole, PlanType, SubscriptionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes (solo en desarrollo)
  if (process.env.NODE_ENV !== 'production') {
    await prisma.notification.deleteMany();
    await prisma.review.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.employeeService.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.service.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.business.deleteMany();
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.auditLog.deleteMany();
    console.log('✅ Datos anteriores eliminados');
  }

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Crear usuarios
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@agendaturnospro.com',
      name: 'Administrador Plataforma',
      passwordHash: hashedPassword,
      role: UserRole.PLATFORM_ADMIN,
      phone: '+5491123456789',
    },
  });

  const owner1 = await prisma.user.create({
    data: {
      email: 'owner@belleza.com',
      name: 'María González',
      passwordHash: hashedPassword,
      role: UserRole.BUSINESS_OWNER,
      phone: '+5491155551111',
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      email: 'owner@barber.com',
      name: 'Carlos Rodríguez',
      passwordHash: hashedPassword,
      role: UserRole.BUSINESS_OWNER,
      phone: '+5491155552222',
    },
  });

  const client1 = await prisma.user.create({
    data: {
      email: 'cliente1@email.com',
      name: 'Ana Martínez',
      passwordHash: hashedPassword,
      role: UserRole.CLIENT,
      phone: '+5491144441111',
    },
  });

  const client2 = await prisma.user.create({
    data: {
      email: 'cliente2@email.com',
      name: 'Juan Pérez',
      passwordHash: hashedPassword,
      role: UserRole.CLIENT,
      phone: '+5491144442222',
    },
  });

  console.log('✅ Usuarios creados');

  // 2. Crear negocios
  const business1 = await prisma.business.create({
    data: {
      ownerId: owner1.id,
      name: 'Belleza & Estilo',
      slug: 'belleza-estilo',
      description:
        'Centro de belleza especializado en cortes, coloración, tratamientos capilares y asesoría de imagen. Atención personalizada en un ambiente moderno y acogedor.',
      category: 'beauty',
      address: 'Av. Santa Fe 1234',
      city: 'Buenos Aires',
      state: 'CABA',
      country: 'Argentina',
      postalCode: '1425',
      latitude: -34.5956,
      longitude: -58.3731,
      phone: '+5491155551111',
      email: 'info@bellezaestilo.com',
      website: 'https://bellezaestilo.com',
      isActive: true,
      isVerified: true,
      timezone: 'America/Argentina/Buenos_Aires',
      openingHours: {
        monday: [{ start: '09:00', end: '19:00' }],
        tuesday: [{ start: '09:00', end: '19:00' }],
        wednesday: [{ start: '09:00', end: '19:00' }],
        thursday: [{ start: '09:00', end: '19:00' }],
        friday: [{ start: '09:00', end: '20:00' }],
        saturday: [{ start: '10:00', end: '18:00' }],
        sunday: [],
      },
      settings: {
        bookingWindow: 30,
        cancellationPolicy: 24,
        requiresPayment: false,
        autoConfirm: true,
        allowCancellation: true,
        reminderHours: [24, 2],
      },
    },
  });

  const business2 = await prisma.business.create({
    data: {
      ownerId: owner2.id,
      name: 'Barbería Classic',
      slug: 'barberia-classic',
      description:
        'Barbería tradicional con servicios de corte, afeitado clásico, arreglo de barba y diseño. Experiencia premium con productos de primera calidad.',
      category: 'barber',
      address: 'Av. Corrientes 5678',
      city: 'Buenos Aires',
      state: 'CABA',
      country: 'Argentina',
      postalCode: '1414',
      latitude: -34.6037,
      longitude: -58.3816,
      phone: '+5491155552222',
      email: 'info@barberiaclassic.com',
      isActive: true,
      isVerified: true,
      timezone: 'America/Argentina/Buenos_Aires',
      openingHours: {
        monday: [{ start: '10:00', end: '20:00' }],
        tuesday: [{ start: '10:00', end: '20:00' }],
        wednesday: [{ start: '10:00', end: '20:00' }],
        thursday: [{ start: '10:00', end: '20:00' }],
        friday: [{ start: '10:00', end: '21:00' }],
        saturday: [{ start: '09:00', end: '19:00' }],
        sunday: [{ start: '10:00', end: '14:00' }],
      },
      settings: {
        bookingWindow: 60,
        cancellationPolicy: 12,
        requiresPayment: false,
        autoConfirm: true,
        allowCancellation: true,
        reminderHours: [24, 1],
      },
    },
  });

  console.log('✅ Negocios creados');

  // 3. Crear suscripciones
  await prisma.subscription.create({
    data: {
      businessId: business1.id,
      planType: PlanType.PROFESSIONAL,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.subscription.create({
    data: {
      businessId: business2.id,
      planType: PlanType.BASIC,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Suscripciones creadas');

  // 4. Crear servicios para Belleza & Estilo
  const service1 = await prisma.service.create({
    data: {
      businessId: business1.id,
      name: 'Corte de Cabello',
      description: 'Corte personalizado según tu estilo y tipo de cabello',
      durationMinutes: 45,
      price: 5000,
      currency: 'ARS',
      color: '#0ea5e9',
      isActive: true,
      order: 1,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      businessId: business1.id,
      name: 'Coloración Completa',
      description: 'Coloración profesional con productos de alta calidad',
      durationMinutes: 120,
      price: 15000,
      currency: 'ARS',
      color: '#a855f7',
      isActive: true,
      order: 2,
    },
  });

  const service3 = await prisma.service.create({
    data: {
      businessId: business1.id,
      name: 'Tratamiento Capilar',
      description: 'Tratamiento intensivo para hidratar y reparar el cabello',
      durationMinutes: 60,
      price: 8000,
      currency: 'ARS',
      color: '#10b981',
      isActive: true,
      order: 3,
    },
  });

  // Servicios para Barbería Classic
  const service4 = await prisma.service.create({
    data: {
      businessId: business2.id,
      name: 'Corte Clásico',
      description: 'Corte de cabello tradicional con tijera y máquina',
      durationMinutes: 30,
      price: 4000,
      currency: 'ARS',
      color: '#f59e0b',
      isActive: true,
      order: 1,
    },
  });

  const service5 = await prisma.service.create({
    data: {
      businessId: business2.id,
      name: 'Afeitado Clásico',
      description: 'Afeitado tradicional con navaja y toalla caliente',
      durationMinutes: 30,
      price: 3500,
      currency: 'ARS',
      color: '#ef4444',
      isActive: true,
      order: 2,
    },
  });

  const service6 = await prisma.service.create({
    data: {
      businessId: business2.id,
      name: 'Corte + Barba',
      description: 'Servicio completo de corte de cabello y arreglo de barba',
      durationMinutes: 45,
      price: 6500,
      currency: 'ARS',
      color: '#8b5cf6',
      isActive: true,
      order: 3,
    },
  });

  console.log('✅ Servicios creados');

  // 5. Crear empleados
  const employee1 = await prisma.employee.create({
    data: {
      businessId: business1.id,
      name: 'Laura Fernández',
      email: 'laura@bellezaestilo.com',
      phone: '+5491166661111',
      color: '#ec4899',
      isActive: true,
      workingHours: {
        monday: [{ start: '09:00', end: '19:00' }],
        tuesday: [{ start: '09:00', end: '19:00' }],
        wednesday: [{ start: '09:00', end: '19:00' }],
        thursday: [{ start: '09:00', end: '19:00' }],
        friday: [{ start: '09:00', end: '20:00' }],
        saturday: [{ start: '10:00', end: '18:00' }],
        sunday: [],
      },
    },
  });

  const employee2 = await prisma.employee.create({
    data: {
      businessId: business1.id,
      name: 'Sofía Ramírez',
      email: 'sofia@bellezaestilo.com',
      phone: '+5491166662222',
      color: '#06b6d4',
      isActive: true,
      workingHours: {
        monday: [{ start: '10:00', end: '19:00' }],
        tuesday: [{ start: '10:00', end: '19:00' }],
        wednesday: [{ start: '10:00', end: '19:00' }],
        thursday: [{ start: '10:00', end: '19:00' }],
        friday: [{ start: '10:00', end: '20:00' }],
        saturday: [{ start: '10:00', end: '18:00' }],
        sunday: [],
      },
    },
  });

  const employee3 = await prisma.employee.create({
    data: {
      businessId: business2.id,
      name: 'Diego Morales',
      email: 'diego@barberiaclassic.com',
      phone: '+5491166663333',
      color: '#14b8a6',
      isActive: true,
      workingHours: {
        monday: [{ start: '10:00', end: '20:00' }],
        tuesday: [{ start: '10:00', end: '20:00' }],
        wednesday: [{ start: '10:00', end: '20:00' }],
        thursday: [{ start: '10:00', end: '20:00' }],
        friday: [{ start: '10:00', end: '21:00' }],
        saturday: [{ start: '09:00', end: '19:00' }],
        sunday: [{ start: '10:00', end: '14:00' }],
      },
    },
  });

  console.log('✅ Empleados creados');

  // 6. Asignar servicios a empleados
  await prisma.employeeService.createMany({
    data: [
      { employeeId: employee1.id, serviceId: service1.id },
      { employeeId: employee1.id, serviceId: service2.id },
      { employeeId: employee1.id, serviceId: service3.id },
      { employeeId: employee2.id, serviceId: service1.id },
      { employeeId: employee2.id, serviceId: service3.id },
      { employeeId: employee3.id, serviceId: service4.id },
      { employeeId: employee3.id, serviceId: service5.id },
      { employeeId: employee3.id, serviceId: service6.id },
    ],
  });

  console.log('✅ Servicios asignados a empleados');

  // 7. Crear algunas reservas de ejemplo
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const booking1 = await prisma.booking.create({
    data: {
      businessId: business1.id,
      serviceId: service1.id,
      employeeId: employee1.id,
      userId: client1.id,
      clientName: client1.name!,
      clientEmail: client1.email,
      clientPhone: client1.phone!,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 45 * 60000),
      totalPrice: service1.price,
      status: 'CONFIRMED',
      paymentStatus: 'COMPLETED',
    },
  });

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(15, 0, 0, 0);

  await prisma.booking.create({
    data: {
      businessId: business2.id,
      serviceId: service6.id,
      employeeId: employee3.id,
      userId: client2.id,
      clientName: client2.name!,
      clientEmail: client2.email,
      clientPhone: client2.phone!,
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 45 * 60000),
      totalPrice: service6.price,
      status: 'CONFIRMED',
      paymentStatus: 'PENDING',
    },
  });

  console.log('✅ Reservas de ejemplo creadas');

  // 8. Crear una reseña
  await prisma.review.create({
    data: {
      bookingId: booking1.id,
      businessId: business1.id,
      userId: client1.id,
      rating: 5,
      comment: '¡Excelente atención! Laura es muy profesional y el resultado fue increíble.',
      isVisible: true,
    },
  });

  console.log('✅ Reseñas creadas');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📋 Usuarios de prueba:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin: admin@agendaturnospro.com | password123');
  console.log('Dueño 1: owner@belleza.com | password123');
  console.log('Dueño 2: owner@barber.com | password123');
  console.log('Cliente 1: cliente1@email.com | password123');
  console.log('Cliente 2: cliente2@email.com | password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

