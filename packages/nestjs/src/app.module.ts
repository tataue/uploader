import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import configuration from './config/configuration';
import { UploaderModule } from './modules/uploader/uploader.module';
import { HealthModule } from './modules/health/health.module';
import { HttpLoggerMiddleware } from './common/middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '..', 'client'),
        exclude: ['/uploader*'],
      },
      {
        rootPath: configuration().UPLOAD_DIR,
        serveRoot: '/uploads',
      },
    ),
    UploaderModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
