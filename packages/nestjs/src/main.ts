import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });
  
  const cs = app.get(ConfigService);
  const port = cs.get('port');
  
  await app.listen(port);
  logger.log(`Server is listening on port ${port}`);
}
bootstrap();
