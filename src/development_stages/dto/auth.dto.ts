import { IsString, MinLength } from 'class-validator';

export class AuthDto {
  @IsString()
  @MinLength(3, { message: 'Логин должен быть не менее 3 символов' })
  username: string;

  @IsString()
  @MinLength(3, { message: 'Пароль должен быть не менее 3 символов' })
  password: string;
}