import { Response, Request } from 'express';
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Res,
  Req,
  UploadedFiles,
  UseInterceptors,
  HttpException,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { UploaderService, PathSecurityService } from '../services';
import { FileInfoDto, BatchDeleteDto, BatchDownloadDto } from '../dto';
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
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }),
        ],
        fileIsRequired: false,
      }),
    ) files: Express.Multer.File[],
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
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const fullPath = decodeURIComponent(req.path.replace('/uploader/', ''));
      const filePath = this.pathSecurityService.normalizeFilePath(fullPath);
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

  @Post('batch-delete')
  async batchDelete(
    @Body() batchDeleteDto: BatchDeleteDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const results = await this.uploaderService.batchDelete(batchDeleteDto.paths);
      res.json({ success: true, results });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Batch delete failed',
        error instanceof Error ? error.stack : undefined,
        LogContext.UPLOADER,
      );
      throw new HttpException('批量删除失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('download/:filePath')
  async downloadFile(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const fullPath = decodeURIComponent(req.path.replace('/uploader/download/', ''));
      const filePath = this.pathSecurityService.normalizeFilePath(fullPath);
      const forceDownload = req.query.forceDownload === 'true';
      await this.uploaderService.downloadFile(filePath, res, forceDownload);
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

  @Post('batch-download')
  async batchDownload(
    @Body() batchDownloadDto: BatchDownloadDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      await this.uploaderService.batchDownload(batchDownloadDto.paths, res);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        'Batch download failed',
        error instanceof Error ? error.stack : undefined,
        LogContext.UPLOADER,
      );
      throw new HttpException('批量下载失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
