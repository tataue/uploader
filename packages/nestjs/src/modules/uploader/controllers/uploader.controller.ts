import { Response, Request } from 'express';
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Res,
  Req,
  UploadedFiles,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { UploaderService, PathSecurityService } from '../services';
import { FileInfoDto } from '../dto';
import { CustomLogger, LogContext } from '../../../common/logger/custom-logger.service';

@Controller('uploader')
export class UploaderController {
  constructor(
    private readonly logger: CustomLogger,
    private uploaderService: UploaderService,
    private pathSecurityService: PathSecurityService,
  ) {}

  @Get()
  async findAll(): Promise<FileInfoDto[]> {
    return this.uploaderService.getFileList();
  }

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFile(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<void> {
    try {
      this.logger.log(
        `Received ${files?.length || 0} files, body keys: ${Object.keys(req.body || {}).join(',')}`,
        LogContext.UPLOADER,
      );
      this.logger.debug(`Request body: ${JSON.stringify(req.body)}`, LogContext.UPLOADER);

      await this.uploaderService.processUploadedFiles(files, req.body);
      res.json({ success: true });
    } catch (error) {
      this.logger.error(
        'Upload failed',
        error instanceof Error ? error.stack : undefined,
        LogContext.UPLOADER,
      );

      if (files && files.length > 0) {
        await this.uploaderService.cleanupTempFiles(files);
      }

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '上传失败',
      });
    }
  }

  @Delete(':filePath')
  async deleteFile(
    @Param('filePath') filePathParam: string | string[],
    @Res() res: Response,
  ): Promise<void> {
    try {
      const filePath = this.pathSecurityService.normalizeFilePath(filePathParam);
      await this.uploaderService.deleteFile(filePath);
      res.json({ message: '删除成功' });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Delete failed',
        error instanceof Error ? error.stack : undefined,
        LogContext.UPLOADER,
      );
      throw new HttpException('删除失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('download/:filePath')
  async downloadFile(
    @Param('filePath') filePathParam: string | string[],
    @Res() res: Response,
  ): Promise<void> {
    try {
      const filePath = this.pathSecurityService.normalizeFilePath(filePathParam);
      await this.uploaderService.downloadFile(filePath, res);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Download failed',
        error instanceof Error ? error.stack : undefined,
        LogContext.UPLOADER,
      );
      throw new HttpException('下载失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
