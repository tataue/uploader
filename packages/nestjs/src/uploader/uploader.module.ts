import { Module } from '@nestjs/common';
import { UploaderController } from './uploader.controller';

@Module({
  imports: [],
  controllers: [UploaderController],
  providers: [],
})
export class UploaderModule {}
