import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'avekefir' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  password: string;
}