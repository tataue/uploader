import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class BatchDownloadDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  paths!: string[];
}
