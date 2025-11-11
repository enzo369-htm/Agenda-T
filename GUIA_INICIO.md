# 🚀 Guía de Inicio Rápido - Agenda Turnos Pro

¡Bienvenido a Agenda Turnos Pro! Esta guía te ayudará a poner en marcha el proyecto en minutos.

## ⚡ Inicio Rápido (5 minutos)

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

Copia el archivo de ejemplo y edítalo con tus credenciales:

```bash
cp .env.example .env
```

**Mínimo requerido para desarrollo:**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agendaturnos"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secret-aleatorio-aqui"
```

**Generar NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

### 4. Levantar base de datos (Docker)

```bash
npm run docker:up
```

Esto levanta:
- PostgreSQL en `localhost:5432`
- Adminer en `localhost:8080` (gestor de BD web)

### 5. Configurar base de datos

```bash
# Generar cliente de Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Cargar datos de ejemplo
npm run db:seed
```

### 6. Iniciar aplicación

```bash
npm run dev
```

¡Listo! La aplicación estará en `http://localhost:3000`

## 👤 Usuarios de Prueba

Después del seed, puedes iniciar sesión con:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@agendaturnospro.com | password123 | Admin |
| owner@belleza.com | password123 | Dueño de Negocio |
| owner@barber.com | password123 | Dueño de Negocio |
| cliente1@email.com | password123 | Cliente |

## 🔧 Configuración Opcional

### Google OAuth (Login con Google)

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear proyecto
3. Habilitar Google+ API
4. Crear credenciales OAuth 2.0
5. Agregar a `.env`:

```env
GOOGLE_CLIENT_ID="tu-client-id"
GOOGLE_CLIENT_SECRET="tu-client-secret"
```

### Stripe (Pagos)

1. Crear cuenta en [Stripe](https://stripe.com)
2. Obtener API keys de test
3. Agregar a `.env`:

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### Resend (Emails)

1. Crear cuenta en [Resend](https://resend.com)
2. Obtener API key
3. Agregar a `.env`:

```env
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@tudominio.com"
```

### Twilio (WhatsApp - Opcional)

1. Crear cuenta en [Twilio](https://twilio.com)
2. Obtener credenciales
3. Agregar a `.env`:

```env
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
```

> **Nota**: Sin Twilio, el sistema genera links de WhatsApp (wa.me) automáticamente.

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Compilar para producción
npm run start            # Iniciar servidor de producción

# Base de datos
npm run db:generate      # Generar cliente Prisma
npm run db:migrate       # Ejecutar migraciones
npm run db:seed          # Cargar datos de ejemplo
npm run db:studio        # Abrir Prisma Studio (UI visual)

# Testing
npm run test             # Tests unitarios
npm run test:e2e         # Tests E2E con Playwright

# Docker
npm run docker:up        # Levantar contenedores
npm run docker:down      # Detener contenedores
npm run docker:logs      # Ver logs

# Calidad de código
npm run lint             # ESLint
npm run type-check       # TypeScript
npm run format           # Prettier
```

## 🌐 Acceder a Servicios

- **Aplicación**: http://localhost:3000
- **Adminer (BD)**: http://localhost:8080
  - Sistema: PostgreSQL
  - Servidor: postgres
  - Usuario: postgres
  - Contraseña: postgres
  - Base de datos: agendaturnos
- **Prisma Studio**: `npm run db:studio` → http://localhost:5555

## 🎯 Primeros Pasos en la Aplicación

### Como Dueño de Negocio

1. Iniciar sesión con `owner@belleza.com`
2. Ir a Dashboard
3. Crear servicios (corte, coloración, etc.)
4. Agregar empleados
5. Ver página pública: `/negocio/belleza-estilo`
6. Compartir link con clientes

### Como Cliente

1. Registrarse o iniciar sesión
2. Buscar negocios en `/negocios`
3. Seleccionar negocio
4. Elegir servicio, fecha y hora
5. Confirmar reserva
6. Recibir email de confirmación

### Como Admin

1. Iniciar sesión con `admin@agendaturnospro.com`
2. Acceder a `/admin`
3. Ver métricas globales
4. Gestionar negocios y usuarios

## 🐛 Solución de Problemas

### Error: Cannot connect to database

**Solución:**

```bash
# Verificar que PostgreSQL esté corriendo
docker ps

# Si no está, levantar contenedores
npm run docker:up

# Verificar conexión
npm run db:studio
```

### Error: Prisma Client not generated

**Solución:**

```bash
npm run db:generate
```

### Error de puerto 3000 en uso

**Solución:**

```bash
# Matar proceso en el puerto
lsof -ti:3000 | xargs kill -9

# O usar otro puerto
PORT=3001 npm run dev
```

### Problemas con migraciones

**Solución (solo desarrollo):**

```bash
# Resetear BD completamente
npm run db:push --force-reset
npm run db:seed
```

## 📚 Estructura del Proyecto

```
APPAGENDATURNOS/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Dashboard protegido
│   ├── negocio/           # Páginas públicas de negocios
│   └── page.tsx           # Homepage
├── components/            # Componentes React
│   ├── ui/               # Componentes UI reutilizables
│   └── layout/           # Header, Footer, etc.
├── lib/                   # Utilidades y configuraciones
│   ├── notifications/    # Servicios de email/WhatsApp
│   ├── validations/      # Schemas de validación
│   └── auth.ts           # Configuración NextAuth
├── prisma/               # Prisma ORM
│   ├── schema.prisma     # Esquema de BD
│   └── seed.ts           # Datos de ejemplo
├── .env                  # Variables de entorno (no commitear)
└── docker-compose.yml    # Configuración Docker
```

## 🚀 Despliegue en Producción

### Vercel (Recomendado)

1. Crear cuenta en [Vercel](https://vercel.com)
2. Conectar repositorio
3. Configurar variables de entorno
4. Deploy automático

### Variables de entorno en producción

No olvides configurar en Vercel:

- `DATABASE_URL` (usar Neon, Supabase, o Railway)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`
- Todas las demás según necesites

## 📖 Recursos Adicionales

- **README.md**: Documentación completa
- **DECISIONS.md**: Decisiones arquitectónicas
- **CONTRIBUTING.md**: Guía de contribución
- **prisma/schema.prisma**: Modelo de datos completo

## 🆘 ¿Necesitas Ayuda?

- Revisar [README.md](./README.md) para documentación completa
- Revisar [DECISIONS.md](./DECISIONS.md) para entender decisiones técnicas
- Abrir un issue en GitHub
- Email: soporte@agendaturnospro.com

---

**¡Éxito con tu implementación!** 🎉

