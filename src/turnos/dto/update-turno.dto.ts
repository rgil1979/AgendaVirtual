import { IsOptional, IsDateString, IsString, Matches } from 'class-validator';

export class UpdateTurnoDto {
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'hora debe tener formato HH:MM' })
  hora?: string;
}
