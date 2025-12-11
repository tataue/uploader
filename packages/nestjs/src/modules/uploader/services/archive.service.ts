import { Injectable } from '@nestjs/common';
import archiver from 'archiver';
import { Response } from 'express';
import * as path from 'path';
import { CustomLogger, LogContext } from '../../../common/logger/custom-logger.service';

export interface ArchiveItem {
  fullPath: string;
  relativePath: string;
  isDir: boolean;
}

@Injectable()
export class ArchiveService {
  constructor(private readonly logger: CustomLogger) {}

  async createZipArchive(fullPath: string, res: Response): Promise<void> {
    const fileName = path.basename(fullPath);
    this.logger.log(`Zipping directory: ${fullPath}`, LogContext.UPLOADER);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName)}.zip"`,
    );

    const archive = archiver('zip', { zlib: { level: 9 } });
    this.setupArchiveHandlers(archive, res);

    archive.pipe(res);
    archive.directory(fullPath, false);
    await archive.finalize();
  }

  async createBatchZipArchive(items: ArchiveItem[], res: Response): Promise<void> {
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `batch-download-${timestamp}`;
    this.logger.log(`Batch zipping ${items.length} items`, LogContext.UPLOADER);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName)}.zip"`,
    );

    const archive = archiver('zip', { zlib: { level: 9 } });
    this.setupArchiveHandlers(archive, res);

    archive.pipe(res);

    for (const item of items) {
      if (item.isDir) {
        archive.directory(item.fullPath, item.relativePath);
      } else {
        archive.file(item.fullPath, { name: item.relativePath });
      }
    }

    await archive.finalize();
  }

  private setupArchiveHandlers(archive: archiver.Archiver, res: Response): void {
    let archiveFinished = false;

    archive.on('error', (err) => {
      this.logger.error('Archive error', err.stack, LogContext.UPLOADER);
      if (!archiveFinished && !res.headersSent) {
        res.status(500).end();
      }
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        this.logger.warn(`Archive warning: ${err.message}`, LogContext.UPLOADER);
      } else {
        this.logger.error('Archive warning (critical)', err.stack, LogContext.UPLOADER);
        if (!archiveFinished && !res.headersSent) {
          res.status(500).end();
        }
      }
    });

    archive.on('end', () => {
      archiveFinished = true;
      this.logger.log('Archive finalized successfully', LogContext.UPLOADER);
    });

    res.on('close', () => {
      if (!archiveFinished) {
        this.logger.log('Client disconnected, aborting archive', LogContext.UPLOADER);
        archive.abort();
      }
    });

    res.on('error', (err) => {
      this.logger.error('Response error', err.stack, LogContext.UPLOADER);
      if (!archiveFinished) {
        archive.abort();
      }
    });
  }
}
