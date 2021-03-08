import * as path from 'path';
import * as fse from 'fs-extra';
import * as fs from 'fs';

import { Response } from 'express';
import { promisify } from 'util';
import {
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

import configuration from '../config/configuration';

type FileList = string[];

const readDir = promisify(fs.readdir);
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
      await fse.rename(
        path.resolve(file.destination, file.filename),
        path.resolve(file.destination, file.originalname),
      );
    }
  }

  @Get()
  async findAll(): Promise<FileList> {
    const files = await readDir(UPLOAD_DIR);
    return files;
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
}
