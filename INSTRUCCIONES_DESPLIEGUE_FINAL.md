# 🚀 DESPLIEGUE FINAL - Sigue estos pasos

## ✅ Lo que ya está LISTO:

- ✅ Git inicializado
- ✅ Dependencias instaladas
- ✅ Prisma Client generado
- ✅ Build compilando
- ✅ Proyecto 100% funcional

---

## 🎯 PASO 1: Crear Repositorio en GitHub (2 minutos)

### Ve a GitHub:
https://github.com/new

### Crea un nuevo repositorio:
- **Nombre**: `agenda-turnos-pro` (o el que prefieras)
- **Visibilidad**: Privado (recomendado) o Público
- **NO inicialices** con README, .gitignore o licencia (ya los tienes)

### Desde tu terminal, ejecuta:

```bash
cd /Users/macbookpro/Documents/APPAGENDATURNOS

# Reemplaza TU-USUARIO con tu usuario de GitHub
git remote add origin https://github.com/TU-USUARIO/agenda-turnos-pro.git

# Push
git push -u origin main
```

---

## 🎯 PASO 2: Crear Base de Datos en Neon (3 minutos)

### 1. Ve a Neon:
https://neon.tech

### 2. Sign Up / Login (usa GitHub para más rápido)

### 3. Create New Project:
- **Name**: agendaturnos-prod
- **Region**: US East (o el más cercano)
- **Postgres version**: 16

### 4. Copia la Connection String:
Verás algo como:
```
postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**¡GUARDA ESTO!** Lo necesitas para el siguiente paso.

---

## 🎯 PASO 3: Desplegar en Vercel (5 minutos)

### 1. Ve a Vercel:
https://vercel.com

### 2. Login con GitHub

### 3. Import tu repositorio:
- Click "Add New" → "Project"
- Encuentra "agenda-turnos-pro"
- Click "Import"

### 4. ANTES de hacer Deploy, agrega Variables de Entorno:

Click en "Environment Variables" y agrega:

#### OBLIGATORIAS (mínimo para funcionar):

```env
DATABASE_URL
```
Valor: La connection string de Neon que copiaste
```
postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

```env
NEXTAUTH_URL
```
Valor: (espera a que Vercel te dé tu URL, o usa):
```
https://tu-proyecto.vercel.app
```

```env
NEXTAUTH_SECRET
```
Valor: Genera uno ejecutando en tu terminal:
```bash
openssl rand -base64 32
```
Copia el resultado y pégalo aquí.

#### OPCIONALES (para funcionalidad completa):

```env
STRIPE_SECRET_KEY
```
Obtener en: https://dashboard.stripe.com/test/apikeys
```
sk_test_...
```

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```
```
pk_test_...
```

```env
RESEND_API_KEY
```
Obtener en: https://resend.com/api-keys
```
re_...
```

```env
EMAIL_FROM
```
```
noreply@tudominio.com
```

```env
GOOGLE_CLIENT_ID
```
Opcional, para login con Google
```
tu-client-id.apps.googleusercontent.com
```

```env
GOOGLE_CLIENT_SECRET
```
```
tu-secret
```

### 5. Deploy:
Click "Deploy" y espera 2-3 minutos

---

## 🎯 PASO 4: Migrar Base de Datos (1 minuto)

Una vez que Vercel termine el deploy, ejecuta desde tu terminal:

```bash
cd /Users/macbookpro/Documents/APPAGENDATURNOS

# Reemplaza con tu DATABASE_URL de Neon
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

---

## 🎯 PASO 5: ¡Verificar que Funciona! (2 minutos)

### 1. Ve a tu URL de Vercel:
```
https://tu-proyecto.vercel.app
```

### 2. Prueba:
- ✅ Homepage carga
- ✅ Ve a `/auth/register`
- ✅ Crea una cuenta
- ✅ Ve a `/dashboard`
- ✅ Crea un negocio
- ✅ ¡Funciona! 🎉

---

## 🎯 PASO 6: Configurar Dominio Custom (Opcional)

### En Vercel Dashboard:
1. Settings → Domains
2. Agregar tu dominio
3. Configurar DNS según instrucciones
4. Actualizar `NEXTAUTH_URL` con tu dominio

---

## 🎯 PASO 7: Stripe Webhooks (Opcional, para pagos)

### 1. Ve a Stripe Dashboard:
https://dashboard.stripe.com/test/webhooks

### 2. Add Endpoint:
```
https://tu-dominio.vercel.app/api/webhooks/stripe
```

### 3. Selecciona eventos:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### 4. Copia el Webhook Secret:
Empieza con `whsec_...`

### 5. Agrégalo en Vercel:
Variable: `STRIPE_WEBHOOK_SECRET`
Valor: `whsec_...`

### 6. Re-deploy:
En Vercel Dashboard → Deployments → Re-deploy latest

---

## ✅ CHECKLIST FINAL

Después de seguir todos los pasos:

- [ ] Código en GitHub
- [ ] Base de datos en Neon
- [ ] App desplegada en Vercel
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas
- [ ] App funciona en producción
- [ ] Puedes crear usuarios
- [ ] Puedes crear negocios
- [ ] Puedes hacer reservas

---

## 🎉 ¡FELICITACIONES!

Tu aplicación está en producción en:
```
https://tu-proyecto.vercel.app
```

### Próximos pasos:

1. **Compartir** con usuarios beta
2. **Monitorear** logs en Vercel Dashboard
3. **Configurar** dominio custom si quieres
4. **Agregar** Stripe y Resend para funcionalidad completa
5. **Iterar** basándote en feedback

---

## 🆘 Si Algo Sale Mal

### Build falla en Vercel:
- Revisa logs en Vercel Dashboard
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de tener `"postinstall": "prisma generate"` en scripts

### Database connection error:
- Verifica `DATABASE_URL` en Vercel
- Asegúrate de que las migraciones se ejecutaron
- Neon no requiere whitelist de IPs

### NEXTAUTH error:
- Verifica `NEXTAUTH_URL` (debe ser tu URL de Vercel)
- Verifica `NEXTAUTH_SECRET` (debe ser una string aleatoria)

---

## 📊 URLs Importantes

| Servicio | URL |
|----------|-----|
| **Tu App** | https://tu-proyecto.vercel.app |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Neon Dashboard** | https://console.neon.tech |
| **Stripe Dashboard** | https://dashboard.stripe.com |
| **Resend Dashboard** | https://resend.com/dashboard |

---

## 🔥 COMANDO RÁPIDO (Alternativa)

Si tienes Vercel CLI instalado:

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Sigue las instrucciones en pantalla
```

---

**¡Tu aplicación está lista para conquistar el mundo! 🚀**

Para cualquier duda, revisa:
- `README.md` - Documentación completa
- `DEPLOY_CHECKLIST.md` - Checklist detallado
- `DEPLOYMENT.md` - Guía avanzada

