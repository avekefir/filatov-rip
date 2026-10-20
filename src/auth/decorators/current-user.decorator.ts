import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../development_stages/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Здесь TypeScript сам поймет, что это User
  },
);