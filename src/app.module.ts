import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevStagesModule } from './dev-stages/dev-stages.module';

@Module({
  imports: [DevStagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}