import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class BatchDeleteDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  paths!: string[];
}
