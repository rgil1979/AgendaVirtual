import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Post()
  create(@Body() dto: CreatePacienteDto) {
    return this.pacientesService.create(dto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('anioInicio') anioInicio?: string,
    @Query('activo') activo?: string,
    @Query('orderBy') orderBy?: 'apellido' | 'nombre' | 'fechaNacimiento' | 'anioInicioConsulta',
  ) {
    return this.pacientesService.findAll({
      search,
      anioInicio: anioInicio ? parseInt(anioInicio) : undefined,
      activo: activo !== undefined ? activo === 'true' : undefined,
      orderBy,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pacientesService.findOne(id);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.pacientesService.getStats(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePacienteDto) {
    return this.pacientesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pacientesService.remove(id);
  }
}
