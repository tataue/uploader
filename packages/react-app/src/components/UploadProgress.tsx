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
    <div className="w-full space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
          <span>整体进度</span>
          <span>{overall}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-200"
            style={{ width: `${overall}%` }}
          />
        </div>
      </div>

      {uploadProgress.length > 0 && (
        <ul className="max-h-36 space-y-2 overflow-y-auto text-xs text-slate-600">
          {uploadProgress.map((file, index) => {
            const value = clampProgress(file.progress);
            return (
              <li key={`${file.fileName}-${index}`} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="max-w-[200px] truncate" title={file.fileName}>
                    {file.fileName}
                  </span>
                  <span className={file.completed ? 'text-emerald-600' : 'text-slate-500'}>
                    {file.completed ? '完成' : `${value}%`}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`${file.completed ? 'bg-emerald-500' : 'bg-blue-500'} h-full rounded-full transition-all duration-200`}
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
