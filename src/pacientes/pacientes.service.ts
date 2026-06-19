import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';

export interface PacienteStats {
  totalSesiones: number;
  sesionesAsistidas: number;
  sesionesPagadas: number;
  deudaTotal: number;
  ultimaSesion: Date | null;
}

@Injectable()
export class PacientesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePacienteDto) {
    const exists = await this.prisma.paciente.findUnique({
      where: { dni: dto.dni },
    });
    if (exists) throw new ConflictException(`Ya existe un paciente con DNI ${dto.dni}`);

    return this.prisma.paciente.create({
      data: {
        ...dto,
        fechaNacimiento: dto.fechaNacimiento ? new Date(dto.fechaNacimiento) : undefined,
        activo: dto.activo ?? true,
      },
    });
  }

  findAll(params: {
    search?: string;
    anioInicio?: number;
    activo?: boolean;
    orderBy?: 'apellido' | 'nombre' | 'fechaNacimiento' | 'anioInicioConsulta';
  }) {
    const { search, anioInicio, activo, orderBy = 'apellido' } = params;

    return this.prisma.paciente.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { nombre: { contains: search, mode: 'insensitive' } },
                  { apellido: { contains: search, mode: 'insensitive' } },
                  { dni: { contains: search } },
                ],
              }
            : {},
          anioInicio !== undefined ? { anioInicioConsulta: anioInicio } : {},
          activo !== undefined ? { activo } : {},
        ],
      },
      orderBy: { [orderBy]: 'asc' },
    });
  }

  async findOne(id: string) {
    const paciente = await this.prisma.paciente.findUnique({ where: { id } });
    if (!paciente) throw new NotFoundException(`Paciente ${id} no encontrado`);
    return paciente;
  }

  async update(id: string, dto: UpdatePacienteDto) {
    await this.findOne(id);

    if (dto.dni) {
      const conflict = await this.prisma.paciente.findFirst({
        where: { dni: dto.dni, NOT: { id } },
      });
      if (conflict) throw new ConflictException(`Ya existe un paciente con DNI ${dto.dni}`);
    }

    return this.prisma.paciente.update({
      where: { id },
      data: {
        ...dto,
        fechaNacimiento: dto.fechaNacimiento ? new Date(dto.fechaNacimiento) : undefined,
      },
    });
  }

  // Bug #5 fix: delete paciente + sesiones + turnos in a single transaction
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      await tx.sesion.deleteMany({ where: { pacienteId: id } });
      await tx.turno.deleteMany({ where: { pacienteId: id } });
      return tx.paciente.delete({ where: { id } });
    });
  }

  async getStats(id: string): Promise<PacienteStats> {
    await this.findOne(id);

    const sesiones = await this.prisma.sesion.findMany({
      where: { pacienteId: id },
      orderBy: { fecha: 'desc' },
    });

    const deudaTotal = sesiones
      .filter((s) => !s.pago)
      .reduce((acc, s) => acc + (s.monto ?? 0), 0);

    return {
      totalSesiones: sesiones.length,
      sesionesAsistidas: sesiones.filter((s) => s.asistio).length,
      sesionesPagadas: sesiones.filter((s) => s.pago).length,
      deudaTotal,
      ultimaSesion: sesiones[0]?.fecha ?? null,
    };
  }
}
