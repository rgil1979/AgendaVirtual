import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreatePacienteDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  apellido!: string;

  @IsString()
  @IsNotEmpty()
  dni!: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  telefonoPaciente?: string;

  @IsOptional()
  @IsString()
  nombrePadre?: string;

  @IsOptional()
  @IsString()
  telefonoPadre?: string;

  @IsOptional()
  @IsString()
  nombreMadre?: string;

  @IsOptional()
  @IsString()
  telefonoMadre?: string;

  @IsOptional()
  @IsString()
  nombreOtroFamiliar?: string;

  @IsOptional()
  @IsString()
  telefonoOtroFamiliar?: string;

  @IsOptional()
  @IsString()
  domicilio?: string;

  @IsOptional()
  @IsString()
  motivoConsulta?: string;

  @IsOptional()
  @IsString()
  datosEscolares?: string;

  
  @IsOptional()
  @IsInt()
  @Type(() => Number) 
  @Min(1900)
  @Max(2100)
  anioInicioConsulta?: number;

  @IsOptional()
  @IsString()
  obraSocial?: string;

  @IsOptional()
  @IsString()
  numeroAfiliado?: string;

  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
