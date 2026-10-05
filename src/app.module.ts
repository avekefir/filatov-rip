import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevelopmentStagesModule } from './development_stages/development_stages.module';
import { User } from './development_stages/entities/user.entity';
import { DevelopmentStage } from './development_stages/entities/development_stages.entity';
import { StageLike } from './development_stages/entities/stage_like.entity';

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
        entities: [User, DevelopmentStage, StageLike],
        synchronize: false,
      }),
    }),
    DevelopmentStagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}