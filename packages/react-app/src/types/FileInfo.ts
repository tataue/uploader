export interface FileInfo {
  name: string;
  type: string;
  size: number;
  uploadTime: string;
}

export interface FileGroup {
  label: string;
  files: FileInfo[];
  icon?: React.ReactNode;
}

export type ViewMode = 'type' | 'time';