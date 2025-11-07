import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import { promisify } from 'util';
import { FileInfoDto } from '../dto';
import { CustomLogger, LogContext } from '../../../common/logger/custom-logger.service';

const readDir = promisify(fs.readdir);
const stat = promisify(fs.stat);

@Injectable()
export class FileSystemService {
  private readonly uploadDir: string;
  private readonly tempFolderName = '.tmp';

  constructor(
    private readonly logger: CustomLogger,
    private configService: ConfigService,
  ) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || '';
    fse.ensureDirSync(this.uploadDir);
    fse.ensureDirSync(path.join(this.uploadDir, this.tempFolderName));
  }

  getUploadDir(): string {
    return this.uploadDir;
  }

  getTempDir(): string {
    return path.join(this.uploadDir, this.tempFolderName);
  }

  async buildFileTree(dir: string, basePath: string = ''): Promise<FileInfoDto[]> {
    const items: FileInfoDto[] = [];
    const files = await readDir(dir);

    for (const fileName of files) {
      if (fileName === '.' || fileName === '..' || fileName === this.tempFolderName) {
        continue;
      }

      const filePath = path.join(dir, fileName);
      const relativePath = basePath ? path.join(basePath, fileName) : fileName;

      try {
        const stats = await stat(filePath);

        if (stats.isDirectory()) {
          const children = await this.buildFileTree(filePath, relativePath);
          items.push({
            name: fileName,
            type: 'folder',
            size: 0,
            uploadTime: stats.mtime.toISOString(),
            isDir: true,
            children,
            path: relativePath,
          });
        } else {
          const fileType = path.extname(fileName).slice(1) || 'unknown';
          items.push({
            name: fileName,
            type: fileType,
            size: stats.size,
            uploadTime: stats.mtime.toISOString(),
            isDir: false,
            path: relativePath,
          });
        }
      } catch (err) {
        this.logger.error(
          `Error getting stats for ${fileName}`,
          err instanceof Error ? err.stack : undefined,
          LogContext.FILE_SYSTEM,
        );
      }
    }

    return items.sort((a, b) => {
      if (a.isDir !== b.isDir) {
        return a.isDir ? -1 : 1;
      }
      return new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime();
    });
  }

  async removeFile(filePath: string): Promise<void> {
    await fse.remove(filePath);
  }

  async ensureDir(dirPath: string): Promise<void> {
    await fse.ensureDir(dirPath);
  }

  async moveFile(source: string, target: string): Promise<void> {
    await fse.rename(source, target);
  }

  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  async getFileStat(filePath: string): Promise<fs.Stats> {
    return fse.stat(filePath);
  }
}
