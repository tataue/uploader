import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { join } from 'path';
import configuration from './config/configuration';
import { UploaderModule } from './modules/uploader/uploader.module';
import { HealthModule } from './modules/health/health.module';
import { HttpLoggerMiddleware, RequestIdMiddleware } from './common/middleware';
import { CustomLogger } from './common/logger/custom-logger.service';
import { RequestContextService } from './common/context/request-context.service';
import { ApmInterceptor } from './common/interceptors/apm.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { IpFilterGuard } from './common/guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('throttle.ttl', 60000),
            limit: config.get<number>('throttle.limit', 100),
          },
        ],
      }),
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
  providers: [
    CustomLogger,
    RequestContextService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: IpFilterGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ApmInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
  exports: [CustomLogger, RequestContextService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestIdMiddleware, HttpLoggerMiddleware)
      .forRoutes('*');
  }
}
