import * as path from 'path';
import * as fse from 'fs-extra';
import * as fs from 'fs';

import { Response } from 'express';
import { promisify } from 'util';
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Res,
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
}

type FileList = FileInfo[];

const readDir = promisify(fs.readdir);
const stat = promisify(fs.stat);
// TODO use configService ?
const UPLOAD_DIR = configuration().UPLOAD_DIR;

@Controller('uploader')
export class UploaderController {
  constructor(private configService: ConfigService) {
    fse.ensureDirSync(configService.get('UPLOAD_DIR'));
  }

  async handlerFiles(files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // 更好的中文文件名处理方式
      let originalName = file.originalname;
      
      // 检查是否需要编码转换
      try {
        // 尝试解码，如果失败说明已经是正确编码
        const decoded = decodeURIComponent(escape(originalName));
        originalName = decoded;
      } catch (e) {
        // 如果解码失败，尝试 Buffer 转换
        try {
          originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        } catch (e2) {
          // 如果都失败，使用原始名称
          originalName = file.originalname;
        }
      }
      
      await fse.rename(
        path.resolve(file.destination, file.filename),
        path.resolve(file.destination, originalName),
      );
    }
  }

  @Get()
  async findAll(): Promise<FileList> {
    try {
      const files = await readDir(UPLOAD_DIR);
      const fileInfos: FileInfo[] = [];

      for (const fileName of files) {
        if (fileName !== '.' && fileName !== '..') {
          const filePath = path.join(UPLOAD_DIR, fileName);
          try {
            const stats = await stat(filePath);
            const fileType = path.extname(fileName).slice(1) || 'unknown';
            
            fileInfos.push({
              name: fileName,
              type: fileType,
              size: stats.size,
              uploadTime: stats.mtime.toISOString(),
            });
          } catch (err) {
            console.error(`Error getting stats for file ${fileName}:`, err);
          }
        }
      }

      return fileInfos.sort((a, b) => 
        new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime()
      );
    } catch (err) {
      console.error('Error reading directory:', err);
      return [];
    }
  }

  // single file upload
  @Post()
  @UseInterceptors(FileInterceptor('file', { dest: UPLOAD_DIR }))
  async uploadFile(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.handlerFiles([file]);
    res.json({});
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

  // delete file
  @Delete(':filename')
  async deleteFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const filePath = path.resolve(UPLOAD_DIR, filename);
      
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        throw new HttpException('文件不存在', HttpStatus.NOT_FOUND);
      }
      
      // 安全检查：确保文件路径在上传目录内
      const resolvedUploadDir = path.resolve(UPLOAD_DIR);
      if (!filePath.startsWith(resolvedUploadDir)) {
        throw new HttpException('无效的文件路径', HttpStatus.BAD_REQUEST);
      }
      
      // 删除文件
      await fse.remove(filePath);
      
      res.json({ message: '文件删除成功' });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('删除文件失败:', error);
      throw new HttpException('删除文件失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
