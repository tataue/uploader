import React, { useRef } from 'react';
import { Upload, Folder } from 'lucide-react';

import { useFileUpload } from '../hooks/useFileUpload';
import UploadProgress from './UploadProgress';

interface UploadAreaProps {
  onUploadSuccess: () => void;
  currentPath?: string;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onUploadSuccess, currentPath = '' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const {
    dragActive,
    uploading,
    uploadProgress,
    overallProgress,
    handleDrag,
    handleDrop,
    handleChange,
  } = useFileUpload(onUploadSuccess, currentPath);

  const triggerFileDialog = (): void => {
    if (fileInputRef.current) {
      (fileInputRef.current as HTMLInputElement & { webkitdirectory: boolean }).webkitdirectory = false;
      fileInputRef.current.click();
    }
  };

  const triggerFolderDialog = (): void => {
    if (folderInputRef.current) {
      (folderInputRef.current as HTMLInputElement & { webkitdirectory: boolean }).webkitdirectory = true;
      folderInputRef.current.click();
    }
  };

  return (
    <section className="card card-hover space-y-6 p-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-neutral-900">文件上传</h2>
        <p className="text-xs text-neutral-500">
          当前目录:
          <code className="ml-2 rounded-md bg-neutral-100 px-2 py-1 text-neutral-700">/{currentPath || ''}</code>
        </p>
      </header>

      <div
        className={`relative flex flex-col items-center justify-center gap-5 rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200 ease-out-soft ${
          dragActive
            ? 'border-brand-400 bg-brand-50 shadow-card'
            : 'border-neutral-300 bg-neutral-50 hover:border-brand-300'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
          disabled={uploading}
        />
        <input
          ref={folderInputRef}
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
          disabled={uploading}
        />

        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/20 via-brand-400/30 to-brand-300/20 text-brand-600 shadow-soft">
          <Upload className="h-8 w-8" />
        </span>

        <div className="space-y-1">
          <p className="text-base font-semibold text-neutral-900">
            {dragActive ? '释放开始上传' : '拖拽文件或文件夹'}
          </p>
          <p className="text-sm text-neutral-500">支持多个文件及目录结构</p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <button
            type="button"
            onClick={triggerFileDialog}
            disabled={uploading}
            className="btn-primary w-full sm:w-auto"
          >
            {uploading ? '上传中...' : '选择文件'}
          </button>
          <button
            type="button"
            onClick={triggerFolderDialog}
            disabled={uploading}
            className="btn-secondary w-full sm:w-auto"
          >
            <Folder className="h-4 w-4" />
            {uploading ? '上传中...' : '选择文件夹'}
          </button>
        </div>

        <UploadProgress
          uploading={uploading}
          uploadProgress={uploadProgress}
          overallProgress={overallProgress}
        />
      </div>
    </section>
  );
};

export default UploadArea;
