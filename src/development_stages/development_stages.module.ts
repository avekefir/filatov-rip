import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Сущности
import { DevelopmentStage } from './entities/development_stages.entity';
import { StageLike } from './entities/stage_like.entity';
import { User } from './entities/user.entity';

// SSR-контроллер (оставляем для Lab 1 и Lab 2)
import { DevelopmentStagesController } from './development_stages.ssr.controller';

// API-контроллеры (Lab 3)
import { DevelopmentStagesApiController } from './development_stages.api.controller';
import { UsersApiController } from './users.api.controller';

// Сервисы
import { DevelopmentStagesService } from './development_stages.service';
import { UsersService } from './development_stages.users.service';
import { MinioService } from './services/minio.service';

// Репозитории
import { TypeOrmDevelopmentStagesRepository } from './repositories/typeorm-development_stages.repository';
import { TypeOrmUsersRepository } from './repositories/typeorm-users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DevelopmentStage, StageLike, User])],
  controllers: [
    // SSR (шаблоны Lab 1/2)
    DevelopmentStagesController,
    // REST API (Lab 3)
    DevelopmentStagesApiController,
    UsersApiController,
  ],
  providers: [
    DevelopmentStagesService,
    UsersService,
    MinioService,
    TypeOrmDevelopmentStagesRepository,
    TypeOrmUsersRepository,
  ],
})
export class DevelopmentStagesModule {}