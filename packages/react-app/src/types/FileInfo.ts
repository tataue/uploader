export interface FileInfo {
  name: string;
  type: string;
  size: number;
  uploadTime: string;
  isDir?: boolean;
  children?: FileInfo[];
  path?: string;
}
