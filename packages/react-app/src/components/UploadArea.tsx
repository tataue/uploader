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
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">文件上传</h2>
        <p className="text-xs text-slate-500 mt-1">当前目录: <code className="bg-slate-100 px-2 py-1 rounded text-slate-700">/{currentPath || ''}</code></p>
      </div>

      <div
        className={`relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 text-center transition-colors duration-200 ${
          dragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
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

        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <Upload className="h-6 w-6 text-slate-500" />
        </span>

        <div>
          <p className="text-base font-medium text-slate-900">
            {dragActive ? '释放开始上传' : '拖拽文件或文件夹'}
          </p>
          <p className="mt-1 text-sm text-slate-500">支持多个文件及目录结构</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={triggerFileDialog}
            disabled={uploading}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {uploading ? '上传中...' : '选择文件'}
          </button>
          <button
            type="button"
            onClick={triggerFolderDialog}
            disabled={uploading}
            className="rounded-md bg-green-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-80 flex items-center gap-2"
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
