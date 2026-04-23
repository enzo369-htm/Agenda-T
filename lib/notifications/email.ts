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
            <p>© ${new Date().getFullYear()} Turnos In. Todos los derechos reservados.</p>
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

export interface BusinessNotificationData {
  bookingId: string;
  businessOwnerEmail: string;
  businessName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  startTime: Date;
  endTime: Date;
  price: number;
  employeeName?: string;
  notes?: string;
  dashboardUrl: string;
}

export async function sendNewBookingNotificationToBusiness(data: BusinessNotificationData) {
  const subject = `📅 Nueva reserva en ${data.businessName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #6b7280; font-size: 14px; }
          .detail-value { color: #111827; margin-top: 5px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          .highlight { background: #d1fae5; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Nueva Reserva</h1>
          </div>
          <div class="content">
            <p>¡Hola!</p>
            <p>Has recibido una nueva reserva en <strong>${data.businessName}</strong>.</p>
            
            <div class="highlight">
              <strong>Detalles de la reserva:</strong>
            </div>
            
            <div class="booking-details">
              <div class="detail-row">
                <div class="detail-label">Cliente</div>
                <div class="detail-value">${data.clientName}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Email</div>
                <div class="detail-value">${data.clientEmail}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Teléfono</div>
                <div class="detail-value">${data.clientPhone}</div>
              </div>
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
              ${data.notes ? `
              <div class="detail-row">
                <div class="detail-label">Notas</div>
                <div class="detail-value">${data.notes}</div>
              </div>
              ` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.dashboardUrl}" class="button">Ver en Dashboard</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              Puedes gestionar esta reserva desde tu panel de control.
            </p>
          </div>
          <div class="footer">
            <p>Este es un email automático de Turnos In.</p>
            <p>© ${new Date().getFullYear()} Turnos In. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const client = getResendClient();
    await client.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@agendaturnospro.com',
      to: data.businessOwnerEmail,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending business notification email:', error);
    return { success: false, error };
  }
}

export interface ReminderWithConfirmationData {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  businessName: string;
  serviceName: string;
  startTime: Date;
  endTime: Date;
  price: number;
  confirmUrl: string;
  cancelUrl: string;
  employeeName?: string;
  businessAddress?: string;
  businessPhone?: string;
}

export async function sendBookingReminderWithConfirmation(data: ReminderWithConfirmationData) {
  const subject = `🔔 Confirmá tu turno en ${data.businessName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .detail-row { padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: bold; color: #6b7280; font-size: 13px; text-transform: uppercase; }
          .detail-value { color: #111827; margin-top: 4px; font-size: 15px; }
          .buttons { text-align: center; margin: 30px 0; }
          .btn { display: inline-block; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0 8px; }
          .btn-confirm { background: #10b981; color: white; }
          .btn-cancel { background: #ef4444; color: white; }
          .highlight { background: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; font-size: 15px; }
          .footer { text-align: center; color: #9ca3af; font-size: 13px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">🔔 Recordatorio de turno</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">Confirmá tu asistencia</p>
          </div>
          <div class="content">
            <p>Hola <strong>${data.clientName}</strong>,</p>

            <div class="highlight">
              Tenés un turno programado en <strong>${data.businessName}</strong> para mañana. Por favor confirmá si vas a asistir.
            </div>

            <div class="booking-details">
              <div class="detail-row">
                <div class="detail-label">Servicio</div>
                <div class="detail-value">${data.serviceName}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Fecha y hora</div>
                <div class="detail-value">${formatDate(data.startTime, 'long')} a las ${formatDate(data.startTime, 'time')}</div>
              </div>
              ${data.employeeName ? `
              <div class="detail-row">
                <div class="detail-label">Profesional</div>
                <div class="detail-value">${data.employeeName}</div>
              </div>` : ''}
              <div class="detail-row">
                <div class="detail-label">Precio</div>
                <div class="detail-value">${formatPrice(data.price)}</div>
              </div>
              ${data.businessAddress ? `
              <div class="detail-row">
                <div class="detail-label">Dirección</div>
                <div class="detail-value">${data.businessAddress}</div>
              </div>` : ''}
              ${data.businessPhone ? `
              <div class="detail-row">
                <div class="detail-label">Teléfono del negocio</div>
                <div class="detail-value">${data.businessPhone}</div>
              </div>` : ''}
            </div>

            <div class="buttons">
              <a href="${data.confirmUrl}" class="btn btn-confirm">✅ Confirmo mi asistencia</a>
              <br><br>
              <a href="${data.cancelUrl}" class="btn btn-cancel">❌ Necesito cancelar</a>
            </div>

            <p style="color: #6b7280; font-size: 13px; text-align: center;">
              Si no podés hacer click en los botones, copiá este link en tu navegador:<br>
              <a href="${data.confirmUrl}" style="color: #0ea5e9; word-break: break-all;">${data.confirmUrl}</a>
            </p>
          </div>
          <div class="footer">
            <p>Este es un email automático de Turnos In.</p>
            <p>&copy; ${new Date().getFullYear()} Turnos In. Todos los derechos reservados.</p>
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
    console.error('Error sending reminder with confirmation email:', error);
    return { success: false, error };
  }
}

export interface ClientActionNotificationData {
  businessOwnerEmail: string;
  businessName: string;
  clientName: string;
  serviceName: string;
  startTime: Date;
  action: 'confirmed' | 'cancelled';
  dashboardUrl: string;
}

export async function sendClientActionNotificationToBusiness(data: ClientActionNotificationData) {
  const isConfirm = data.action === 'confirmed';
  const subject = isConfirm
    ? `✅ ${data.clientName} confirmó su turno`
    : `❌ ${data.clientName} canceló su turno`;

  const headerBg = isConfirm
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${headerBg}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; }
          .footer { text-align: center; color: #9ca3af; font-size: 13px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">${isConfirm ? '✅ Turno confirmado' : '❌ Turno cancelado'}</h1>
          </div>
          <div class="content">
            <p><strong>${data.clientName}</strong> ${isConfirm ? 'confirmó que va a asistir' : 'canceló'} su turno:</p>
            <div class="info">
              <p><strong>Servicio:</strong> ${data.serviceName}</p>
              <p><strong>Fecha:</strong> ${formatDate(data.startTime, 'long')} a las ${formatDate(data.startTime, 'time')}</p>
            </div>
            ${!isConfirm ? '<p style="color: #ef4444;">El horario queda disponible para nuevas reservas.</p>' : ''}
            <div style="text-align: center; margin: 24px 0;">
              <a href="${data.dashboardUrl}" class="button">Ver en Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Turnos In</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const client = getResendClient();
    await client.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@agendaturnospro.com',
      to: data.businessOwnerEmail,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending client action notification:', error);
    return { success: false, error };
  }
}

export interface DailySummaryData {
  businessOwnerEmail: string;
  businessName: string;
  dashboardUrl: string;
  date: Date;
  totalBookings: number;
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  bookings: Array<{
    clientName: string;
    serviceName: string;
    startTime: Date;
    status: string;
    employeeName?: string;
  }>;
}

export async function sendDailySummaryToBusiness(data: DailySummaryData) {
  const subject = `📊 Resumen de turnos para mañana - ${data.businessName}`;

  const statusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return '<span style="color:#10b981;font-weight:bold;">✅ Confirmado</span>';
      case 'PENDING': return '<span style="color:#f59e0b;font-weight:bold;">⏳ Pendiente</span>';
      case 'CANCELLED': return '<span style="color:#ef4444;font-weight:bold;">❌ Cancelado</span>';
      default: return `<span style="color:#6b7280;">${status}</span>`;
    }
  };

  const bookingRows = data.bookings.map((b) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${formatDate(b.startTime, 'time')}</td>
      <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${b.clientName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${b.serviceName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${b.employeeName || '-'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${statusLabel(b.status)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .stats { display: flex; margin: 20px 0; }
          .stat { flex: 1; text-align: center; padding: 16px; background: white; border-radius: 8px; margin: 0 4px; border: 1px solid #e5e7eb; }
          .stat-number { font-size: 28px; font-weight: bold; }
          .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
          th { background: #f9fafb; padding: 12px 10px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb; }
          .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; }
          .footer { text-align: center; color: #9ca3af; font-size: 13px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">📊 Turnos de mañana</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">${formatDate(data.date, 'long')}</p>
          </div>
          <div class="content">
            <table style="width:100%; border-collapse: separate; border-spacing: 8px 0; background: transparent; border: none; margin: 20px 0;">
              <tr>
                <td style="text-align:center; padding:16px; background:white; border-radius:8px; border:1px solid #e5e7eb;">
                  <div style="font-size:28px; font-weight:bold; color:#111827;">${data.totalBookings}</div>
                  <div style="font-size:12px; color:#6b7280; text-transform:uppercase; margin-top:4px;">Total</div>
                </td>
                <td style="text-align:center; padding:16px; background:white; border-radius:8px; border:1px solid #e5e7eb;">
                  <div style="font-size:28px; font-weight:bold; color:#10b981;">${data.confirmedCount}</div>
                  <div style="font-size:12px; color:#6b7280; text-transform:uppercase; margin-top:4px;">Confirmados</div>
                </td>
                <td style="text-align:center; padding:16px; background:white; border-radius:8px; border:1px solid #e5e7eb;">
                  <div style="font-size:28px; font-weight:bold; color:#f59e0b;">${data.pendingCount}</div>
                  <div style="font-size:12px; color:#6b7280; text-transform:uppercase; margin-top:4px;">Pendientes</div>
                </td>
                <td style="text-align:center; padding:16px; background:white; border-radius:8px; border:1px solid #e5e7eb;">
                  <div style="font-size:28px; font-weight:bold; color:#ef4444;">${data.cancelledCount}</div>
                  <div style="font-size:12px; color:#6b7280; text-transform:uppercase; margin-top:4px;">Cancelados</div>
                </td>
              </tr>
            </table>

            ${data.bookings.length > 0 ? `
            <h3 style="margin: 24px 0 12px;">Detalle de turnos</h3>
            <table>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Profesional</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${bookingRows}
              </tbody>
            </table>
            ` : '<p style="text-align:center; color:#6b7280;">No hay turnos programados para mañana.</p>'}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.dashboardUrl}" class="button">Abrir Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Turnos In</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const client = getResendClient();
    await client.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@agendaturnospro.com',
      to: data.businessOwnerEmail,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending daily summary:', error);
    return { success: false, error };
  }
}

