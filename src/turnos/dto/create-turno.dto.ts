import {
  IsMongoId,
  IsNotEmpty,
  IsDateString,
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsIn,
  Matches,
} from 'class-validator';

export class CreateTurnoDto {
  @IsMongoId()
  pacienteId!: string;

  @IsDateString()
  @IsNotEmpty()
  fecha!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'hora debe tener formato HH:MM' })
  hora!: string;
}

export class CreateTurnoRecurrenteDto {
  @IsMongoId()
  pacienteId!: string;

  // 0=Sunday … 6=Saturday
  @IsInt()
  @IsIn([0, 1, 2, 3, 4, 5, 6])
  diaDeSemana!: number;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'hora debe tener formato HH:MM' })
  hora!: string;

  @IsInt()
  anio!: number;

  @IsInt()
  @IsIn([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  mes!: number;

  @IsOptional()
  @IsBoolean()
  omitirConflictos?: boolean;
}
