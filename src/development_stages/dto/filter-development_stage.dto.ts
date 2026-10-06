import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterDevelopmentStageDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxCostPerHour?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  minTeamSize?: number;
}