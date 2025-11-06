export class FileInfoDto {
  name: string;
  type: string;
  size: number;
  uploadTime: string;
  isDir?: boolean;
  children?: FileInfoDto[];
  path?: string;
}
