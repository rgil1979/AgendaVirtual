import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { CreateTurnoDto, CreateTurnoRecurrenteDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('turnos')
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  @Post()
  create(@Body() dto: CreateTurnoDto) {
    return this.turnosService.create(dto);
  }

  @Post('recurrente')
  createRecurrente(@Body() dto: CreateTurnoRecurrenteDto) {
    return this.turnosService.createRecurrente(dto);
  }

  @Get('mes')
  findByMes(
    @Query('anio', ParseIntPipe) anio: number,
    @Query('mes', ParseIntPipe) mes: number,
  ) {
    return this.turnosService.findByMes(anio, mes);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.turnosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTurnoDto) {
    return this.turnosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.turnosService.remove(id);
  }

  @Delete('paciente/:pacienteId')
  removeByPaciente(@Param('pacienteId') pacienteId: string) {
    return this.turnosService.removeByPaciente(pacienteId);
  }
}
