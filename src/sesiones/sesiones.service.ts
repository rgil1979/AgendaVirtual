import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';

@Injectable()
export class SesionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSesionDto) {
    return this.prisma.sesion.create({
      data: {
        ...dto,
        fecha: new Date(dto.fecha),
        asistio: dto.asistio ?? false,
        pago: dto.pago ?? false,
      },
    });
  }

  async findByPaciente(
    pacienteId: string,
    params: {
      desde?: string;
      hasta?: string;
      estadoPago?: 'todos' | 'pagados' | 'pendientes';
    },
  ) {
    const { desde, hasta, estadoPago = 'todos' } = params;

    const sesiones = await this.prisma.sesion.findMany({
      where: {
        pacienteId,
        ...(desde || hasta
          ? {
              fecha: {
                ...(desde ? { gte: new Date(desde) } : {}),
                ...(hasta ? { lte: new Date(hasta) } : {}),
              },
            }
          : {}),
        ...(estadoPago === 'pagados'
          ? { pago: true }
          : estadoPago === 'pendientes'
            ? { pago: false }
            : {}),
      },
      orderBy: { fecha: 'desc' },
    });

    const deudaPendiente = sesiones
      .filter((s) => !s.pago)
      .reduce((acc, s) => acc + (s.monto ?? 0), 0);

    return { sesiones, deudaPendiente };
  }

  async findOne(id: string) {
    const sesion = await this.prisma.sesion.findUnique({ where: { id } });
    if (!sesion) throw new NotFoundException(`Sesión ${id} no encontrada`);
    return sesion;
  }

  async update(id: string, dto: UpdateSesionDto) {
    await this.findOne(id);
    return this.prisma.sesion.update({
      where: { id },
      data: {
        ...dto,
        fecha: dto.fecha ? new Date(dto.fecha) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sesion.delete({ where: { id } });
  }
}
