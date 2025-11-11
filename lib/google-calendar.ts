import { google } from 'googleapis';

/**
 * Google Calendar Integration
 * 
 * Este módulo proporciona funciones para integrar con Google Calendar.
 * Permite crear, actualizar y eliminar eventos automáticamente cuando se
 * gestionan reservas en la plataforma.
 * 
 * Configuración requerida:
 * - GOOGLE_CALENDAR_CLIENT_ID
 * - GOOGLE_CALENDAR_CLIENT_SECRET
 * - GOOGLE_CALENDAR_REDIRECT_URI
 */

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

/**
 * Crea un cliente OAuth2 de Google
 */
export function getGoogleAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI
  );
}

/**
 * Genera URL de autorización para que el usuario conecte su Google Calendar
 */
export function getAuthorizationUrl(userId: string) {
  const oauth2Client = getGoogleAuthClient();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: userId, // Para identificar al usuario al retornar
    prompt: 'consent', // Forzar pantalla de consentimiento para obtener refresh_token
  });
}

/**
 * Intercambia el código de autorización por tokens de acceso
 */
export async function getTokensFromCode(code: string) {
  const oauth2Client = getGoogleAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Configura el cliente con los tokens del usuario
 */
export function setCredentials(accessToken: string, refreshToken?: string) {
  const oauth2Client = getGoogleAuthClient();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return oauth2Client;
}

/**
 * Crea un evento en Google Calendar
 */
export async function createCalendarEvent({
  accessToken,
  refreshToken,
  summary,
  description,
  startTime,
  endTime,
  location,
  attendees,
}: {
  accessToken: string;
  refreshToken?: string;
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
}) {
  try {
    const oauth2Client = setCredentials(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary,
      description,
      location,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/Argentina/Buenos_Aires',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/Argentina/Buenos_Aires',
      },
      attendees: attendees?.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all', // Enviar notificaciones a los asistentes
    });

    return {
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Actualiza un evento existente en Google Calendar
 */
export async function updateCalendarEvent({
  accessToken,
  refreshToken,
  eventId,
  summary,
  description,
  startTime,
  endTime,
  location,
}: {
  accessToken: string;
  refreshToken?: string;
  eventId: string;
  summary?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
}) {
  try {
    const oauth2Client = setCredentials(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event: any = {};
    if (summary) event.summary = summary;
    if (description) event.description = description;
    if (location) event.location = location;
    if (startTime) {
      event.start = {
        dateTime: startTime.toISOString(),
        timeZone: 'America/Argentina/Buenos_Aires',
      };
    }
    if (endTime) {
      event.end = {
        dateTime: endTime.toISOString(),
        timeZone: 'America/Argentina/Buenos_Aires',
      };
    }

    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: event,
      sendUpdates: 'all',
    });

    return {
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
    };
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Elimina un evento de Google Calendar
 */
export async function deleteCalendarEvent({
  accessToken,
  refreshToken,
  eventId,
}: {
  accessToken: string;
  refreshToken?: string;
  eventId: string;
}) {
  try {
    const oauth2Client = setCredentials(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Obtiene los próximos eventos del calendario
 */
export async function listUpcomingEvents({
  accessToken,
  refreshToken,
  maxResults = 10,
}: {
  accessToken: string;
  refreshToken?: string;
  maxResults?: number;
}) {
  try {
    const oauth2Client = setCredentials(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return {
      success: true,
      events: response.data.items || [],
    };
  } catch (error) {
    console.error('Error listing calendar events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      events: [],
    };
  }
}

/**
 * Sincroniza una reserva con Google Calendar
 * 
 * Esta función debe llamarse cuando:
 * - Se crea una nueva reserva
 * - Se actualiza una reserva existente
 * - Se cancela una reserva
 */
export async function syncBookingWithCalendar({
  booking,
  userTokens,
  action,
}: {
  booking: {
    id: string;
    clientName: string;
    clientEmail: string;
    service: { name: string };
    business: { name: string; address: string };
    startTime: Date;
    endTime: Date;
    googleCalendarEventId?: string | null;
  };
  userTokens: {
    accessToken: string;
    refreshToken?: string;
  };
  action: 'create' | 'update' | 'delete';
}) {
  try {
    if (action === 'create') {
      const result = await createCalendarEvent({
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        summary: `${booking.service.name} - ${booking.business.name}`,
        description: `Reserva para ${booking.clientName}\nEmail: ${booking.clientEmail}`,
        startTime: booking.startTime,
        endTime: booking.endTime,
        location: booking.business.address,
        attendees: [booking.clientEmail],
      });

      return result;
    }

    if (action === 'update' && booking.googleCalendarEventId) {
      const result = await updateCalendarEvent({
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        eventId: booking.googleCalendarEventId,
        summary: `${booking.service.name} - ${booking.business.name}`,
        description: `Reserva para ${booking.clientName}\nEmail: ${booking.clientEmail}`,
        startTime: booking.startTime,
        endTime: booking.endTime,
        location: booking.business.address,
      });

      return result;
    }

    if (action === 'delete' && booking.googleCalendarEventId) {
      const result = await deleteCalendarEvent({
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        eventId: booking.googleCalendarEventId,
      });

      return result;
    }

    return { success: false, error: 'Invalid action or missing event ID' };
  } catch (error) {
    console.error('Error syncing booking with calendar:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verifica si los tokens del usuario son válidos
 */
export async function verifyCredentials(accessToken: string, refreshToken?: string) {
  try {
    const oauth2Client = setCredentials(accessToken, refreshToken);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Intenta obtener el perfil del calendario
    await calendar.calendarList.list({ maxResults: 1 });

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Refresca el access token usando el refresh token
 */
export async function refreshAccessToken(refreshToken: string) {
  try {
    const oauth2Client = getGoogleAuthClient();
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await oauth2Client.refreshAccessToken();
    
    return {
      success: true,
      accessToken: credentials.access_token,
      refreshToken: credentials.refresh_token || refreshToken,
      expiryDate: credentials.expiry_date,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

