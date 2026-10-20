import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { join } from 'path';

const hbs = require('hbs');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Подключаем чтение куки
  app.use(cookieParser());

  // 2. Настройка SSR (Handlebars)
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, '..', 'views/partials'));
  app.useStaticAssets(join(__dirname, '..', 'public'));

  hbs.registerHelper('eq', function (a: string, b: string) {
    return a === b;
  });

  // 3. Валидация DTO и скрытие паролей
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // 4. Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Lab 4 API — Расчёт стоимости разработки ПО')
    .setDescription('API с сессионной аутентификацией. Для тестирования методов сначала выполните POST /api/auth/login, затем нажмите Authorize и вставьте cookie sessionId.')
    .setVersion('1.0')
    .addCookieAuth('sessionId', {
      type: 'apiKey',
      in: 'cookie',
      name: 'sessionId'
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // Swagger будет доступен по /api-docs

  await app.listen(3000);
}
bootstrap();