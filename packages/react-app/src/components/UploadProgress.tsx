import React from 'react';
import { Progress } from '@nextui-org/react';

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

const UploadProgress: React.FC<UploadProgressProps> = ({
  uploading,
  uploadProgress,
  overallProgress
}) => {
  if (!uploading && uploadProgress.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-3">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">整体进度</span>
          <span className="text-sm text-slate-500">{overallProgress}%</span>
        </div>
        <Progress 
          value={overallProgress} 
          color="primary" 
          size="sm"
          className="max-w-full"
        />
      </div>
      
      {uploadProgress.length > 1 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-700">文件详情</div>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {uploadProgress.map((file, index) => (
              <div key={index} className="text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-600 truncate max-w-[200px]" title={file.fileName}>
                    {file.fileName}
                  </span>
                  <span className="text-slate-500 ml-2">
                    {file.completed ? '✓' : `${file.progress}%`}
                  </span>
                </div>
                <Progress 
                  value={file.progress} 
                  color={file.completed ? "success" : "primary"} 
                  size="sm"
                  className="max-w-full"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadProgress;