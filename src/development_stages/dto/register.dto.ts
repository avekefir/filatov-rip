import { IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: 'Логин должен быть не менее 3 символов' })
  @MaxLength(50)
  username: string;

  @IsString()
  @MinLength(3, { message: 'Пароль должен быть не менее 3 символов' })
  @MaxLength(100)
  password: string;

  @IsString()
  @MinLength(3, { message: 'Имя должно быть не менее 3 символов' })
  @MaxLength(150)
  fullName: string;
}