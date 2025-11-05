import * as path from 'path';
import * as fse from 'fs-extra';
import * as fs from 'fs';
import archiver from 'archiver';

import { Response, Request } from 'express';
import { promisify } from 'util';
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Res,
  Req,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

import configuration from '../config/configuration';

interface FileInfo {
  name: string;
  type: string;
  size: number;
  uploadTime: string;
  isDir?: boolean;
  children?: FileInfo[];
  path?: string;
}

type FileList = FileInfo[];

const readDir = promisify(fs.readdir);
const stat = promisify(fs.stat);
// TODO use configService ?
const UPLOAD_DIR = configuration().UPLOAD_DIR;
const TEMP_FOLDER_NAME = '.tmp';
const TEMP_DIR = path.join(UPLOAD_DIR, TEMP_FOLDER_NAME);

async function buildFileTree(dir: string, basePath: string = ''): Promise<FileInfo[]> {
  const items: FileInfo[] = [];
  const files = await readDir(dir);

  for (const fileName of files) {
    // 排除系统目录和临时上传目录
    if (fileName === '.' || fileName === '..' || fileName === TEMP_FOLDER_NAME) continue;

    const filePath = path.join(dir, fileName);
    const relativePath = basePath ? path.join(basePath, fileName) : fileName;

    try {
      const stats = await stat(filePath);

      if (stats.isDirectory()) {
        const children = await buildFileTree(filePath, relativePath);
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
      console.error(`Error getting stats for ${fileName}:`, err);
    }
  }

  return items.sort((a, b) => {
    if (a.isDir !== b.isDir) {
      return a.isDir ? -1 : 1;
    }
    return new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime();
  });
}

@Controller('uploader')
export class UploaderController {
  constructor(private configService: ConfigService) {
    fse.ensureDirSync(configService.get('UPLOAD_DIR'));
    fse.ensureDirSync(TEMP_DIR);
  }

  private validatePathSegment(segment: string): void {
    if (!segment || segment.includes('..') || segment.includes('\0')) {
      throw new HttpException('无效的路径', HttpStatus.BAD_REQUEST);
    }
  }

  private sanitizeFilePath(filePath: string): string {
    // 移除路径遍历字符和空字节
    const sanitized = filePath.replace(/\.\./g, '').replace(/\0/g, '');
    // 规范化路径分隔符
    return sanitized.split(/[/\\]+/).filter(Boolean).join('/');
  }

  async handlerFiles(files, body: any) {
    console.log(`[handlerFiles] files count=${files.length}, body keys=${Object.keys(body || {}).join(',')}`);
    console.log(`[handlerFiles] relativePath=${JSON.stringify(body?.relativePath)}, targetDir=${JSON.stringify(body?.targetDir)}`);
    
    const resolvedUploadDir = path.resolve(UPLOAD_DIR);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let originalName = file.originalname;
      
      console.log(`[handlerFiles] processing file ${i}: originalname=${originalName}, destination=${file.destination}, filename=${file.filename}`);
      
      // 检查是否需要编码转换
      try {
        const decoded = decodeURIComponent(escape(originalName));
        originalName = decoded;
      } catch (e) {
        try {
          originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        } catch (e2) {
          originalName = file.originalname;
        }
      }

      let targetPath: string;
      
      // 检查是否是数组形式（多文件上传可能有多个路径）
      const relPath = Array.isArray(body?.relativePath) ? body.relativePath[i] : body?.relativePath;
      const targetDir = Array.isArray(body?.targetDir) ? body.targetDir[i] : body?.targetDir;
      
      if (relPath) {
        // 目录上传：relativePath 包含完整路径（包括文件名）
        const sanitizedRelPath = this.sanitizeFilePath(relPath);
        this.validatePathSegment(sanitizedRelPath);
        targetPath = path.resolve(UPLOAD_DIR, sanitizedRelPath);
        console.log(`[handlerFiles] using relativePath: ${relPath} -> ${sanitizedRelPath} -> ${targetPath}`);
      } else if (targetDir) {
        // 单文件上传到指定目录
        const sanitizedTargetDir = this.sanitizeFilePath(targetDir);
        const sanitizedFileName = path.basename(originalName);
        this.validatePathSegment(sanitizedTargetDir);
        this.validatePathSegment(sanitizedFileName);
        targetPath = path.resolve(UPLOAD_DIR, sanitizedTargetDir, sanitizedFileName);
        console.log(`[handlerFiles] using targetDir: ${targetDir} + ${originalName} -> ${sanitizedTargetDir} + ${sanitizedFileName} -> ${targetPath}`);
      } else {
        // 上传到根目录
        const sanitizedFileName = path.basename(originalName);
        this.validatePathSegment(sanitizedFileName);
        targetPath = path.resolve(UPLOAD_DIR, sanitizedFileName);
        console.log(`[handlerFiles] root upload: ${originalName} -> ${sanitizedFileName} -> ${targetPath}`);
      }
      
      // 安全检查：确保路径在上传目录内
      const normalizedTargetPath = path.normalize(targetPath);
      if (!normalizedTargetPath.startsWith(resolvedUploadDir + path.sep) && normalizedTargetPath !== resolvedUploadDir) {
        throw new HttpException('无效的文件路径', HttpStatus.BAD_REQUEST);
      }
      
      const targetDir_dir = path.dirname(normalizedTargetPath);
      await fse.ensureDir(targetDir_dir);
      
      const sourceFile = path.resolve(file.destination, file.filename);
      console.log(`[handlerFiles] renaming: ${sourceFile} -> ${normalizedTargetPath}`);
      
      await fse.rename(sourceFile, normalizedTargetPath);
      console.log(`[handlerFiles] file ${i} moved successfully`);
    }
  }

  @Get()
  async findAll(): Promise<FileList> {
    try {
      return await buildFileTree(UPLOAD_DIR);
    } catch (err) {
      console.error('Error reading directory:', err);
      return [];
    }
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor({ dest: TEMP_DIR }))
  async uploadFile(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      console.log(`[uploadFile] received files: ${files?.length || 0}, body keys: ${Object.keys(req.body || {}).join(',')}`);
      console.log(`[uploadFile] body: ${JSON.stringify(req.body)}`);
      
      await this.handlerFiles(files, req.body);
      res.json({ success: true });
    } catch (error) {
      console.error('Upload error:', error);
      
      if (files && files.length > 0) {
        for (const file of files) {
          try {
            const tempFile = path.resolve(file.destination, file.filename);
            if (fs.existsSync(tempFile)) {
              await fse.remove(tempFile);
              console.log(`[uploadFile] cleaned up temp file: ${tempFile}`);
            }
          } catch (cleanupError) {
            console.error(`[uploadFile] failed to cleanup temp file:`, cleanupError);
          }
        }
      }
      
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : '上传失败' });
    }
  }

  // multi file upload
  // @Post()
  // @UseInterceptors(FilesInterceptor('files', Infinity, { dest: UPLOAD_DIR }))
  // async uploadFiles(@Res() res: Response, @UploadedFiles() files) {
  //   await this.handlerFiles(files);
  //   res.json({});
  // }

  // // multi part
  // @Post('upload')
  // @UseInterceptors(
  //   FileFieldsInterceptor([
  //     { name: 'avatar', maxCount: 1 },
  //     { name: 'background', maxCount: 1 },
  //   ]),
  // )
  // uploadPairFiles(@UploadedFiles() pair) {
  //   console.log(pair);
  // }

  // // any file
  // @Post('upload')
  // @UseInterceptors(AnyFilesInterceptor())
  // uploadAnyFile(@UploadedFiles() files) {
  //   console.log(files);
  // }

  private normalizeFilePath(filePath: string | string[]): string {
    let normalizedPath: string;
    
    if (Array.isArray(filePath)) {
      // 验证每个路径段
      for (const segment of filePath) {
        if (segment.includes('..') || segment.includes('\0')) {
          throw new HttpException('无效的路径', HttpStatus.BAD_REQUEST);
        }
      }
      normalizedPath = filePath.join('/');
    } else {
      normalizedPath = filePath ?? '';
    }
    
    // 清理路径遍历字符
    return this.sanitizeFilePath(normalizedPath);
  }

  @Delete(':filePath')
  async deleteFile(@Param('filePath') filePathParam: string | string[], @Res() res: Response) {
    const filePath = this.normalizeFilePath(filePathParam);
    try {
      console.log(`[deleteFile] filePath=${filePath}`);
      
      const fullPath = path.resolve(UPLOAD_DIR, filePath);
      const normalizedFullPath = path.normalize(fullPath);
      
      console.log(`[deleteFile] fullPath=${normalizedFullPath}, exists=${fs.existsSync(normalizedFullPath)}`);
      
      // 安全检查：确保路径在上传目录内
      const resolvedUploadDir = path.resolve(UPLOAD_DIR);
      if (!normalizedFullPath.startsWith(resolvedUploadDir + path.sep) && normalizedFullPath !== resolvedUploadDir) {
        throw new HttpException('无效的文件路径', HttpStatus.BAD_REQUEST);
      }
      
      // 检查文件/文件夹是否存在
      if (!fs.existsSync(normalizedFullPath)) {
        throw new HttpException('文件或文件夹不存在', HttpStatus.NOT_FOUND);
      }
      
      // 删除文件或文件夹
      await fse.remove(normalizedFullPath);
      
      console.log(`[deleteFile] deleted successfully`);
      
      res.json({ message: '删除成功' });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('删除失败:', error);
      throw new HttpException('删除失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('download/:filePath')
  async downloadFile(@Param('filePath') filePathParam: string | string[], @Res() res: Response) {
    const filePath = this.normalizeFilePath(filePathParam);
    try {
      console.log(`[downloadFile] filePath=${filePath}`);
      
      const fullPath = path.resolve(UPLOAD_DIR, filePath);
      const normalizedFullPath = path.normalize(fullPath);
      
      // 安全检查
      const resolvedUploadDir = path.resolve(UPLOAD_DIR);
      if (!normalizedFullPath.startsWith(resolvedUploadDir + path.sep) && normalizedFullPath !== resolvedUploadDir) {
        throw new HttpException('无效的文件路径', HttpStatus.BAD_REQUEST);
      }
      
      if (!fs.existsSync(normalizedFullPath)) {
        throw new HttpException('文件或文件夹不存在', HttpStatus.NOT_FOUND);
      }
      
      const stats = await fse.stat(normalizedFullPath);
      
      if (stats.isFile()) {
        // 单文件直接返回
        console.log(`[downloadFile] downloading file: ${normalizedFullPath}`);
        res.download(normalizedFullPath);
      } else {
        // 目录压缩下载
        const fileName = path.basename(normalizedFullPath);
        console.log(`[downloadFile] zipping directory: ${normalizedFullPath}`);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}.zip"`);
        
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        let archiveFinished = false;
        
        archive.on('error', (err) => {
          console.error('[downloadFile] Archive error:', err);
          if (!archiveFinished && !res.headersSent) {
            res.status(500).end();
          }
        });
        
        archive.on('warning', (err) => {
          if (err.code === 'ENOENT') {
            console.warn('[downloadFile] Archive warning:', err);
          } else {
            console.error('[downloadFile] Archive warning (critical):', err);
            if (!archiveFinished && !res.headersSent) {
              res.status(500).end();
            }
          }
        });
        
        archive.on('end', () => {
          archiveFinished = true;
          console.log('[downloadFile] Archive finalized successfully');
        });
        
        res.on('close', () => {
          if (!archiveFinished) {
            console.log('[downloadFile] Client disconnected, aborting archive');
            archive.abort();
          }
        });
        
        res.on('error', (err) => {
          console.error('[downloadFile] Response error:', err);
          if (!archiveFinished) {
            archive.abort();
          }
        });
        
        archive.pipe(res);
        archive.directory(normalizedFullPath, false);
        await archive.finalize();
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('下载失败:', error);
      throw new HttpException('下载失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
