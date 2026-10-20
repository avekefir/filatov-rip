import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionModule } from './session.module';
import { User } from '../development_stages/entities/user.entity';
import { SessionGuard } from './guards/session.guard'; // <-- импорт

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    SessionModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionGuard], // <-- добавляем
  exports: [AuthService, SessionGuard],  // <-- экспортируем
})
export class AuthModule {}