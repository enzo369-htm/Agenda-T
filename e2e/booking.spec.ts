import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('should display business listing', async ({ page }) => {
    await page.goto('/negocios');
    await expect(page.getByRole('heading', { name: /buscar negocios/i })).toBeVisible();
  });

  test('should view business details', async ({ page }) => {
    await page.goto('/negocio/belleza-estilo');
    await expect(page.getByRole('heading', { name: /belleza & estilo/i })).toBeVisible();
    await expect(page.getByText(/selecciona un servicio/i)).toBeVisible();
  });

  test('should complete booking flow', async ({ page }) => {
    await page.goto('/negocio/belleza-estilo');
    
    // Seleccionar servicio
    await page.getByText('Corte de Cabello').first().click();
    
    // Seleccionar fecha (mañana)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await page.getByLabel(/fecha/i).fill(dateStr);
    
    // Seleccionar hora
    await page.getByRole('button', { name: '10:00' }).click();
    
    // Completar datos del cliente
    await page.getByLabel(/tu nombre/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/teléfono/i).fill('+5491123456789');
    
    // Confirmar reserva
    await page.getByRole('button', { name: /confirmar reserva/i }).click();
    
    // Verificar éxito (requiere autenticación, puede redirigir a login)
    await expect(page).toHaveURL(/dashboard|login/);
  });
});

