import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevelopmentStage } from './entities/development_stages.entity';
import { StageLike } from './entities/stage_like.entity';
import { User } from './entities/user.entity';
import { DevelopmentStagesController } from './development_stages.ssr.controller';
import { DevelopmentStagesApiController } from './development_stages.api.controller';
import { UsersApiController } from './users.api.controller';
import { DevelopmentStagesService } from './development_stages.service';
import { UsersService } from './development_stages.users.service';
import { MinioService } from './services/minio.service';
import { TypeOrmDevelopmentStagesRepository } from './repositories/typeorm-development_stages.repository';
import { TypeOrmUsersRepository } from './repositories/typeorm-users.repository';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([DevelopmentStage, StageLike, User]),
    AuthModule, 
  ],
  controllers: [
    DevelopmentStagesController,
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