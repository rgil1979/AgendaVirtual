import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTurnoDto, CreateTurnoRecurrenteDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';

const DURACION_MINUTOS = 40;

function toMinutes(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function overlaps(horaA: string, horaB: string): boolean {
  return Math.abs(toMinutes(horaA) - toMinutes(horaB)) < DURACION_MINUTOS;
}

function parseFechaLocal(fechaStr: string): Date {
  const [anio, mes, dia] = fechaStr.split('-').map(Number);
  return new Date(anio!, mes! - 1, dia!);
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

@Injectable()
export class TurnosService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkOverlap(fecha: Date, hora: string, excludeId?: string): Promise<void> {
    const turnosDelDia = await this.prisma.turno.findMany({
      where: {
        fecha: { gte: startOfDay(fecha), lte: endOfDay(fecha) },
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    const conflict = turnosDelDia.find((t) => overlaps(t.hora, hora));
    if (conflict) {
      throw new ConflictException(
        `Superposición de horario con turno existente a las ${conflict.hora}`,
      );
    }
  }

  async create(dto: CreateTurnoDto) {
    const [anio, mes, dia] = dto.fecha.split("-").map(Number);
    const fecha = new Date(anio, mes - 1, dia);

    await this.checkOverlap(fecha, dto.hora);
    return this.prisma.turno.create({ data: { ...dto, fecha } });
  }

  async createRecurrente(dto: CreateTurnoRecurrenteDto) {
    const { pacienteId, diaDeSemana, hora, anio, mes, omitirConflictos = false } = dto;
    const primero = new Date(anio, mes - 1, 1);
    const ultimo = new Date(anio, mes, 0);

    const fechas: Date[] = [];
    for (let d = new Date(primero); d <= ultimo; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === diaDeSemana) fechas.push(new Date(d));
    }

    const created = [];
    const skipped: string[] = [];

    for (const fecha of fechas) {
      try {
        await this.checkOverlap(fecha, hora);
        const turno = await this.prisma.turno.create({ data: { pacienteId, fecha, hora } });
        created.push(turno);
      } catch (e) {
        if (omitirConflictos && e instanceof ConflictException) {
          skipped.push(fecha.toISOString().split('T')[0] ?? '');
        } else {
          throw e;
        }
      }
    }

    return { created, skipped };
  }

  async findByMes(anio: number, mes: number) {
    const desde = new Date(anio, mes - 1, 1);
    const hasta = new Date(anio, mes, 0, 23, 59, 59, 999);
    return this.prisma.turno.findMany({
      where: { fecha: { gte: desde, lte: hasta } },
      include: { paciente: { select: { nombre: true, apellido: true } } },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    });
  }

  async findOne(id: string) {
    const turno = await this.prisma.turno.findUnique({
      where: { id },
      include: { paciente: { select: { nombre: true, apellido: true } } },
    });
    if (!turno) throw new NotFoundException(`Turno ${id} no encontrado`);
    return turno;
  }

  async update(id: string, dto: UpdateTurnoDto) {
    const turno = await this.findOne(id);
    const nuevaFecha = dto.fecha ? parseFechaLocal(dto.fecha) : turno.fecha;
    const nuevaHora = dto.hora ?? turno.hora;
    if (dto.fecha || dto.hora) {
      await this.checkOverlap(nuevaFecha, nuevaHora, id);
    }
    return this.prisma.turno.update({
      where: { id },
      data: { fecha: nuevaFecha, hora: nuevaHora },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.turno.delete({ where: { id } });
  }

  async removeByPaciente(pacienteId: string) {
    return this.prisma.turno.deleteMany({ where: { pacienteId } });
  }
}
