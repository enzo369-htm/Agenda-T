# Configurar base de datos (sin Docker)

Si no tenés Docker instalado, usá **Neon** (PostgreSQL gratis en la nube).

## Pasos (2 minutos)

### 1. Crear cuenta en Neon
- Entrá a **https://neon.tech**
- Clic en "Sign up" (podés usar GitHub para ser más rápido)

### 2. Crear proyecto
- Clic en "New Project"
- Nombre: `agendaturnos` (o el que quieras)
- Región: la más cercana
- Clic en "Create Project"

### 3. Copiar la connection string
- En el dashboard, buscá "Connection string"
- Seleccioná "Pooled connection" o "Direct connection"
- Copiá la URL (empieza con `postgresql://...`)

### 4. Actualizar .env
Abrí el archivo `.env` y reemplazá la línea de DATABASE_URL:

```
DATABASE_URL="postgresql://usuario:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

(Pegá tu URL de Neon)

### 5. Crear tablas
En la terminal:

```bash
npm run db:push
```

### 6. (Opcional) Datos de prueba
```bash
npm run db:seed
```

---

## Verificar
Abrí http://localhost:3000/api/health

Si ves `{"ok":true,"database":"connected"}` → todo bien.
