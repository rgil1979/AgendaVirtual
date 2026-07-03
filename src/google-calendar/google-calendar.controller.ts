import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  Delete,
  UseGuards,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { GoogleCalendarService } from './google-calendar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

interface RequestWithUser extends Request {
  user: { id: string; username: string };
}

@Controller('google-calendar')
export class GoogleCalendarController {
  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('auth-url')
  getAuthUrl() {
    return { url: this.googleCalendarService.getAuthUrl() };
  }

  @Get('callback')
  async handleCallback(@Query('code') code: string, @Res() res: Response) {
    const client = this.googleCalendarService.createOAuthClient();
    const { tokens } = await client.getToken(code);
    const usuario = await this.prisma.usuario.findFirst();
    if (!usuario) {
      return res.redirect(`${process.env['FRONTEND_URL']}/turnos?gcal=error`);
    }
    await this.googleCalendarService.saveTokens(usuario.id, {
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token!,
      expiry_date: tokens.expiry_date!,
    });
    return res.redirect(`${process.env['FRONTEND_URL']}/turnos?gcal=connected`);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus(@Req() req: RequestWithUser) {
    const connected = await this.googleCalendarService.isConnected(req.user.id);
    return { connected };
  }

  // Nuevo endpoint: devuelve los eventos de Google Calendar de un mes
  @UseGuards(JwtAuthGuard)
  @Get('eventos')
  async getEventos(
    @Req() req: RequestWithUser,
    @Query('anio', ParseIntPipe) anio: number,
    @Query('mes', ParseIntPipe) mes: number,
  ) {
    return this.googleCalendarService.getEventosDelMes(req.user.id, anio, mes);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('disconnect')
  @HttpCode(200)
  async disconnect(@Req() req: RequestWithUser) {
    await this.googleCalendarService.disconnectGoogle(req.user.id);
    return { message: 'Google Calendar desconectado' };
  }
}
