# 🗓️ Agenda Turnos Pro

Plataforma web completa de agendado de turnos online para peluquerías, barberías, centros estéticos y negocios de servicios. Desarrollada con Next.js 14, TypeScript, Prisma y PostgreSQL.

## 🚀 Características Principales

### Para Clientes
- ✅ Búsqueda y navegación de negocios
- 📅 Reserva de turnos online 24/7
- 💳 Pagos integrados (Stripe/MercadoPago)
- 🔔 Recordatorios automáticos por email y WhatsApp
- 📱 Interfaz responsive mobile-first
- ⭐ Sistema de reseñas y calificaciones

### Para Negocios
- 🏢 Gestión completa de servicios, precios y duraciones
- 👥 Administración de empleados y horarios
- 📊 Dashboard con métricas y analytics
- 💰 Control de reservas e ingresos
- 🔗 Integración con Google Calendar
- 🌐 Página pública personalizable
- 📧 Envío automático de notificaciones
- 💼 Planes de suscripción (Free, Basic, Professional, Enterprise)

### Para Administradores
- 🛠️ Panel de administración de plataforma
- 📈 Métricas globales
- 👔 Gestión de negocios y usuarios

## 📋 Requisitos Previos

- Node.js 18.17.0 o superior
- PostgreSQL 14 o superior
- npm 9.0.0 o superior

## 🔧 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-repositorio>
cd APPAGENDATURNOS
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Database
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/agendaturnos?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secret-aleatorio-aqui"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@tudominio.com"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Configurar base de datos

#### Opción A: Docker (recomendado)

```bash
# Levantar servicios (PostgreSQL + Adminer)
npm run docker:up

# Acceder a Adminer en http://localhost:8080
# Sistema: PostgreSQL
# Servidor: postgres
# Usuario: postgres
# Contraseña: postgres
# Base de datos: agendaturnos
```

#### Opción B: PostgreSQL local

Instala PostgreSQL y crea la base de datos:

```bash
createdb agendaturnos
```

### 5. Ejecutar migraciones y seed

```bash
# Generar cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run migrate

# Cargar datos de ejemplo
npm run db:seed
```

### 6. Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 👤 Usuarios de Prueba

Después de ejecutar el seed, tendrás los siguientes usuarios:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@agendaturnospro.com | password123 | Admin Plataforma |
| owner@belleza.com | password123 | Dueño Negocio |
| owner@barber.com | password123 | Dueño Negocio |
| cliente1@email.com | password123 | Cliente |
| cliente2@email.com | password123 | Cliente |

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Compilar para producción
npm run start            # Iniciar servidor de producción
npm run lint             # Ejecutar linter
npm run format           # Formatear código con Prettier

# Base de datos
npm run migrate          # Ejecutar migraciones
npm run migrate:deploy   # Deploy de migraciones
npm run migrate:reset    # Resetear BD (CUIDADO)
npm run db:push          # Push schema sin migraciones
npm run db:studio        # Abrir Prisma Studio
npm run db:seed          # Cargar datos de ejemplo

# Testing
npm run test             # Ejecutar tests en modo watch
npm run test:ci          # Ejecutar tests en CI
npm run test:e2e         # Ejecutar tests E2E con Playwright
npm run test:e2e:ui      # Tests E2E con UI

# Docker
npm run docker:up        # Levantar contenedores
npm run docker:down      # Detener contenedores
npm run docker:clean     # Limpiar contenedores y volúmenes
```

## 🏗️ Estructura del Proyecto

```
APPAGENDATURNOS/
├── app/                          # App Router de Next.js
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Autenticación
│   │   ├── businesses/           # Endpoints de negocios
│   │   ├── bookings/             # Endpoints de reservas
│   │   └── webhooks/             # Webhooks (Stripe, etc.)
│   ├── auth/                     # Páginas de autenticación
│   ├── dashboard/                # Dashboard del negocio
│   ├── negocio/                  # Páginas públicas de negocios
│   ├── negocios/                 # Búsqueda de negocios
│   ├── layout.tsx                # Layout raíz
│   ├── page.tsx                  # Homepage
│   └── globals.css               # Estilos globales
├── components/                   # Componentes React
│   ├── layout/                   # Header, Footer
│   └── ui/                       # Componentes UI reutilizables
├── lib/                          # Librerías y utilidades
│   ├── notifications/            # Servicios de notificaciones
│   ├── validations/              # Schemas de validación (Zod)
│   ├── auth.ts                   # Configuración NextAuth
│   ├── prisma.ts                 # Cliente Prisma
│   ├── stripe.ts                 # Cliente Stripe
│   └── utils.ts                  # Funciones utilitarias
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             # Schema de la BD
│   └── seed.ts                   # Datos de ejemplo
├── types/                        # Tipos TypeScript
├── .env.example                  # Variables de entorno ejemplo
├── docker-compose.yml            # Configuración Docker
├── Dockerfile                    # Dockerfile de producción
├── next.config.js                # Configuración Next.js
├── tailwind.config.ts            # Configuración Tailwind
└── tsconfig.json                 # Configuración TypeScript
```

## 🗄️ Modelo de Datos

### Modelos Principales

- **User**: Usuarios (clientes, dueños, empleados, admin)
- **Business**: Negocios/comercios
- **Service**: Servicios ofrecidos
- **Employee**: Empleados del negocio
- **Booking**: Reservas/turnos
- **Payment**: Pagos
- **Subscription**: Suscripciones de negocios
- **Review**: Reseñas de clientes
- **Notification**: Notificaciones enviadas

Ver `prisma/schema.prisma` para el esquema completo.

## 🔐 Autenticación

El sistema usa **NextAuth.js** con:
- Credenciales (email/password)
- Google OAuth
- JWT para sesiones
- Roles: CLIENT, BUSINESS_OWNER, EMPLOYEE, PLATFORM_ADMIN

## 💳 Pagos e Integraciones

### Stripe
- Pagos por turno
- Suscripciones mensuales
- Webhooks para eventos

### MercadoPago (Preparado)
- Configuración lista para Argentina/LATAM

### Notificaciones
- **Email**: Resend (recomendado) o SendGrid/Postmark
- **WhatsApp**: Link wa.me o Twilio API

### Google Calendar (Preparado)
- Sincronización bidireccional
- OAuth flow implementado

## 🚀 Despliegue en Producción

### Vercel (Recomendado)

1. Crear proyecto en Vercel
2. Conectar repositorio
3. Configurar variables de entorno
4. Deploy automático en push a `main`

```bash
# Desplegar manualmente
npx vercel
```

### Variables de Entorno Requeridas

Ver `.env.example` para la lista completa. Las esenciales son:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`

### Base de Datos en Producción

Opciones recomendadas:
- **Neon** (PostgreSQL serverless)
- **Supabase**
- **Railway**
- **AWS RDS**

## 🧪 Testing

### Tests Unitarios (Jest)

```bash
npm run test
```

### Tests E2E (Playwright)

```bash
# Ejecutar todos los tests
npm run test:e2e

# Con UI
npm run test:e2e:ui
```

## 📊 Planes y Precios

| Plan | Precio | Reservas/mes | Empleados | Servicios |
|------|--------|--------------|-----------|-----------|
| **Free** | $0 | 50 | 1 | 5 |
| **Basic** | $99 ARS | 200 | 3 | 20 |
| **Professional** | $199 ARS | 1,000 | 10 | 100 |
| **Enterprise** | $399 ARS | Ilimitado | Ilimitado | Ilimitado |

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Autenticación**: NextAuth.js
- **Estilos**: Tailwind CSS
- **Pagos**: Stripe
- **Email**: Resend
- **Testing**: Jest + Playwright
- **Deployment**: Vercel ready
- **Containerización**: Docker + docker-compose

## 🤝 Contribución

Este proyecto está listo para desarrollo continuo. Para contribuir:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Add: nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📝 Decisiones de Diseño

Ver `DECISIONS.md` para detalles sobre las decisiones arquitectónicas tomadas.

## 🐛 Troubleshooting

### Error de conexión a PostgreSQL

Verifica que PostgreSQL esté corriendo:
```bash
docker ps  # Si usas Docker
# o
pg_isready  # PostgreSQL local
```

### Error "Prisma Client no generado"

```bash
npm run prisma:generate
```

### Errores de TypeScript

```bash
npm run type-check
```

### Limpiar y reinstalar

```bash
rm -rf node_modules .next
npm install
npm run build
```

## 📄 Licencia

Este proyecto es de código propietario. Todos los derechos reservados.

## 📧 Soporte

Para dudas o problemas:
- Email: soporte@agendaturnospro.com
- Documentación: [Ver Wiki]

---

**Desarrollado con ❤️ para digitalizar negocios de servicios en Argentina**

