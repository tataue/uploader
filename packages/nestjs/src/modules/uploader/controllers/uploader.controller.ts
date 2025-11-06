import * as path from 'path';
import archiver from 'archiver';
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
  Logger,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UploaderService, PathSecurityService, FileSystemService } from '../services';
import { FileInfoDto } from '../dto';

@Controller('uploader')
export class UploaderController {
  private readonly logger = new Logger(UploaderController.name);

  constructor(
    private uploaderService: UploaderService,
    private pathSecurityService: PathSecurityService,
    private fileSystemService: FileSystemService,
  ) {}

  @Get()
  async findAll(): Promise<FileInfoDto[]> {
    return this.uploaderService.getFileList();
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFile(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<void> {
    try {
      this.logger.log(
        `Received ${files?.length || 0} files, body keys: ${Object.keys(req.body || {}).join(',')}`,
      );
      this.logger.debug(`Request body: ${JSON.stringify(req.body)}`);

      await this.uploaderService.processUploadedFiles(files, req.body);
      res.json({ success: true });
    } catch (error) {
      this.logger.error('Upload failed', error instanceof Error ? error.stack : error);

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
      this.logger.error('Delete failed', error instanceof Error ? error.stack : error);
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
      const { fullPath, stats } = await this.uploaderService.getFilePathInfo(filePath);

      if (stats.isFile()) {
        this.logger.log(`Downloading file: ${fullPath}`);
        res.download(fullPath);
      } else {
        const fileName = path.basename(fullPath);
        this.logger.log(`Zipping directory: ${fullPath}`);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${encodeURIComponent(fileName)}.zip"`,
        );

        const archive = archiver('zip', { zlib: { level: 9 } });

        let archiveFinished = false;

        archive.on('error', (err) => {
          this.logger.error('Archive error', err.stack);
          if (!archiveFinished && !res.headersSent) {
            res.status(500).end();
          }
        });

        archive.on('warning', (err) => {
          if (err.code === 'ENOENT') {
            this.logger.warn(`Archive warning: ${err.message}`);
          } else {
            this.logger.error('Archive warning (critical)', err.stack);
            if (!archiveFinished && !res.headersSent) {
              res.status(500).end();
            }
          }
        });

        archive.on('end', () => {
          archiveFinished = true;
          this.logger.log('Archive finalized successfully');
        });

        res.on('close', () => {
          if (!archiveFinished) {
            this.logger.log('Client disconnected, aborting archive');
            archive.abort();
          }
        });

        res.on('error', (err) => {
          this.logger.error('Response error', err.stack);
          if (!archiveFinished) {
            archive.abort();
          }
        });

        archive.pipe(res);
        archive.directory(fullPath, false);
        await archive.finalize();
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Download failed', error instanceof Error ? error.stack : error);
      throw new HttpException('下载失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
