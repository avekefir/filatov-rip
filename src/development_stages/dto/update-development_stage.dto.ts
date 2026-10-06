import { IsString, IsNumber, Min, MinLength, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDevelopmentStageDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  stageName?: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  stageDescription?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  costPerHour?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxTeamSize?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  video?: string;
}