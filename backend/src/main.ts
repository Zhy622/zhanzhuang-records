import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  config.databaseUrl();
  config.jwtSecret();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(config.port());
}

bootstrap();
