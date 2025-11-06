import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as path from 'path';

@Injectable()
export class PathSecurityService {
  validatePathSegment(segment: string): void {
    if (!segment || segment.includes('..') || segment.includes('\0')) {
      throw new HttpException('无效的路径', HttpStatus.BAD_REQUEST);
    }
  }

  sanitizeFilePath(filePath: string): string {
    const sanitized = filePath.replace(/\.\./g, '').replace(/\0/g, '');
    return sanitized.split(/[/\\]+/).filter(Boolean).join('/');
  }

  normalizeFilePath(filePath: string | string[]): string {
    let normalizedPath: string;

    if (Array.isArray(filePath)) {
      for (const segment of filePath) {
        if (segment.includes('..') || segment.includes('\0')) {
          throw new HttpException('无效的路径', HttpStatus.BAD_REQUEST);
        }
      }
      normalizedPath = filePath.join('/');
    } else {
      normalizedPath = filePath ?? '';
    }

    return this.sanitizeFilePath(normalizedPath);
  }

  validatePathInUploadDir(targetPath: string, uploadDir: string): void {
    const normalizedTargetPath = path.normalize(targetPath);
    const resolvedUploadDir = path.resolve(uploadDir);

    if (
      !normalizedTargetPath.startsWith(resolvedUploadDir + path.sep) &&
      normalizedTargetPath !== resolvedUploadDir
    ) {
      throw new HttpException('无效的文件路径', HttpStatus.BAD_REQUEST);
    }
  }
}
