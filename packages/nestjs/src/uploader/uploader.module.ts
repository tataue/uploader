import { Module } from '@nestjs/common';
import { UploaderController } from './uploader.controller';

@Module({
  controllers: [UploaderController],
  providers: [],
})
export class UploaderModule {}
