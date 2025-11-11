# 🚀 DESPLEGAR AHORA - Guía Rápida

## ⚡ Despliegue en 10 Minutos

### Opción 1: Automático con Script

```bash
# Dale permisos de ejecución
chmod +x scripts/deploy.sh

# Ejecuta el script
./scripts/deploy.sh
```

El script hace TODO automáticamente. Solo sigue las instrucciones en pantalla.

---

### Opción 2: Manual Rápido (Vercel Dashboard)

#### Paso 1: Instalar Dependencias (Local)

```bash
npm install
```

#### Paso 2: Crear Repositorio en GitHub

```bash
# Si no es un repo git aún
git init
git add .
git commit -m "Initial commit: Agenda Turnos Pro"

# Crear repo en GitHub y luego:
git remote add origin https://github.com/TU-USUARIO/agenda-turnos.git
git push -u origin main
```

#### Paso 3: Configurar Base de Datos (5 min)

**Opción A: Neon (Gratis, Recomendado)**

1. Ve a https://neon.tech
2. Sign up / Login
3. "Create Project" → Nombre: "agendaturnos"
4. Copia la `DATABASE_URL` que te dan
5. Guárdala para el paso 4

**Opción B: Supabase**

1. Ve a https://supabase.com
2. "New Project"
3. Settings → Database → Connection String
4. Agregar `?pgbouncer=true` al final
5. Guardar

#### Paso 4: Desplegar en Vercel (2 min)

1. Ve a https://vercel.com
2. Login con GitHub
3. "Add New" → "Project"
4. Selecciona tu repo "agenda-turnos"
5. **ANTES de Deploy**, agrega estas variables de entorno:

```env
DATABASE_URL=postgresql://[TU-NEON-URL]
NEXTAUTH_URL=https://tu-proyecto.vercel.app
NEXTAUTH_SECRET=GENERA_UNO_ALEATORIO_32_CARACTERES
```

Para generar `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

6. Click "Deploy"
7. Espera 2-3 minutos

#### Paso 5: Migrar Base de Datos (1 min)

```bash
# Reemplaza con tu URL de Neon
DATABASE_URL="postgresql://[TU-URL]" npx prisma migrate deploy
```

#### Paso 6: ¡Listo! 🎉

Tu app está en: `https://tu-proyecto.vercel.app`

---

## 🔧 Configuración Adicional (Opcional)

### Stripe (Para Pagos)

1. https://dashboard.stripe.com → API Keys
2. Agregar en Vercel:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

### Resend (Para Emails)

1. https://resend.com → API Keys
2. Agregar en Vercel:
   ```
   RESEND_API_KEY=re_...
   EMAIL_FROM=noreply@tudominio.com
   ```

### Google OAuth (Para Login con Google)

1. https://console.cloud.google.com
2. Create Credentials → OAuth 2.0
3. Agregar en Vercel:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

---

## ✅ Verificación

Después del deploy:

1. [ ] Abre tu URL de Vercel
2. [ ] Ve a `/auth/register`
3. [ ] Crea una cuenta
4. [ ] Crea un negocio
5. [ ] Agrega un servicio
6. [ ] ¡Funciona! 🎉

---

## 🆘 Si Algo Falla

### Error: "Cannot find module '@prisma/client'"

**Solución**: Vercel debería ejecutar `prisma generate` automáticamente. Si no:

1. Ve a Vercel Dashboard → Settings → General
2. Verifica "Build Command": `npm run build`
3. Verifica "Install Command": `npm install`

### Error: "Database connection failed"

**Solución**: Verifica que `DATABASE_URL` esté correcta en Vercel.

### Build tarda mucho o falla

**Solución**: 
1. Revisa los logs en Vercel
2. Asegúrate de que `package.json` tenga todas las dependencias
3. Ejecuta `npm run build` localmente primero

---

## 📝 Variables de Entorno MÍNIMAS

Para que funcione básicamente, necesitas SOLO estas 3:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://tu-app.vercel.app"
NEXTAUTH_SECRET="cualquier-string-aleatorio-largo"
```

Las demás (Stripe, Resend, Google) son opcionales y puedes agregarlas después.

---

## 🎯 Resumen

1. **Crear DB en Neon** → Copiar URL
2. **Push código a GitHub**
3. **Deploy en Vercel** → Agregar 3 variables env
4. **Migrar DB** → Un comando
5. **¡Listo!**

**Tiempo total**: 10 minutos

---

## 📞 ¿Necesitas Ayuda?

- Ver `DEPLOY_CHECKLIST.md` para guía completa paso a paso
- Ver `DEPLOYMENT.md` para configuración avanzada
- Ver logs en Vercel Dashboard si algo falla

---

## 🚀 Comando Todo-en-Uno

Si quieres el método más rápido:

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# Sigue las instrucciones en pantalla
# Vercel te preguntará por las variables de entorno
```

---

**¡Tu aplicación estará en producción en minutos! 🎉**

Para cualquier duda, revisa los archivos:
- `DEPLOY_CHECKLIST.md` - Guía completa
- `DEPLOYMENT.md` - Configuración avanzada
- `README.md` - Documentación general

