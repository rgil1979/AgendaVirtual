import {
  IsMongoId,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateSesionDto {
  @IsMongoId()
  pacienteId!: string;

  @IsDateString()
  @IsNotEmpty()
  fecha!: string;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsBoolean()
  asistio?: boolean;

  @IsOptional()
  @IsBoolean()
  pago?: boolean;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monto?: number;

  @IsOptional()
  @IsString()
  numeroFactura?: string;
}
