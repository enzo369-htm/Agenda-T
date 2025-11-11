# ✅ Checklist de Despliegue - Agenda Turnos Pro

Sigue estos pasos para desplegar tu aplicación en producción.

---

## 🎯 OPCIÓN 1: Despliegue Automático (Recomendado)

### Ejecutar Script de Despliegue

```bash
./scripts/deploy.sh
```

El script verificará todo automáticamente y desplegará a Vercel.

---

## 📋 OPCIÓN 2: Despliegue Manual Paso a Paso

### Paso 1: Preparación Local ✅

- [ ] Verificar que el proyecto funciona localmente
  ```bash
  npm install
  npm run dev
  ```

- [ ] Ejecutar tests
  ```bash
  npm run test
  npm run type-check
  npm run lint
  ```

- [ ] Hacer build local
  ```bash
  npm run build
  ```

### Paso 2: Configurar Base de Datos en Producción 🗄️

Elige un proveedor:

#### Opción A: Neon (Recomendado - Gratis)

1. [ ] Ir a https://neon.tech
2. [ ] Crear cuenta
3. [ ] Crear nuevo proyecto "agendaturnos-prod"
4. [ ] Copiar `DATABASE_URL`
5. [ ] Guardar para Paso 4

#### Opción B: Supabase

1. [ ] Ir a https://supabase.com
2. [ ] Crear proyecto
3. [ ] Settings → Database → Connection String
4. [ ] Agregar `?pgbouncer=true` al final

#### Opción C: Railway

1. [ ] Ir a https://railway.app
2. [ ] Crear PostgreSQL database
3. [ ] Copiar `DATABASE_URL`

### Paso 3: Configurar Servicios Externos 🔌

#### Stripe (Pagos)

1. [ ] Ir a https://dashboard.stripe.com
2. [ ] Crear cuenta o iniciar sesión
3. [ ] Developers → API keys
4. [ ] Copiar keys de **LIVE** (no test):
   - `STRIPE_SECRET_KEY` (sk_live_...)
   - `STRIPE_PUBLISHABLE_KEY` (pk_live_...)
5. [ ] Guardar para Paso 4

#### Resend (Emails)

1. [ ] Ir a https://resend.com
2. [ ] Crear cuenta
3. [ ] API Keys → Create API Key
4. [ ] Copiar `RESEND_API_KEY`
5. [ ] (Opcional) Verificar dominio para emails profesionales
6. [ ] Guardar para Paso 4

#### Google OAuth (Opcional)

1. [ ] Ir a https://console.cloud.google.com
2. [ ] Crear proyecto
3. [ ] APIs & Services → Credentials
4. [ ] Create Credentials → OAuth 2.0 Client ID
5. [ ] Authorized redirect URI: `https://tu-dominio.com/api/auth/callback/google`
6. [ ] Copiar Client ID y Secret
7. [ ] Guardar para Paso 4

### Paso 4: Preparar Repositorio Git 📦

```bash
# Inicializar Git si no está
git init

# Agregar todos los archivos
git add .

# Commit
git commit -m "Deploy: Agenda Turnos Pro MVP"

# Crear repo en GitHub
# Ve a https://github.com/new y crea un nuevo repositorio

# Agregar remote
git remote add origin https://github.com/TU-USUARIO/APPAGENDATURNOS.git

# Push
git push -u origin main
```

- [ ] Repositorio creado en GitHub
- [ ] Código pusheado

### Paso 5: Desplegar en Vercel 🚀

#### A. Usando Vercel Dashboard (Más fácil)

1. [ ] Ir a https://vercel.com
2. [ ] Login con GitHub
3. [ ] Click "Add New" → "Project"
4. [ ] Importar tu repositorio de GitHub
5. [ ] Vercel detectará Next.js automáticamente
6. [ ] **NO HACER CLICK EN DEPLOY AÚN**

#### B. Configurar Variables de Entorno

En Vercel → Settings → Environment Variables, agregar:

**VARIABLES OBLIGATORIAS:**

```env
# Database
DATABASE_URL=postgresql://...  [COPIAR DE PASO 2]

# NextAuth
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=[GENERAR: openssl rand -base64 32]

# Stripe
STRIPE_SECRET_KEY=sk_live_...  [COPIAR DE PASO 3]
STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Email
RESEND_API_KEY=re_...  [COPIAR DE PASO 3]
EMAIL_FROM=noreply@tudominio.com

# App
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

**VARIABLES OPCIONALES:**

```env
# Google OAuth (si lo configuraste)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Twilio (si quieres WhatsApp API)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=...
```

- [ ] Todas las variables configuradas
- [ ] Verificar que no haya typos

#### C. Deploy

1. [ ] Click en "Deploy"
2. [ ] Esperar que termine el build (2-3 minutos)
3. [ ] ✅ Build exitoso → Recibes URL de producción

### Paso 6: Configurar Base de Datos de Producción 🗄️

```bash
# Desde tu terminal local, ejecutar migraciones
DATABASE_URL="postgresql://[TU-URL-PRODUCCION]" npx prisma migrate deploy

# Verificar que las migraciones se aplicaron
DATABASE_URL="postgresql://[TU-URL-PRODUCCION]" npx prisma studio
```

- [ ] Migraciones ejecutadas
- [ ] Tablas creadas

### Paso 7: Configurar Webhooks de Stripe 🔗

1. [ ] Ir a Stripe Dashboard → Developers → Webhooks
2. [ ] Click "Add endpoint"
3. [ ] Endpoint URL: `https://tu-dominio.vercel.app/api/webhooks/stripe`
4. [ ] Seleccionar eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. [ ] Copiar "Signing secret" (empieza con whsec_...)
6. [ ] Agregar a Vercel:
   - Variable: `STRIPE_WEBHOOK_SECRET`
   - Valor: whsec_...
7. [ ] Re-deploy en Vercel (trigger nuevo deploy)

### Paso 8: Verificación Post-Deploy ✅

1. [ ] Visitar tu URL de producción
2. [ ] Verificar que carga la homepage
3. [ ] Probar registro de usuario nuevo
4. [ ] Crear un negocio de prueba
5. [ ] Crear servicios
6. [ ] Hacer una reserva de prueba
7. [ ] Verificar que llega el email de confirmación
8. [ ] Revisar logs en Vercel Dashboard

### Paso 9: Configurar Dominio Custom (Opcional) 🌐

1. [ ] Vercel → Settings → Domains
2. [ ] Agregar tu dominio
3. [ ] Configurar DNS según instrucciones
4. [ ] Esperar propagación (5-30 min)
5. [ ] Actualizar `NEXTAUTH_URL` en variables de entorno
6. [ ] Actualizar Stripe webhook URL

### Paso 10: Monitoring y Seguridad 🔒

- [ ] Configurar alertas en Vercel
- [ ] Habilitar Vercel Analytics
- [ ] Configurar backups automáticos de BD
- [ ] Documentar credenciales en lugar seguro (1Password, LastPass)
- [ ] Configurar 2FA en todas las cuentas

---

## 🆘 Troubleshooting

### Build Falla en Vercel

**Error: "Cannot find module '@prisma/client'"**

Solución:
```json
// package.json - verificar que exista:
"scripts": {
  "postinstall": "prisma generate"
}
```

### Error de Base de Datos

**Error: "Can't reach database server"**

Soluciones:
1. Verificar `DATABASE_URL` en Vercel
2. Verificar que la IP de Vercel tenga acceso a tu BD
3. Para Neon: No requiere whitelist de IPs
4. Para otros: Agregar `0.0.0.0/0` en whitelist

### Webhooks no Funcionan

**Stripe webhook failing**

1. Verificar URL: `https://tu-dominio.com/api/webhooks/stripe`
2. Verificar que `STRIPE_WEBHOOK_SECRET` esté configurado
3. Verificar en Stripe Dashboard → Webhooks → Logs

### Emails no se Envían

1. Verificar `RESEND_API_KEY`
2. Verificar `EMAIL_FROM`
3. Para producción: Verificar dominio en Resend

---

## 📊 Métricas de Éxito

Después del deploy, deberías poder:

- [ ] ✅ Acceder a la aplicación vía HTTPS
- [ ] ✅ Registrar usuarios nuevos
- [ ] ✅ Login funciona (email y Google)
- [ ] ✅ Crear negocios
- [ ] ✅ Agregar servicios
- [ ] ✅ Hacer reservas
- [ ] ✅ Recibir emails de confirmación
- [ ] ✅ Ver dashboard del negocio
- [ ] ✅ Ver reservas
- [ ] ✅ Páginas públicas funcionan

---

## 🎉 ¡Felicitaciones!

Tu aplicación está en producción. 

### Próximos pasos:

1. Monitorear logs en Vercel
2. Configurar domain custom si lo deseas
3. Agregar datos reales (negocios, servicios)
4. Compartir con usuarios beta
5. Recopilar feedback
6. Iterar y mejorar

---

## 📞 Soporte

Si encuentras problemas:

1. Revisar logs en Vercel Dashboard
2. Revisar este checklist nuevamente
3. Consultar DEPLOYMENT.md
4. Buscar el error específico en documentación
5. Abrir issue en GitHub

---

**¡Éxito con tu despliegue! 🚀**

