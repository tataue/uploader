import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { CustomLogger } from './common/logger/custom-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  
  const logger = app.get(CustomLogger);
  app.useLogger(logger);
  
  const cs = app.get(ConfigService);
  const port = cs.get('port');
  
  await app.listen(port);
  logger.log(`Server is listening on port ${port}`, 'Bootstrap');
}
bootstrap();
