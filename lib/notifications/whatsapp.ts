import { formatDate, formatPrice } from '../utils';

export interface WhatsAppMessageData {
  phone: string;
  clientName: string;
  businessName: string;
  serviceName: string;
  startTime: Date;
  price: number;
  employeeName?: string;
  businessAddress?: string;
}

/**
 * Genera un link de WhatsApp con un mensaje prellenado
 * Este es el método más simple y no requiere API de Twilio
 */
export function generateWhatsAppLink(data: WhatsAppMessageData, type: 'confirmation' | 'reminder' | 'cancellation') {
  let message = '';
  
  if (type === 'confirmation') {
    message = `¡Hola ${data.clientName}! 👋\n\nTu reserva en *${data.businessName}* ha sido confirmada ✅\n\n📅 Fecha: ${formatDate(data.startTime, 'long')}\n⏰ Hora: ${formatDate(data.startTime, 'time')}\n💇 Servicio: ${data.serviceName}\n${data.employeeName ? `👤 Profesional: ${data.employeeName}\n` : ''}💰 Precio: ${formatPrice(data.price)}\n${data.businessAddress ? `📍 Dirección: ${data.businessAddress}\n` : ''}\n¡Te esperamos! 😊`;
  } else if (type === 'reminder') {
    message = `🔔 Recordatorio ${data.clientName}\n\nTienes una cita en *${data.businessName}*\n\n📅 ${formatDate(data.startTime, 'long')}\n⏰ ${formatDate(data.startTime, 'time')}\n💇 ${data.serviceName}\n\n¡No olvides asistir! 😊`;
  } else if (type === 'cancellation') {
    message = `Hola ${data.clientName},\n\nTu reserva en *${data.businessName}* para el ${formatDate(data.startTime, 'long')} ha sido cancelada.\n\nSi necesitas reprogramar, contáctanos.`;
  }

  // Remover el + del número de teléfono si existe
  const cleanPhone = data.phone.replace('+', '');
  
  // Codificar el mensaje para URL
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Enviar mensaje de WhatsApp usando Twilio (opcional)
 * Requiere cuenta y configuración de Twilio
 */
export async function sendWhatsAppMessage(data: WhatsAppMessageData, type: 'confirmation' | 'reminder' | 'cancellation') {
  // Si no hay credenciales de Twilio, devolver el link
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn('Twilio no configurado, generando link de WhatsApp en su lugar');
    return {
      success: true,
      method: 'link',
      link: generateWhatsAppLink(data, type),
    };
  }

  try {
    // Aquí iría la implementación con Twilio si se configura
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // Por ahora, devolvemos el link
    return {
      success: true,
      method: 'link',
      link: generateWhatsAppLink(data, type),
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error };
  }
}

/**
 * Enviar recordatorio de reserva por WhatsApp
 */
export async function sendBookingReminderWhatsApp(data: WhatsAppMessageData) {
  return sendWhatsAppMessage(data, 'reminder');
}

/**
 * Enviar confirmación de reserva por WhatsApp
 */
export async function sendBookingConfirmationWhatsApp(data: WhatsAppMessageData) {
  return sendWhatsAppMessage(data, 'confirmation');
}

/**
 * Enviar cancelación de reserva por WhatsApp
 */
export async function sendBookingCancellationWhatsApp(data: WhatsAppMessageData) {
  return sendWhatsAppMessage(data, 'cancellation');
}

