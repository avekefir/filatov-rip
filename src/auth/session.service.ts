import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class SessionService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    // Подключаемся к Redis (по умолчанию localhost:6379)
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    });

    this.redis.on('error', (err) => {
      console.error('Ошибка Redis:', err);
    });
  }

  // Создать сессию (сохраняет sessionId -> userId на 1 час)
  async create(sessionId: string, userId: number, ttlSec: number = 3600): Promise<void> {
    await this.redis.setex(`session:${sessionId}`, ttlSec, String(userId));
  }

  // Получить ID пользователя по ID сессии
  async getUserId(sessionId: string): Promise<number | null> {
    const userIdStr = await this.redis.get(`session:${sessionId}`);
    return userIdStr ? parseInt(userIdStr, 10) : null;
  }

  // Удалить сессию (при выходе)
  async destroy(sessionId: string): Promise<void> {
    await this.redis.del(`session:${sessionId}`);
  }

  // Закрыть соединение при остановке сервера (чтобы порт не зависал)
  onModuleDestroy() {
    this.redis.disconnect();
  }
}