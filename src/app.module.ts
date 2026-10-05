import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevelopmentStagesModule } from './development_stages/development_stages.module';

@Module({
  imports: [DevelopmentStagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}