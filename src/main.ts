import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Configuration des pipes de validation globaux
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configuration du préfixe global pour l'API
  app.setGlobalPrefix('api');

  // Extraction du port depuis la configuration
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 1337);

  await app.listen(port);
  logger.log(`Application démarrée sur le port ${port}`);
}

bootstrap();
