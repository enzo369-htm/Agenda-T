# 🚀 Guía de Despliegue en Producción

Esta guía te ayudará a desplegar **Agenda Turnos Pro** en diferentes plataformas.

## 📋 Checklist Pre-Despliegue

Antes de desplegar, asegúrate de:

- [ ] Todas las variables de entorno están configuradas
- [ ] Las credenciales de Stripe están en modo live
- [ ] El dominio está configurado correctamente
- [ ] Las migraciones de BD están actualizadas
- [ ] Los tests están pasando
- [ ] El build local funciona correctamente

## 🔧 Vercel (Recomendado)

Vercel es la opción más simple para desplegar aplicaciones Next.js.

### Paso 1: Preparar el Repositorio

```bash
# Asegúrate de que todo esté commiteado
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Paso 2: Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente Next.js

### Paso 3: Configurar Variables de Entorno

En Vercel Dashboard → Settings → Environment Variables, agrega:

```env
# Database (Neon, Supabase, Railway)
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=genera-con-openssl-rand-base64-32

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Stripe (Live keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@tudominio.com

# App
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
NEXT_PUBLIC_APP_NAME=Turnos In
```

### Paso 4: Configurar Build

Vercel automáticamente ejecutará:
```bash
npm install
npx prisma generate
npm run build
```

### Paso 5: Deploy

Click en "Deploy" y espera que termine el build.

### Paso 6: Configurar Dominio

1. Vercel → Settings → Domains
2. Agrega tu dominio custom
3. Configura DNS según las instrucciones

### Paso 7: Webhooks de Stripe

1. Ve a Stripe Dashboard → Webhooks
2. Agrega endpoint: `https://tu-dominio.com/api/webhooks/stripe`
3. Selecciona eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copia el Webhook Secret y agrégalo a Vercel

## 🗄️ Base de Datos en Producción

### Opción 1: Neon (Recomendado)

**Pros**: Serverless, auto-scaling, generoso free tier, muy rápido.

1. Crea cuenta en [neon.tech](https://neon.tech)
2. Crea un nuevo proyecto
3. Copia la `DATABASE_URL`
4. Agrega a Vercel Environment Variables

```bash
# Ejecutar migraciones
DATABASE_URL="tu-neon-url" npx prisma migrate deploy
```

### Opción 2: Supabase

**Pros**: Incluye auth, storage, realtime (útil para futuro).

1. Crea proyecto en [supabase.com](https://supabase.com)
2. Ve a Settings → Database
3. Copia Connection String (modo Transaction)
4. Agrega `?pgbouncer=true&connection_limit=1` al final

### Opción 3: Railway

**Pros**: Simple, incluye Redis, cron jobs.

1. Crea cuenta en [railway.app](https://railway.app)
2. Crea PostgreSQL database
3. Copia `DATABASE_URL` de variables

### Opción 4: AWS RDS

**Pros**: Enterprise-grade, muy confiable.

**Contras**: Más caro, requiere más configuración.

## 📧 Email en Producción

### Resend (Recomendado)

1. Verifica tu dominio en [resend.com](https://resend.com)
2. Agrega registros DNS (MX, TXT, CNAME)
3. Obtén API key
4. Configura `EMAIL_FROM` con tu dominio

### SendGrid

1. Crea cuenta en [sendgrid.com](https://sendgrid.com)
2. Verifica dominio (Domain Authentication)
3. Obtén API key
4. Reemplaza código de Resend con SendGrid

## 🔔 Notificaciones de WhatsApp

### Opción 1: Links wa.me (Sin costo)

Ya implementado, funciona por defecto.

### Opción 2: Twilio API

1. Crea cuenta Business en [twilio.com](https://www.twilio.com/whatsapp)
2. Solicita aprobación de WhatsApp Business
3. Obtén credenciales:
   ```env
   TWILIO_ACCOUNT_SID=...
   TWILIO_AUTH_TOKEN=...
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```
4. El código ya está preparado para usar Twilio

## 📊 Analytics

### Vercel Analytics

1. Vercel Dashboard → Analytics → Enable
2. Gratis hasta 100k eventos/mes

### Google Analytics

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Agrega en `app/layout.tsx`:
```tsx
import Script from 'next/script';

// En el return del layout
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
  strategy="afterInteractive"
/>
```

## 🔒 Seguridad

### Headers de Seguridad

Agrega en `next.config.js`:

```js
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
  ];
},
```

### Rate Limiting

Usa Upstash para rate limiting:

```bash
npm install @upstash/ratelimit @upstash/redis
```

### Variables Secretas

**NUNCA** comitees:
- API keys
- Secrets
- Passwords
- Private keys

Usa Vercel Environment Variables o secretos de GitHub.

## 🔍 Monitoring

### Sentry (Errores)

```bash
npm install @sentry/nextjs
```

```js
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### LogRocket (Session Replay)

```bash
npm install logrocket
```

### Uptime Monitoring

- [Better Uptime](https://betteruptime.com)
- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://www.pingdom.com)

## 🚦 CI/CD

Ya incluido: `.github/workflows/ci.yml`

Para deploy automático:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 📱 PWA (Opcional)

Para convertir en PWA:

```bash
npm install next-pwa
```

```js
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // ... resto de config
});
```

## 🔄 Backups

### Automáticos en Neon

Neon hace backups automáticos diarios.

### Manual con pg_dump

```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Scheduled Backups (Railway)

Railway permite cron jobs para backups automáticos.

## 🌍 Internacionalización (i18n)

Preparado con `next-intl`:

```bash
npm install next-intl
```

Ver documentación: https://next-intl-docs.vercel.app/

## 📈 Escalabilidad

### Para 100+ negocios:

- **Database**: Read replicas (Neon, Supabase)
- **Cache**: Redis (Upstash, Railway)
- **CDN**: Vercel Edge Network
- **Images**: Vercel Image Optimization

### Para 1000+ negocios:

- **Search**: Algolia o Meilisearch
- **Jobs**: Inngest o BullMQ
- **Logs**: Better Stack o Datadog
- **Metrics**: Prometheus + Grafana

## 🐛 Debugging en Producción

### Ver logs en Vercel

```bash
vercel logs [deployment-url]
```

### Ver logs de Prisma

```env
DEBUG=prisma:*
```

### Habilitar sourcemaps

```js
// next.config.js
productionBrowserSourceMaps: true,
```

## ✅ Post-Despliegue

- [ ] Probar flujo de registro
- [ ] Probar creación de negocio
- [ ] Probar flujo de reserva completo
- [ ] Verificar emails se envían
- [ ] Verificar webhooks de Stripe funcionan
- [ ] Verificar página pública de negocio
- [ ] Configurar monitoring
- [ ] Configurar backups
- [ ] Documentar credenciales en lugar seguro

## 🆘 Troubleshooting

### "Module not found: prisma/client"

```bash
npm run prisma:generate
vercel build
```

### "Database connection failed"

Verifica `DATABASE_URL` y que la IP de Vercel tenga acceso.

### "NextAuth session undefined"

Verifica `NEXTAUTH_URL` y `NEXTAUTH_SECRET`.

### "Webhook signature verification failed"

Obtén nuevo webhook secret de Stripe Dashboard.

---

**¡Éxito con tu despliegue! 🎉**

Si tienes problemas, revisa los logs de Vercel o abre un issue en GitHub.

