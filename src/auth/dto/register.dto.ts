import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'avekefir', description: 'Логин пользователя' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'secret123', description: 'Пароль' })
  @IsString()
  @MinLength(3)
  password: string;

  @ApiProperty({ example: 'Филатов Илья Вячеславович', description: 'ФИО' })
  @IsString()
  fullName: string;
}