import React from 'react';
import { X } from 'lucide-react';

interface FileUploadProgress {
  fileName: string;
  progress: number;
  completed: boolean;
}

interface UploadProgressProps {
  uploading: boolean;
  uploadProgress: FileUploadProgress[];
  overallProgress: number;
  onClose: () => void;
}

const clampProgress = (value: number): number => {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
};

const UploadProgress: React.FC<UploadProgressProps> = ({
  uploading,
  uploadProgress,
  overallProgress,
  onClose,
}) => {
  if (uploadProgress.length === 0) {
    return null;
  }

  const overall = clampProgress(overallProgress);
  const completedCount = uploadProgress.filter(f => f.completed).length;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-xs font-medium text-neutral-600">
        <span>整体进度 ({completedCount}/{uploadProgress.length})</span>
        <div className="flex items-center gap-2">
          <span>{overall}%</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-5 w-5 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-600"
            title="关闭进度"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {uploadProgress.length > 0 && (
        <ul className="scrollbar-slim max-h-96 space-y-2 overflow-y-auto rounded-lg bg-white/60 p-3 text-xs text-neutral-600 shadow-inner">
          {uploadProgress.map((file, index) => {
            const value = clampProgress(file.progress);
            return (
              <li key={`${file.fileName}-${index}`} className="space-y-1.5 rounded-md border border-transparent bg-white/70 p-2.5 shadow-soft transition hover:border-brand-200/80">
                <div className="flex items-center justify-between gap-2">
                  <span className="max-w-[70%] truncate font-medium text-neutral-700" title={file.fileName}>
                    {file.fileName}
                  </span>
                  <span className={file.completed ? 'text-success' : 'text-brand-500'}>
                    {file.completed ? '完成' : `${value}%`}
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200/80">
                  <div
                    className={`${file.completed ? 'bg-success' : 'bg-brand-500'} h-full rounded-full transition-all duration-200`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default UploadProgress;
