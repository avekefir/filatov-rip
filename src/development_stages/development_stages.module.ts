import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevelopmentStagesService } from './development_stages.service';
import { DevelopmentStagesController } from './development_stages.controller';
import { DevelopmentStage } from './entities/development_stages.entity';
import { StageLike } from './entities/stage_like.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DevelopmentStage, StageLike, User])],
  controllers: [DevelopmentStagesController],
  providers: [DevelopmentStagesService],
})
export class DevelopmentStagesModule {}