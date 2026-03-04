# 🚀 Guía de Despliegue en Vercel - Turnos In

Esta guía te llevará paso a paso para desplegar tu aplicación **Turnos In** en Vercel.

---

## 📋 PREPARACIÓN PREVIA

### 1. Verificar que el código esté listo

Antes de desplegar, asegúrate de:

- ✅ El build funciona: `npm run build` (ya verificado ✅)
- ✅ Tienes una cuenta en GitHub
- ✅ Tienes una cuenta en Vercel (o créala con GitHub)
- ✅ Tienes una base de datos en Neon (o créala)

---

## 🎯 PASO 1: Subir código a GitHub (5 minutos)

### Si ya tienes un repositorio:

```bash
cd /Users/macbookpro/Documents/APPAGENDATURNOS

# Verifica que estés en la rama main
git checkout main

# Agrega todos los cambios
git add .

# Haz commit de los cambios
git commit -m "Preparación para despliegue en Vercel"

# Sube los cambios
git push origin main
```

### Si NO tienes repositorio en GitHub:

1. Ve a https://github.com/new
2. Crea un nuevo repositorio:
   - **Nombre**: `turnos-in` (o el que prefieras)
   - **Visibilidad**: Privado (recomendado) o Público
   - **NO inicialices** con README, .gitignore o licencia
3. Ejecuta en tu terminal:

```bash
cd /Users/macbookpro/Documents/APPAGENDATURNOS

# Agrega el remote (reemplaza TU-USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU-USUARIO/turnos-in.git

# Sube el código
git push -u origin main
```

---

## 🎯 PASO 2: Crear Base de Datos en Neon (3 minutos)

### 1. Ve a Neon:
https://neon.tech

### 2. Inicia sesión (puedes usar GitHub para más rápido)

### 3. Crea un nuevo proyecto:
- **Name**: `turnos-in-prod`
- **Region**: US East (o el más cercano a tus usuarios)
- **Postgres version**: 16

### 4. Copia la Connection String:
Verás algo como:
```
postgresql://usuario:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**⚠️ IMPORTANTE: Guarda esta URL, la necesitarás en el siguiente paso**

---

## 🎯 PASO 3: Desplegar en Vercel (10 minutos)

### 1. Ve a Vercel:
https://vercel.com

### 2. Inicia sesión con GitHub
(Esto conectará automáticamente tus repositorios)

### 3. Importa tu proyecto:
- Click en **"Add New"** → **"Project"**
- Encuentra tu repositorio `turnos-in` (o el nombre que elegiste)
- Click en **"Import"**

### 4. Configuración del proyecto:

Vercel detectará automáticamente que es un proyecto Next.js. **NO hagas deploy todavía**.

### 5. Configura Variables de Entorno:

Click en **"Environment Variables"** y agrega las siguientes:

#### 🔴 OBLIGATORIAS (mínimo para funcionar):

**1. DATABASE_URL**
```
postgresql://usuario:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```
*(La que copiaste de Neon)*

**2. NEXTAUTH_SECRET**
Genera uno ejecutando en tu terminal:
```bash
openssl rand -base64 32
```
Copia el resultado y pégalo aquí.

**3. NEXTAUTH_URL**
Por ahora déjalo como:
```
https://tu-proyecto.vercel.app
```
*(Vercel te dará la URL después del primer deploy, luego la actualizarás)*

#### 🟡 OPCIONALES (para funcionalidad completa):

**4. STRIPE_SECRET_KEY** (para pagos)
- Obtener en: https://dashboard.stripe.com/test/apikeys
- Formato: `sk_test_...` (modo test) o `sk_live_...` (producción)

**5. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** (para pagos)
- Obtener en: https://dashboard.stripe.com/test/apikeys
- Formato: `pk_test_...` (modo test) o `pk_live_...` (producción)

**6. STRIPE_WEBHOOK_SECRET** (para webhooks de Stripe)
- Se configura después del primer deploy (ver Paso 6)

**7. RESEND_API_KEY** (para emails)
- Obtener en: https://resend.com/api-keys
- Formato: `re_...`

**8. EMAIL_FROM** (para emails)
```
noreply@tudominio.com
```

**9. GOOGLE_CLIENT_ID** (para login con Google)
- Obtener en: https://console.cloud.google.com/apis/credentials
- Formato: `xxx.apps.googleusercontent.com`

**10. GOOGLE_CLIENT_SECRET** (para login con Google)
- Obtener en: https://console.cloud.google.com/apis/credentials

**11. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY** (para mapas)
- Obtener en: https://console.cloud.google.com/apis/credentials

### 6. Configuración de Build:

Vercel debería detectar automáticamente:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

Si no está configurado, agrégalo manualmente.

### 7. ¡Haz Deploy!

Click en **"Deploy"** y espera 2-3 minutos.

---

## 🎯 PASO 4: Actualizar NEXTAUTH_URL (1 minuto)

Una vez que Vercel termine el deploy:

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a **Settings** → **Environment Variables**
3. Busca `NEXTAUTH_URL`
4. Actualiza el valor con la URL que Vercel te dio:
   ```
   https://tu-proyecto.vercel.app
   ```
5. Ve a **Deployments** → Click en los **3 puntos** del último deploy → **Redeploy**

---

## 🎯 PASO 5: Migrar Base de Datos (2 minutos)

Una vez que Vercel termine el deploy, ejecuta desde tu terminal:

```bash
cd /Users/macbookpro/Documents/APPAGENDATURNOS

# Reemplaza con tu DATABASE_URL de Neon
DATABASE_URL="postgresql://usuario:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require" npx prisma migrate deploy
```

Esto aplicará todas las migraciones a tu base de datos de producción.

---

## 🎯 PASO 6: Configurar Stripe Webhooks (Opcional, 5 minutos)

Si usas Stripe para pagos:

### 1. Ve a Stripe Dashboard:
https://dashboard.stripe.com/test/webhooks

### 2. Click en "Add Endpoint"

### 3. Configura:
- **Endpoint URL**: `https://tu-proyecto.vercel.app/api/webhooks/stripe`
- **Events to send**: Selecciona:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

### 4. Click en "Add endpoint"

### 5. Copia el Webhook Secret:
Empieza con `whsec_...`

### 6. Agrégalo en Vercel:
- Ve a **Settings** → **Environment Variables**
- Agrega: `STRIPE_WEBHOOK_SECRET` = `whsec_...`
- Selecciona **Production**, **Preview** y **Development**

### 7. Re-deploy:
- Ve a **Deployments** → Click en los **3 puntos** → **Redeploy**

---

## 🎯 PASO 7: ¡Verificar que Funciona! (3 minutos)

### 1. Ve a tu URL de Vercel:
```
https://tu-proyecto.vercel.app
```

### 2. Prueba las funcionalidades:
- ✅ Homepage carga correctamente
- ✅ Ve a `/auth/register` y crea una cuenta
- ✅ Inicia sesión en `/auth/login`
- ✅ Ve a `/dashboard` y crea un negocio
- ✅ Configura horarios y servicios
- ✅ Crea una reserva de prueba
- ✅ Verifica que todo funciona 🎉

---

## 🎯 PASO 8: Configurar Dominio Custom (Opcional, 10 minutos)

Si tienes un dominio propio:

### 1. En Vercel Dashboard:
- Ve a **Settings** → **Domains**
- Agrega tu dominio (ej: `turnosin.com`)

### 2. Configura DNS:
Vercel te dará instrucciones específicas. Generalmente necesitas:
- Agregar un registro `A` o `CNAME` en tu proveedor de DNS

### 3. Actualizar NEXTAUTH_URL:
- Ve a **Settings** → **Environment Variables**
- Actualiza `NEXTAUTH_URL` con tu dominio:
  ```
  https://turnosin.com
  ```

### 4. Re-deploy:
- Ve a **Deployments** → **Redeploy**

---

## ✅ CHECKLIST FINAL

Después de seguir todos los pasos:

- [ ] Código subido a GitHub
- [ ] Base de datos creada en Neon
- [ ] App desplegada en Vercel
- [ ] Variables de entorno configuradas (mínimo: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL)
- [ ] Migraciones ejecutadas en producción
- [ ] NEXTAUTH_URL actualizada con la URL de Vercel
- [ ] App funciona en producción
- [ ] Puedes crear usuarios
- [ ] Puedes crear negocios
- [ ] Puedes hacer reservas
- [ ] (Opcional) Stripe configurado
- [ ] (Opcional) Resend configurado
- [ ] (Opcional) Dominio custom configurado

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Build falla en Vercel:
1. Revisa los logs en Vercel Dashboard → Deployments → Click en el deploy fallido
2. Verifica que todas las dependencias estén en `package.json`
3. Asegúrate de tener `"postinstall": "prisma generate"` en scripts (ya está ✅)

### Error de conexión a base de datos:
1. Verifica `DATABASE_URL` en Vercel (Settings → Environment Variables)
2. Asegúrate de que las migraciones se ejecutaron (`npx prisma migrate deploy`)
3. Neon no requiere whitelist de IPs, debería funcionar directamente

### Error de NextAuth:
1. Verifica `NEXTAUTH_URL` (debe ser tu URL de Vercel completa, con `https://`)
2. Verifica `NEXTAUTH_SECRET` (debe ser una string aleatoria generada con `openssl rand -base64 32`)
3. Re-deploy después de cambiar estas variables

### Error 404 en rutas:
1. Verifica que `vercel.json` esté correctamente configurado (ya está ✅)
2. Asegúrate de que las rutas estén en `app/` directory

### Variables de entorno no funcionan:
1. Verifica que las variables estén en **Production**, **Preview** y **Development**
2. Re-deploy después de agregar/modificar variables

---

## 📊 URLs IMPORTANTES

| Servicio | URL |
|----------|-----|
| **Tu App** | https://tu-proyecto.vercel.app |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Neon Dashboard** | https://console.neon.tech |
| **Stripe Dashboard** | https://dashboard.stripe.com |
| **Resend Dashboard** | https://resend.com/dashboard |
| **Google Cloud Console** | https://console.cloud.google.com |

---

## 🔥 COMANDO RÁPIDO (Alternativa con CLI)

Si prefieres usar la CLI de Vercel:

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (desde el directorio del proyecto)
cd /Users/macbookpro/Documents/APPAGENDATURNOS
vercel

# Sigue las instrucciones en pantalla
# Te pedirá las variables de entorno interactivamente
```

---

## 🎉 ¡FELICITACIONES!

Tu aplicación **Turnos In** está ahora en producción en:
```
https://tu-proyecto.vercel.app
```

### Próximos pasos sugeridos:

1. **Compartir** con usuarios beta para obtener feedback
2. **Monitorear** logs en Vercel Dashboard
3. **Configurar** dominio custom si lo deseas
4. **Agregar** Stripe y Resend para funcionalidad completa
5. **Iterar** basándote en feedback de usuarios
6. **Configurar** Google Analytics si lo necesitas

---

## 📝 NOTAS IMPORTANTES

- **Vercel** despliega automáticamente cada vez que haces `git push` a la rama `main`
- **Neon** ofrece un tier gratuito generoso para empezar
- **Stripe** tiene modo test gratuito para probar pagos
- **Resend** ofrece 3,000 emails/mes gratis

---

**¡Tu aplicación está lista para conquistar el mundo! 🚀**

Para cualquier duda, revisa:
- `README.md` - Documentación completa del proyecto
- `INSTRUCCIONES_DESPLIEGUE_FINAL.md` - Guía alternativa
- `DEPLOYMENT.md` - Guía avanzada



