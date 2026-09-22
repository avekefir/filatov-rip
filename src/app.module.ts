import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevStagesModule } from './dev-stages/dev-stages.module';
import { User } from './dev-stages/entities/user.entity';
import { DevStage } from './dev-stages/entities/dev-stage.entity';
import { StageLike } from './dev-stages/entities/stage-like.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: parseInt(config.get('DB_PORT', '5433'), 10),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [User, DevStage, StageLike],
        synchronize: false,
      }),
    }),
    DevStagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}