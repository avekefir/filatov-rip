import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevStagesService } from './dev-stages.service';
import { DevStagesController } from './dev-stages.controller';
import { DevStage } from './entities/dev-stage.entity';
import { StageLike } from './entities/stage-like.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DevStage, StageLike, User])],
  controllers: [DevStagesController],
  providers: [DevStagesService],
})
export class DevStagesModule {}