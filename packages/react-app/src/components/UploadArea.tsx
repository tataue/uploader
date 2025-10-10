import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

import { useFileUpload } from '../hooks/useFileUpload';
import UploadProgress from './UploadProgress';

interface UploadAreaProps {
  onUploadSuccess: () => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onUploadSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    dragActive,
    uploading,
    uploadProgress,
    overallProgress,
    handleDrag,
    handleDrop,
    handleChange,
  } = useFileUpload(onUploadSuccess);

  const triggerFileDialog = (): void => {
    fileInputRef.current?.click();
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">文件上传</h2>
        <p className="text-sm text-slate-500">拖拽文件到下方区域或点击按钮选择文件</p>
      </header>

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
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          disabled={uploading}
        />

        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <Upload className="h-6 w-6 text-slate-500" />
        </span>

        <div>
          <p className="text-base font-medium text-slate-900">
            {dragActive ? '释放文件开始上传' : '拖拽文件到此处'}
          </p>
          <p className="mt-1 text-sm text-slate-500">支持一次选择多个文件</p>
        </div>

        <button
          type="button"
          onClick={triggerFileDialog}
          disabled={uploading}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-80"
        >
          {uploading ? '上传中...' : '选择文件'}
        </button>

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
