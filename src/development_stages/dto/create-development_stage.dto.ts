import { IsString, IsNumber, Min, MinLength, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDevelopmentStageDto {
  @IsString()
  @MinLength(3, { message: 'Название должно быть не менее 3 символов' })
  stageName: string;

  @IsString()
  @MinLength(5, { message: 'Описание должно быть не менее 5 символов' })
  stageDescription: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Стоимость за час не может быть отрицательной' })
  costPerHour: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Размер команды должен быть не менее 1' })
  maxTeamSize: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  video?: string;
}