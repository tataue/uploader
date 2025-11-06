import { IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
  @IsOptional()
  @IsString()
  relativePath?: string;

  @IsOptional()
  @IsString()
  targetDir?: string;
}
