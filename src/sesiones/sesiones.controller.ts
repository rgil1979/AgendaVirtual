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
import { SesionesService } from './sesiones.service';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sesiones')
export class SesionesController {
  constructor(private readonly sesionesService: SesionesService) {}

  @Post()
  create(@Body() dto: CreateSesionDto) {
    return this.sesionesService.create(dto);
  }

  @Get('paciente/:pacienteId')
  findByPaciente(
    @Param('pacienteId') pacienteId: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('estadoPago') estadoPago?: 'todos' | 'pagados' | 'pendientes',
  ) {
    return this.sesionesService.findByPaciente(pacienteId, { desde, hasta, estadoPago });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sesionesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSesionDto) {
    return this.sesionesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sesionesService.remove(id);
  }
}
