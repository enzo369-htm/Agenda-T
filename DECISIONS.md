# Decisiones de Diseño y Arquitectura

Este documento explica las decisiones técnicas clave tomadas en el desarrollo de **Agenda Turnos Pro** y las razones detrás de ellas.

## 📚 Stack Tecnológico

### Next.js 14 con App Router

**Decisión**: Usar Next.js 14 con App Router en lugar de Pages Router.

**Razones**:
- **Server Components**: Mejor performance y SEO por defecto
- **Streaming**: Mejora la experiencia de usuario con loading states
- **Route Handlers**: API routes más modernas y flexibles
- **Layouts anidados**: Mejor organización de código
- **Future-proof**: Es la dirección oficial de Next.js

**Trade-offs**:
- Curva de aprendizaje más pronunciada
- Menos ejemplos en la comunidad (aunque está mejorando)
- Necesita entender Server vs Client Components

### TypeScript

**Decisión**: TypeScript en modo estricto.

**Razones**:
- **Type Safety**: Reduce bugs en producción
- **Mejor DX**: Autocompletado e IntelliSense
- **Refactoring**: Más seguro hacer cambios grandes
- **Documentación**: Los tipos sirven como documentación

**Trade-offs**:
- Desarrollo inicial más lento
- Requiere definir tipos y interfaces

### Prisma ORM

**Decisión**: Prisma sobre otras ORMs (TypeORM, Sequelize, Drizzle).

**Razones**:
- **Type-safe**: Generación automática de tipos
- **Migrations**: Sistema robusto de migraciones
- **Prisma Studio**: UI visual para explorar datos
- **Developer Experience**: Excelente autocompletado
- **Relaciones**: Manejo intuitivo de relaciones complejas

**Trade-offs**:
- Más pesado que alternativas como Drizzle
- Genera un cliente que aumenta el bundle
- Menos control sobre queries complejas

### PostgreSQL

**Decisión**: PostgreSQL sobre MySQL o MongoDB.

**Razones**:
- **Robustez**: Excelente para datos relacionales
- **JSONB**: Soporte nativo para datos JSON cuando es necesario
- **Escalabilidad**: Maneja bien grandes volúmenes
- **Herramientas**: Excelente ecosistema (pgAdmin, Neon, Supabase)
- **Transacciones**: ACID compliance para pagos y reservas

**Trade-offs**:
- Más pesado que SQLite
- Requiere servidor dedicado

## 🔐 Autenticación

### NextAuth.js v4

**Decisión**: NextAuth.js sobre Auth0, Clerk, o solución custom.

**Razones**:
- **Open Source**: Sin costos por usuario
- **Flexible**: Múltiples providers (credentials, Google, etc.)
- **Session Management**: JWT o database sessions
- **Prisma Adapter**: Integración nativa
- **Self-hosted**: Control total sobre datos

**Trade-offs**:
- Configuración manual más extensa
- Sin UI pre-construida como Clerk
- Requiere mantener la seguridad

**Alternativas Consideradas**:
- **Clerk**: Muy buena UX pero costo por usuario
- **Auth0**: Enterprise pero complejo para MVP
- **Custom**: Más trabajo y riesgo de seguridad

## 💳 Pagos

### Stripe

**Decisión**: Stripe como proveedor principal de pagos.

**Razones**:
- **Documentación**: Excelente docs y ejemplos
- **Stripe Checkout**: Hosted flow seguro
- **Subscriptions**: Manejo nativo de suscripciones
- **Webhooks**: Sistema robusto de eventos
- **Testing**: Modo test completo

**Preparación para MercadoPago**:
- Estructura preparada para múltiples providers
- Importante para Argentina/LATAM
- Requiere menos configuración inicial

## 🎨 Estilos

### Tailwind CSS

**Decisión**: Tailwind sobre CSS Modules, Styled Components, o CSS-in-JS.

**Razones**:
- **Utility-first**: Desarrollo rápido
- **Bundle pequeño**: PurgeCSS elimina clases no usadas
- **Responsive**: Breakpoints integrados
- **Dark mode**: Soporte nativo
- **Customización**: Fácil extender

**Trade-offs**:
- HTML "verboso" con muchas clases
- Curva de aprendizaje inicial
- Requiere disciplina para mantener consistencia

## 📧 Notificaciones

### Email: Resend

**Decisión**: Resend sobre SendGrid, Postmark, o Mailgun.

**Razones**:
- **DX**: API moderna y simple
- **React Email**: Componentes React para emails
- **Pricing**: Generoso plan gratuito
- **Performance**: Rápido y confiable

**Alternativas**:
- SendGrid: Más establecido pero API compleja
- Postmark: Excelente deliverability pero más caro
- Mailgun: Bueno pero menos moderno

### WhatsApp: Link wa.me

**Decisión**: Links de WhatsApp sobre Twilio API inicialmente.

**Razones**:
- **Sin costos**: No requiere cuenta Twilio
- **Simple**: Solo generar un link
- **Flexibilidad**: Usuario elige enviar o no

**Preparado para Twilio**:
- Estructura lista para integrar API
- Necesario para envío automatizado
- Requiere cuenta Business y aprobación

## 🗃️ Gestión de Estado

### Zustand

**Decisión**: Zustand sobre Redux, Context API, o Jotai.

**Razones**:
- **Simple**: API minimalista
- **Performance**: Re-renders optimizados
- **TypeScript**: Excelente soporte
- **Bundle**: Muy liviano (~1kb)

**Uso limitado**:
- Preferimos Server State (fetch en Server Components)
- Zustand solo para UI state complejo
- React Context para estado simple

## 📊 Arquitectura de Datos

### Modelo de Datos

**Decisión**: Normalización con JSON para configuraciones.

**Razones**:
- **Horarios**: JSON para `openingHours` y `workingHours`
  - Flexible para horarios complejos
  - No requiere tabla separada
  - Fácil de actualizar
  
- **Settings**: JSON para configuraciones de negocio
  - Permite añadir campos sin migraciones
  - Cada negocio puede tener configs únicas

**Trade-offs**:
- Queries más complejas sobre campos JSON
- Requiere validación en aplicación

### Enums vs Strings

**Decisión**: Enums de Prisma para estados.

**Razones**:
- **Type Safety**: TypeScript conoce los valores
- **Validación**: Base de datos valida valores
- **Autocompletado**: Mejor DX

**Campos con Enum**:
- `UserRole`
- `BookingStatus`
- `PaymentStatus`
- `NotificationStatus`

## 🔄 API Design

### REST sobre GraphQL

**Decisión**: API REST con Route Handlers.

**Razones**:
- **Simplicidad**: Más fácil de entender y mantener
- **Cacheable**: Mejor soporte de cache en Next.js
- **Tooling**: Más herramientas disponibles
- **MVP friendly**: Desarrollo más rápido

**Trade-offs**:
- Más endpoints
- Posible over-fetching
- Sin type-safety en frontend (se podría añadir tRPC)

**Consideración futura**: tRPC para type-safety end-to-end.

## 📱 Responsive Design

### Mobile-First

**Decisión**: Diseño mobile-first con Tailwind breakpoints.

**Razones**:
- **Uso real**: Mayoría de usuarios en móvil
- **Progressive Enhancement**: Mejor UX
- **Performance**: Carga rápida en móviles

**Breakpoints**:
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

## 🧪 Testing

### Jest + Playwright

**Decisión**: Jest para unitarios, Playwright para E2E.

**Razones**:
- **Jest**: Estándar de facto para React
- **Playwright**: Mejor que Cypress para Next.js
- **Coverage**: Ambos proveen buenos reportes

**Cobertura objetivo**:
- Unitarios: Funciones críticas (validaciones, utils)
- E2E: Flujos principales (signup, booking, pago)

## 🐳 DevOps

### Docker Compose

**Decisión**: Docker Compose para desarrollo local.

**Razones**:
- **Consistencia**: Mismo entorno para todos
- **Aislamiento**: No contamina sistema local
- **Servicios**: PostgreSQL + Adminer listos

**Producción**:
- Next.js: Vercel (optimizado para Next.js)
- Database: Neon, Supabase, o Railway
- File Storage: Vercel Blob o S3

## 🔒 Seguridad

### Medidas Implementadas

1. **Passwords**: Bcrypt con salt rounds = 10
2. **Sessions**: JWT con secret rotable
3. **Validación**: Zod en todos los inputs
4. **CORS**: Configurado en API routes
5. **Rate Limiting**: Preparado para implementar
6. **SQL Injection**: Protegido por Prisma

### Pendientes para Producción

- Rate limiting en endpoints
- CSRF tokens
- Helmet.js headers
- IP whitelisting para admin
- Logging y monitoring

## 📈 Escalabilidad

### Decisiones para Escalar

**Actual (MVP)**:
- Monolito en Vercel
- Database única
- Session en JWT

**Futuro (Scale)**:
- Separar API de Frontend
- Database replication (read replicas)
- Redis para cache y sessions
- CDN para assets estáticos
- Background jobs (inngest, BullMQ)

## 🎯 Próximos Pasos

### Features Faltantes

1. **PWA**: Service workers y manifest
2. **Push Notifications**: Web Push API
3. **Google Calendar**: OAuth flow completo
4. **Búsqueda avanzada**: Elasticsearch
5. **Multi-idioma**: i18n completo
6. **Analytics**: Posthog o Mixpanel
7. **Chat**: Sistema de mensajería
8. **Reviews**: Moderación automática

### Mejoras Técnicas

1. **Caching**: React Query o SWR
2. **Optimistic Updates**: Mejor UX
3. **Error Boundary**: Mejor manejo de errores
4. **Logging**: Sentry o LogRocket
5. **Monitoring**: Vercel Analytics + custom
6. **CI/CD**: GitHub Actions completo

## 🤔 Decisiones Pendientes

### A Definir

- **File Upload**: ¿Vercel Blob, S3, Cloudinary?
- **Email Templates**: ¿MJML, React Email, custom?
- **Real-time**: ¿WebSockets, Pusher, Ably?
- **Search**: ¿Postgres FTS, Algolia, Meilisearch?

## 📝 Conclusión

Estas decisiones priorizan:
1. **Velocidad de desarrollo** (MVP rápido)
2. **Developer Experience** (herramientas modernas)
3. **Escalabilidad futura** (arquitectura sólida)
4. **Costos bajos** (open source cuando es posible)

El stack elegido permite iterar rápido manteniendo calidad y preparación para escalar.

---

**Última actualización**: Noviembre 2025

