import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as path from 'path';
import { Response } from 'express';
import { FileSystemService } from './file-system.service';
import { PathSecurityService } from './path-security.service';
import { ArchiveService, ArchiveItem } from './archive.service';
import { FileInfoDto } from '../dto';
import { CustomLogger, LogContext } from '../../../common/logger/custom-logger.service';

interface FileProcessBody {
  relativePath?: string | string[];
  targetDir?: string | string[];
}

@Injectable()
export class UploaderService {
  constructor(
    private readonly logger: CustomLogger,
    private fileSystemService: FileSystemService,
    private pathSecurityService: PathSecurityService,
    private archiveService: ArchiveService,
  ) {}

  async getFileList(): Promise<FileInfoDto[]> {
    try {
      const uploadDir = this.fileSystemService.getUploadDir();
      return await this.fileSystemService.buildFileTree(uploadDir);
    } catch (err) {
      this.logger.error(
        'Error reading directory',
        err instanceof Error ? err.stack : undefined,
        LogContext.UPLOADER,
      );
      return [];
    }
  }

  private decodeFilename(originalName: string): string {
    try {
      return decodeURIComponent(escape(originalName));
    } catch {
      try {
        return Buffer.from(originalName, 'latin1').toString('utf8');
      } catch {
        return originalName;
      }
    }
  }

  async processUploadedFiles(
    files: Express.Multer.File[],
    body: FileProcessBody,
  ): Promise<void> {
    this.logger.log(
      `Processing ${files.length} files, body keys: ${Object.keys(body || {}).join(',')}`,
      LogContext.UPLOADER,
    );
    this.logger.debug(
      `relativePath=${JSON.stringify(body?.relativePath)}, targetDir=${JSON.stringify(body?.targetDir)}`,
      LogContext.UPLOADER,
    );

    const uploadDir = this.fileSystemService.getUploadDir();
    const resolvedUploadDir = path.resolve(uploadDir);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const originalName = this.decodeFilename(file.originalname);

      this.logger.debug(
        `Processing file ${i}: originalname=${originalName}, destination=${file.destination}, filename=${file.filename}`,
        LogContext.UPLOADER,
      );

      const relPath = Array.isArray(body?.relativePath)
        ? body.relativePath[i]
        : body?.relativePath;
      const targetDir = Array.isArray(body?.targetDir)
        ? body.targetDir[i]
        : body?.targetDir;

      let targetPath: string;

      if (relPath) {
        const sanitizedRelPath = this.pathSecurityService.sanitizeFilePath(relPath);
        this.pathSecurityService.validatePathSegment(sanitizedRelPath);
        targetPath = path.resolve(uploadDir, sanitizedRelPath);
        this.logger.debug(
          `Using relativePath: ${relPath} -> ${sanitizedRelPath} -> ${targetPath}`,
          LogContext.UPLOADER,
        );
      } else if (targetDir) {
        const sanitizedTargetDir = this.pathSecurityService.sanitizeFilePath(targetDir);
        const sanitizedFileName = path.basename(originalName);
        this.pathSecurityService.validatePathSegment(sanitizedTargetDir);
        this.pathSecurityService.validatePathSegment(sanitizedFileName);
        targetPath = path.resolve(uploadDir, sanitizedTargetDir, sanitizedFileName);
        this.logger.debug(
          `Using targetDir: ${targetDir} + ${originalName} -> ${sanitizedTargetDir} + ${sanitizedFileName} -> ${targetPath}`,
          LogContext.UPLOADER,
        );
      } else {
        const sanitizedFileName = path.basename(originalName);
        this.pathSecurityService.validatePathSegment(sanitizedFileName);
        targetPath = path.resolve(uploadDir, sanitizedFileName);
        this.logger.debug(
          `Root upload: ${originalName} -> ${sanitizedFileName} -> ${targetPath}`,
          LogContext.UPLOADER,
        );
      }

      this.pathSecurityService.validatePathInUploadDir(targetPath, resolvedUploadDir);

      const targetDirPath = path.dirname(targetPath);
      await this.fileSystemService.ensureDir(targetDirPath);

      const sourceFile = path.resolve(file.destination, file.filename);
      this.logger.debug(`Renaming: ${sourceFile} -> ${targetPath}`, LogContext.UPLOADER);

      await this.fileSystemService.moveFile(sourceFile, targetPath);
      this.logger.log(`File ${i} moved successfully`, LogContext.UPLOADER);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    this.logger.log(`Deleting file: ${filePath}`, LogContext.UPLOADER);

    const uploadDir = this.fileSystemService.getUploadDir();
    const fullPath = path.resolve(uploadDir, filePath);
    const normalizedFullPath = path.normalize(fullPath);

    this.logger.debug(
      `Full path: ${normalizedFullPath}, exists: ${this.fileSystemService.fileExists(normalizedFullPath)}`,
      LogContext.UPLOADER,
    );

    this.pathSecurityService.validatePathInUploadDir(normalizedFullPath, uploadDir);

    if (!this.fileSystemService.fileExists(normalizedFullPath)) {
      throw new HttpException('文件或文件夹不存在', HttpStatus.NOT_FOUND);
    }

    await this.fileSystemService.removeFile(normalizedFullPath);
    this.logger.log('File deleted successfully', LogContext.UPLOADER);
  }

  async batchDelete(paths: string[]): Promise<{ path: string; success: boolean; error?: string }[]> {
    this.logger.log(`Batch deleting ${paths.length} items`, LogContext.UPLOADER);

    const results: { path: string; success: boolean; error?: string }[] = [];

    for (const filePath of paths) {
      try {
        await this.deleteFile(filePath);
        results.push({ path: filePath, success: true });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '删除失败';
        this.logger.error(`Failed to delete ${filePath}: ${errorMessage}`, undefined, LogContext.UPLOADER);
        results.push({ path: filePath, success: false, error: errorMessage });
      }
    }

    return results;
  }

  async getFilePathInfo(filePath: string): Promise<{
    fullPath: string;
    stats: import('fs').Stats;
  }> {
    this.logger.debug(`Getting file path info: ${filePath}`, LogContext.UPLOADER);

    const uploadDir = this.fileSystemService.getUploadDir();
    const fullPath = path.resolve(uploadDir, filePath);
    const normalizedFullPath = path.normalize(fullPath);

    this.pathSecurityService.validatePathInUploadDir(normalizedFullPath, uploadDir);

    if (!this.fileSystemService.fileExists(normalizedFullPath)) {
      throw new HttpException('文件或文件夹不存在', HttpStatus.NOT_FOUND);
    }

    const stats = await this.fileSystemService.getFileStat(normalizedFullPath);

    return { fullPath: normalizedFullPath, stats };
  }

  async cleanupTempFiles(files: Express.Multer.File[]): Promise<void> {
    for (const file of files) {
      try {
        const tempFile = path.resolve(file.destination, file.filename);
        if (this.fileSystemService.fileExists(tempFile)) {
          await this.fileSystemService.removeFile(tempFile);
          this.logger.log(`Cleaned up temp file: ${tempFile}`, LogContext.UPLOADER);
        }
      } catch (cleanupError) {
        this.logger.error(
          'Failed to cleanup temp file',
          cleanupError instanceof Error ? cleanupError.stack : undefined,
          LogContext.UPLOADER,
        );
      }
    }
  }

  async downloadFile(filePath: string, res: Response): Promise<void> {
    this.logger.debug(`Downloading: ${filePath}`, LogContext.UPLOADER);

    const { fullPath, stats } = await this.getFilePathInfo(filePath);

    if (stats.isFile()) {
      this.logger.log(`Downloading file: ${fullPath}`, LogContext.UPLOADER);
      res.download(fullPath);
    } else {
      await this.archiveService.createZipArchive(fullPath, res);
    }
  }

  async batchDownload(paths: string[], res: Response): Promise<void> {
    this.logger.log(`Batch downloading ${paths.length} items`, LogContext.UPLOADER);

    const items: ArchiveItem[] = [];

    for (const filePath of paths) {
      const { fullPath, stats } = await this.getFilePathInfo(filePath);
      items.push({
        fullPath,
        relativePath: filePath,
        isDir: stats.isDirectory(),
      });
    }

    await this.archiveService.createBatchZipArchive(items, res);
  }
}
