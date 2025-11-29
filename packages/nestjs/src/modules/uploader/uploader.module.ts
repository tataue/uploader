import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UploaderController } from './controllers/uploader.controller';
import {
  UploaderService,
  FileSystemService,
  PathSecurityService,
  ArchiveService,
} from './services';
import { CustomLogger } from '../../common/logger/custom-logger.service';
import { RequestContextService } from '../../common/context/request-context.service';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule,
    MulterModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const uploadDir = configService.get<string>('UPLOAD_DIR') || '';
        return {
          dest: path.join(uploadDir, '.tmp'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [UploaderController],
  providers: [
    CustomLogger,
    RequestContextService,
    UploaderService,
    FileSystemService,
    PathSecurityService,
    ArchiveService,
  ],
})
export class UploaderModule {}
