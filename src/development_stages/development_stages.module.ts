import { Module } from '@nestjs/common';
import { DevelopmentStagesService } from './development_stages.service';
import { DevelopmentStagesController } from './development_stages.controller';

@Module({
  controllers: [DevelopmentStagesController],
  providers: [DevelopmentStagesService],
})
export class DevelopmentStagesModule {}