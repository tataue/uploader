import { Module } from '@nestjs/common';
import { UploaderController } from './uploader.controller';
import configuration from '../config/configuration';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  controllers: [UploaderController],
  providers: [],
})
export class UploaderModule {}
