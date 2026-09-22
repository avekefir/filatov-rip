import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const hbs = require('hbs');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, '..', 'views/partials'));
  app.useStaticAssets(join(__dirname, '..', 'public'));

  hbs.registerHelper('eq', function(a: string, b: string) {
    return a === b;
  });
  hbs.registerHelper('gt', function(a: number, b: number) {
    return a > b;
  });
  hbs.registerHelper('slice', function(str: string, start: number, end: number) {
    if (!str) return '';
    return str.substring(start, end);
  });

  await app.listen(3000);
}
bootstrap();