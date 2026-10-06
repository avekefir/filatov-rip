import { IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class LikeDto {
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1], { message: 'Значение должно быть 0 (убрать лайк) или 1 (поставить лайк)' })
  value: number;
}