import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { UploaderController } from './controllers/uploader.controller';
import { UploaderService, FileSystemService, PathSecurityService } from './services';
import * as path from 'path';

@Module({
  imports: [
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
  providers: [UploaderService, FileSystemService, PathSecurityService],
})
export class UploaderModule {}
