import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { UploaderModule } from '../uploader/uploader.module';
import configuration from '../config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    UploaderModule,
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return [
          {
            rootPath: configService.get('CLIENT_DIR'),
            serveStaticOptions: {
              fallthrough: false,
              index: ['index.html']
            }
          },
          {
            rootPath: configService.get('UPLOAD_DIR'),
            serveRoot: '/uploads',
            serveStaticOptions: {
              fallthrough: false,
              index: false,
            }
          },
        ];
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
