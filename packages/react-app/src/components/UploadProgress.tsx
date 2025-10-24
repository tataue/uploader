import React from 'react';

interface FileUploadProgress {
  fileName: string;
  progress: number;
  completed: boolean;
}

interface UploadProgressProps {
  uploading: boolean;
  uploadProgress: FileUploadProgress[];
  overallProgress: number;
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
}) => {
  if (!uploading && uploadProgress.length === 0) {
    return null;
  }

  const overall = clampProgress(overallProgress);

  return (
    <div className="w-full space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-neutral-600">
          <span>整体进度</span>
          <span>{overall}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 shadow-soft transition-all duration-200"
            style={{ width: `${overall}%` }}
          />
        </div>
      </div>

      {uploadProgress.length > 0 && (
        <ul className="scrollbar-slim max-h-40 space-y-3 overflow-y-auto rounded-lg bg-white/60 p-3 text-xs text-neutral-600 shadow-inner">
          {uploadProgress.map((file, index) => {
            const value = clampProgress(file.progress);
            return (
              <li key={`${file.fileName}-${index}`} className="space-y-1 rounded-md border border-transparent bg-white/70 p-3 shadow-soft transition hover:border-brand-200/80">
                <div className="flex items-center justify-between gap-2">
                  <span className="max-w-[52%] truncate font-medium text-neutral-700" title={file.fileName}>
                    {file.fileName}
                  </span>
                  <span className={file.completed ? 'text-success' : 'text-brand-500'}>
                    {file.completed ? '完成' : `${value}%`}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200/80">
                  <div
                    className={`${file.completed ? 'bg-success' : 'bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600'} h-full rounded-full transition-all duration-200`}
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
