import { Body, Controller, Post, Res, Req, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import express from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';


@ApiTags('Аутентификация (Auth)')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Вход в систему (устанавливает куку sessionId)' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { sessionId, user } = await this.authService.login(dto);
    
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: false, 
      maxAge: 3600000, 
      sameSite: 'lax',
    });

    // Отдаем только пользователя, без сообщений
    return user; 
  }

  @Post('logout')
  @ApiOperation({ summary: 'Выход из системы (удаляет куку и сессию)' })
  async logout(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      await this.authService.logout(sessionId);
    }
    
    res.clearCookie('sessionId');
    
    // Возвращаем пустой объект (статус 200 OK автоматически)
    return {}; 
  }
}