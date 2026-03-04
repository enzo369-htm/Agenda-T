# Auditoría de Performance - Agenda Turnos

## Resumen Ejecutivo

El proyecto usa **PostgreSQL + Prisma** (no Supabase). Las principales causas de lentitud identificadas son:

1. **Webpack en lugar de Turbopack** → Compilación 3-5x más lenta
2. **Dependencias no usadas** que aumentan el bundle (react-big-calendar, @tanstack/react-query)
3. **Re-renders innecesarios** por falta de memoización
4. **Cálculos costosos en cada render** (WeekCalendarView, BaseClientesView)
5. **useEffect con dependencias incorrectas** que pueden causar loops o fetches duplicados
6. **API de bookings sin filtro de fechas** → Trae TODAS las reservas del negocio

---

## 1. Re-renders y Memoización

### Problema: `app/dashboard/negocio/[slug]/page.tsx` (488 líneas)

- **`navigateWeek`**: Se recrea en cada render → pasar a `useCallback`
- **`weekStart`, `weekEnd`, `filteredBookings`**: Recalculados en cada render → `useMemo`
- **Callbacks inline** en `WeekCalendarView` (`onTimeSlotClick`, `onBookingClick`): Nuevas referencias cada render → causan re-render del calendario
- **useEffect** línea 62-65: `fetchBusiness` y `fetchBookings` no están en el array de dependencias (aunque son useCallback, ESLint los exige)

### Problema: `components/dashboard/WeekCalendarView.tsx`

- **`getBookingsForSlot`**: Se ejecuta 77 veces por render (7 días × 11 horas), filtrando el array completo cada vez → O(n×77)
- **`days` y `hours`**: Arrays recreados en cada render
- **Sin React.memo**: Re-renderiza cuando el padre cambia cualquier estado

### Problema: `components/dashboard/clients/BaseClientesView.tsx`

- **`clients`**: `Array.from(new Map(...))` + `bookings.filter` por cada cliente → O(n²)
- **`filteredClients`**: Recalculado en cada render
- Deberían estar en `useMemo` con dependencias `[bookings, searchQuery]`

### Problema: `components/dashboard/sales/SalesFacturadasView.tsx`

- **`completedBookings`** y **`totalRevenue`**: Recalculados en cada render → `useMemo`

---

## 2. useEffect Mal Implementados

### `app/dashboard/page.tsx`

```javascript
useEffect(() => {
  if (session?.user) {
    fetchData();
  }
}, [session]);
```

- **`fetchData`** usa `session` internamente pero no está en deps
- **`fetchData`** no está en el array de dependencias → closure obsoleta

### `app/dashboard/negocio/[slug]/page.tsx`

```javascript
useEffect(() => {
  fetchBusiness();
  fetchBookings();
}, [slug]); // fetchBusiness, fetchBookings faltan en deps
```

### `hooks/useOnboarding.ts`

- Segundo `useEffect` (líneas 91-106): Llama `setSidebarOpen(true)` dentro de `setOnboardingState` con `setTimeout` → puede causar renders extraños
- `business` en deps del primer useEffect pero solo se usa para "crear cuenta" que no depende de business

---

## 3. Componentes Demasiado Grandes

| Archivo | Líneas | Acción recomendada |
|---------|--------|-------------------|
| `app/dashboard/negocio/[slug]/page.tsx` | 488 | Extraer `AgendaTab`, `SalesTab`, `ClientsTab`, `SettingsTab` a componentes separados |
| `app/negocio/[slug]/page.tsx` | 415 | Extraer secciones a subcomponentes |
| `app/page.tsx` | 365 | Aceptable (landing estática) |

---

## 4. Fetches en Client vs Server

- **`app/negocio/[slug]/page.tsx`**: `'use client'` + fetch en useEffect → podría ser Server Component con datos en el servidor
- **`app/dashboard/negocio/[slug]/page.tsx`**: Igual, fetch de business y bookings en cliente
- **Beneficio**: Reducir JavaScript en cliente, datos disponibles en el primer paint

---

## 5. Dependencias y Bundle

### No usadas (eliminar)

- **`react-big-calendar`**: No hay imports. El proyecto usa `WeekCalendarView` custom.
- **`@tanstack/react-query`**: No hay imports. No se usa en ningún archivo.

### Pesadas (revisar imports dinámicos)

- **`googleapis`** (~134): Solo en `lib/google-calendar.ts` (server-side) → OK
- **`date-fns-tz`**: Verificar si se usa o si basta con `date-fns`
- **`lucide-react`**: Importar iconos específicos: `import { X } from 'lucide-react'` en lugar del paquete completo

---

## 6. Compilación - Turbopack

- **Actual**: `next dev --webpack` (explícito)
- **Motivo en next.config**: "compatibilidad con canvas" para react-big-calendar
- **Realidad**: react-big-calendar NO se usa. El `canvas` en externals podría ser de otra dependencia.
- **Acción**: Probar `next dev` (sin --webpack) para usar Turbopack. Si falla, investigar qué usa canvas.

---

## 7. API - Consultas a Base de Datos

### `GET /api/businesses/[slug]/bookings`

- **Problema**: No filtra por rango de fechas. Trae TODAS las reservas del negocio.
- **Impacto**: Con miles de reservas, la respuesta es muy pesada y lenta.
- **Solución**: El dashboard ya tiene `selectedDate` y vista semanal. Pasar `startDate` y `endDate` según la semana visible.

---

## 8. Logs en Desarrollo

- **`prisma/seed.ts`**: OK (solo en seed)
- **`lib/notifications/whatsapp.ts`**: `console.warn` cuando Twilio no está configurado → OK
- **`app/api/webhooks/stripe/route.ts`**: `console.log` para eventos no manejados → Considerar eliminar en prod
- **`app/api/businesses/[slug]/bookings/route.ts`**: `console.error` en catch → OK

---

## 9. Estructura de Carpetas

- Estructura actual es razonable
- Los componentes del dashboard podrían vivir en `app/dashboard/negocio/[slug]/_components/` para colocation

---

## Plan de Implementación (Prioridad)

1. ✅ Habilitar Turbopack (quitar --webpack)
2. ✅ Eliminar dependencias no usadas (react-big-calendar, @tanstack/react-query)
3. ✅ Optimizar WeekCalendarView (useMemo, React.memo)
4. ✅ Optimizar BusinessDashboardContent (useMemo, useCallback)
5. ✅ Optimizar BaseClientesView y SalesFacturadasView (useMemo)
6. ✅ Agregar filtro de fechas al fetch de bookings
7. ⏳ Corregir dependencias de useEffect en dashboard/page.tsx
