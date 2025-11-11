# Guía de Contribución

¡Gracias por tu interés en contribuir a Agenda Turnos Pro! Este documento proporciona pautas para contribuir al proyecto.

## 🚀 Cómo Empezar

1. **Fork** el repositorio
2. **Clone** tu fork:
   ```bash
   git clone https://github.com/tu-usuario/APPAGENDATURNOS.git
   cd APPAGENDATURNOS
   ```
3. **Instala** las dependencias:
   ```bash
   npm install
   ```
4. **Configura** tu entorno de desarrollo (ver README.md)
5. **Crea una rama** para tu feature:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

## 📝 Convenciones de Código

### TypeScript

- Usa TypeScript estricto
- Define tipos para todas las funciones y variables
- Evita `any`, usa `unknown` si es necesario
- Prefiere interfaces sobre types para objetos

### Nombres

- **Componentes**: PascalCase (`Button.tsx`, `UserCard.tsx`)
- **Funciones**: camelCase (`formatDate`, `getUserById`)
- **Constantes**: UPPER_SNAKE_CASE (`API_URL`, `MAX_RETRIES`)
- **Archivos**: kebab-case para páginas (`user-profile.tsx`)

### Estilos

- Usa Tailwind CSS para estilos
- Agrupa clases relacionadas
- Usa el helper `cn()` para clases condicionales
- Evita inline styles a menos que sean dinámicos

### Componentes

```tsx
// ✅ Bueno
export function UserCard({ name, email }: UserCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{name}</h3>
      <p className="text-sm text-gray-600">{email}</p>
    </div>
  );
}

// ❌ Malo
export default ({ name, email }: any) => {
  return <div style={{ padding: '16px' }}>{name}</div>;
};
```

## 🔍 Antes de Enviar un PR

1. **Ejecuta linter y tests**:
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```

2. **Asegúrate** de que tu código compila:
   ```bash
   npm run build
   ```

3. **Escribe tests** para nuevas funcionalidades

4. **Actualiza** la documentación si es necesario

## 📋 Proceso de Pull Request

1. **Actualiza** tu rama con `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Commits** descriptivos siguiendo [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` nueva funcionalidad
   - `fix:` corrección de bug
   - `docs:` cambios en documentación
   - `style:` cambios de formato (no afectan lógica)
   - `refactor:` refactorización de código
   - `test:` agregar o modificar tests
   - `chore:` tareas de mantenimiento

   Ejemplos:
   ```
   feat: add booking cancellation flow
   fix: resolve timezone issue in calendar
   docs: update API documentation
   ```

3. **Push** a tu fork:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```

4. **Abre** un Pull Request en GitHub

5. **Describe** claramente:
   - ¿Qué problema resuelve?
   - ¿Qué cambios incluye?
   - ¿Hay breaking changes?
   - Screenshots si aplica

## 🐛 Reportar Bugs

Usa el template de Issues en GitHub incluyendo:

- **Descripción** clara del bug
- **Pasos** para reproducirlo
- **Comportamiento esperado** vs actual
- **Screenshots** si aplica
- **Entorno**: OS, browser, versión de Node

## 💡 Sugerir Features

Antes de sugerir una funcionalidad:

1. Verifica que no exista ya un issue similar
2. Describe el problema que resuelve
3. Propón una solución
4. Considera alternativas

## 🧪 Testing

### Tests Unitarios

```tsx
// __tests__/lib/utils.test.ts
import { formatPrice } from '@/lib/utils';

describe('formatPrice', () => {
  it('should format price in ARS', () => {
    expect(formatPrice(1000, 'ARS')).toBe('$\xa01000');
  });
});
```

### Tests E2E

```tsx
// e2e/booking.spec.ts
import { test, expect } from '@playwright/test';

test('should complete booking', async ({ page }) => {
  await page.goto('/negocio/belleza-estilo');
  // ... resto del test
});
```

## 📚 Estructura del Proyecto

```
app/          → Páginas y API routes (App Router)
components/   → Componentes React reutilizables
lib/          → Utilidades, validaciones, clientes
prisma/       → Schema y migraciones de BD
types/        → Tipos TypeScript globales
__tests__/    → Tests unitarios
e2e/          → Tests end-to-end
```

## 🔐 Seguridad

Si encuentras una vulnerabilidad de seguridad:

- **NO** abras un issue público
- Envía un email a: security@agendaturnospro.com
- Describe el problema y los pasos para reproducirlo

## 📖 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org/)

## ❓ Preguntas

Si tienes preguntas:

- Revisa la [documentación](./README.md)
- Busca en [Issues existentes](https://github.com/tu-org/repo/issues)
- Abre un nuevo issue con la etiqueta `question`

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones se licenciarán bajo la misma licencia del proyecto.

---

**¡Gracias por contribuir a Agenda Turnos Pro! 🎉**

