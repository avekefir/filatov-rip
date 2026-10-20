import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { User } from '../../development_stages/entities/user.entity'; // Импортируем сущность

// Создаем расширенный интерфейс запроса
export interface RequestWithUser extends Request {
  user: User;
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Указываем TypeScript, что наш запрос теперь имеет тип RequestWithUser
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    
    const sessionId = request.cookies?.sessionId;

    if (!sessionId) {
      throw new UnauthorizedException();
    }

    try {
      const user = await this.authService.validateSession(sessionId);
      
      // Теперь TypeScript не будет ругаться, так как мы объявили это поле в интерфейсе
      request.user = user; 
      
      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}