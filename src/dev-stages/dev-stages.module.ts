import { Module } from '@nestjs/common';
import { DevStagesService } from './dev-stages.service';
import { DevStagesController } from './dev-stages.controller';

@Module({
  controllers: [DevStagesController],
  providers: [DevStagesService],
})
export class DevStagesModule {}