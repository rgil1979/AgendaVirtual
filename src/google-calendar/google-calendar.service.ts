import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { google } from 'googleapis';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(private readonly prisma: PrismaService) {}

  createOAuthClient() {
    return new google.auth.OAuth2(
      process.env['GOOGLE_CLIENT_ID'],
      process.env['GOOGLE_CLIENT_SECRET'],
      process.env['GOOGLE_REDIRECT_URI'],
    );
  }

  getAuthUrl(): string {
    const client = this.createOAuthClient();
    return client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar.readonly'],
    });
  }

  async saveTokens(
    usuarioId: string,
    tokens: { access_token: string; refresh_token: string; expiry_date: number },
  ) {
    return this.prisma.googleCalendarToken.upsert({
      where: { usuarioId },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: new Date(tokens.expiry_date),
      },
      create: {
        usuarioId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: new Date(tokens.expiry_date),
      },
    });
  }

  async getTokens(usuarioId: string | undefined | null) {
    if (!usuarioId) return null;
    return this.prisma.googleCalendarToken.findUnique({ where: { usuarioId } });
  }

  async disconnectGoogle(usuarioId: string) {
    if (!usuarioId) return;
    await this.prisma.googleCalendarToken.deleteMany({ where: { usuarioId } });
  }

  async isConnected(usuarioId: string | undefined | null): Promise<boolean> {
    if (!usuarioId) return false;
    const token = await this.getTokens(usuarioId);
    return !!token;
  }

  async getAuthedClient(usuarioId: string | undefined | null) {
    if (!usuarioId) return null;
    const token = await this.getTokens(usuarioId);
    if (!token) return null;

    const client = this.createOAuthClient();
    client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      expiry_date: token.expiryDate.getTime(),
    });

    client.on('tokens', async (newTokens) => {
      if (newTokens.access_token) {
        await this.prisma.googleCalendarToken.update({
          where: { usuarioId },
          data: {
            accessToken: newTokens.access_token,
            expiryDate: new Date(newTokens.expiry_date ?? Date.now() + 3600000),
          },
        });
      }
    });

    return client;
  }

  // ── Leer eventos de Google Calendar para un mes dado ─────────────────────
  async getEventosDelMes(
    usuarioId: string | undefined | null,
    anio: number,
    mes: number,
  ): Promise<{ id: string; titulo: string; fecha: string; hora: string }[]> {
    if (!usuarioId) return [];
    const client = await this.getAuthedClient(usuarioId);
    if (!client) return [];

    const calendarApi = google.calendar({ version: 'v3', auth: client as any });
    const tokenData = await this.getTokens(usuarioId);
    const calendarId = tokenData?.calendarId ?? 'primary';

    const desde = new Date(anio, mes - 1, 1);
    const hasta = new Date(anio, mes, 0, 23, 59, 59, 999);

    try {
      const res = await calendarApi.events.list({
        calendarId,
        timeMin: desde.toISOString(),
        timeMax: hasta.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250,
      });

      return (res.data.items ?? [])
        .filter((e) => e.start?.dateTime) // solo eventos con hora (no día completo)
        .map((e) => {
          const start = new Date(e.start!.dateTime!);
          return {
            id: e.id ?? '',
            titulo: e.summary ?? '(sin título)',
            fecha: start.toISOString().split('T')[0]!,
            hora: start.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }),
          };
        });
    } catch (err) {
      this.logger.error('Error al leer eventos de Google Calendar', err);
      return [];
    }
  }
}
