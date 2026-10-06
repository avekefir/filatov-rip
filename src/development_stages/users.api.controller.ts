import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './development_stages.users.service';
import { RegisterDto } from './dto/register.dto';
import { AuthDto } from './dto/auth.dto';

@Controller('api/users')
export class UsersApiController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.usersService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: AuthDto) {
    return this.usersService.login(dto);
  }

  @Post('logout')
  async logout() {
    return this.usersService.logout();
  }
}