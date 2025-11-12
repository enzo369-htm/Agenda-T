import { Resend } from 'resend';
import { formatDate, formatPrice } from '../utils';

// Lazy initialization para evitar errores durante el build
let resend: Resend | null = null;

function getResendClient() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY || 'dummy_key_for_build';
    resend = new Resend(apiKey);
  }
  return resend;
}

export interface BookingEmailData {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  businessName: string;
  serviceName: string;
  startTime: Date;
  endTime: Date;
  price: number;
  employeeName?: string;
  businessAddress?: string;
  businessPhone?: string;
  notes?: string;
}

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  const subject = `✅ Reserva confirmada en ${data.businessName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #6b7280; }
          .detail-value { color: #111827; margin-top: 5px; }
          .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Tu reserva está confirmada!</h1>
          </div>
          <div class="content">
            <p>Hola ${data.clientName},</p>
            <p>Tu reserva en <strong>${data.businessName}</strong> ha sido confirmada exitosamente.</p>
            
            <div class="booking-details">
              <div class="detail-row">
                <div class="detail-label">Servicio</div>
                <div class="detail-value">${data.serviceName}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Fecha y Hora</div>
                <div class="detail-value">${formatDate(data.startTime, 'long')} a las ${formatDate(data.startTime, 'time')}</div>
              </div>
              ${data.employeeName ? `
              <div class="detail-row">
                <div class="detail-label">Profesional</div>
                <div class="detail-value">${data.employeeName}</div>
              </div>
              ` : ''}
              <div class="detail-row">
                <div class="detail-label">Precio</div>
                <div class="detail-value">${formatPrice(data.price)}</div>
              </div>
              ${data.businessAddress ? `
              <div class="detail-row">
                <div class="detail-label">Dirección</div>
                <div class="detail-value">${data.businessAddress}</div>
              </div>
              ` : ''}
              ${data.businessPhone ? `
              <div class="detail-row">
                <div class="detail-label">Teléfono</div>
                <div class="detail-value">${data.businessPhone}</div>
              </div>
              ` : ''}
            </div>
            
            ${data.notes ? `<p><strong>Notas:</strong> ${data.notes}</p>` : ''}
            
            <p>Te enviaremos un recordatorio antes de tu cita.</p>
            
            <p style="color: #6b7280; font-size: 14px;">
              Si necesitas cancelar o reprogramar, por favor contacta al negocio directamente.
            </p>
          </div>
          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>© ${new Date().getFullYear()} Agenda Turnos Pro. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const client = getResendClient();
    await client.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@agendaturnospro.com',
      to: data.clientEmail,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendBookingReminderEmail(data: BookingEmailData) {
  const subject = `🔔 Recordatorio: Tu cita en ${data.businessName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .highlight { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Recordatorio de tu cita</h1>
          </div>
          <div class="content">
            <p>Hola ${data.clientName},</p>
            
            <div class="highlight">
              <strong>Te recordamos que tienes una cita próximamente:</strong>
            </div>
            
            <div class="booking-details">
              <p><strong>Negocio:</strong> ${data.businessName}</p>
              <p><strong>Servicio:</strong> ${data.serviceName}</p>
              <p><strong>Fecha:</strong> ${formatDate(data.startTime, 'long')}</p>
              <p><strong>Hora:</strong> ${formatDate(data.startTime, 'time')}</p>
              ${data.employeeName ? `<p><strong>Profesional:</strong> ${data.employeeName}</p>` : ''}
              ${data.businessAddress ? `<p><strong>Dirección:</strong> ${data.businessAddress}</p>` : ''}
            </div>
            
            <p>¡Te esperamos!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Agenda Turnos Pro</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const client = getResendClient();
    await client.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@agendaturnospro.com',
      to: data.clientEmail,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return { success: false, error };
  }
}

export async function sendBookingCancellationEmail(data: BookingEmailData) {
  const subject = `❌ Reserva cancelada en ${data.businessName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reserva Cancelada</h1>
          </div>
          <div class="content">
            <p>Hola ${data.clientName},</p>
            <p>Tu reserva en <strong>${data.businessName}</strong> para el ${formatDate(data.startTime, 'long')} a las ${formatDate(data.startTime, 'time')} ha sido cancelada.</p>
            <p>Si esto fue un error o deseas reprogramar, por favor contacta directamente al negocio.</p>
            <p>¡Esperamos verte pronto!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Agenda Turnos Pro</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const client = getResendClient();
    await client.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@agendaturnospro.com',
      to: data.clientEmail,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return { success: false, error };
  }
}

