import { useState } from 'react';

interface FileUploadProgress {
  fileName: string;
  progress: number;
  completed: boolean;
}

export const useFileUpload = (onSuccess: () => void) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const uploadFile = (file: File, index: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(prev => 
            prev.map((item, i) => 
              i === index ? { ...item, progress } : item
            )
          );
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadProgress(prev => 
            prev.map((item, i) => 
              i === index ? { ...item, progress: 100, completed: true } : item
            )
          );
          resolve(true);
        } else {
          console.error(`${file.name} 文件上传失败`);
          resolve(false);
        }
      });
      
      xhr.addEventListener('error', () => {
        console.error(`${file.name} 文件上传失败`);
        resolve(false);
      });
      
      xhr.open('POST', './uploader');
      xhr.send(formData);
    });
  };

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    const fileArray = Array.from(files);
    
    // 初始化进度状态
    const initialProgress: FileUploadProgress[] = fileArray.map((file) => ({
      fileName: file.name,
      progress: 0,
      completed: false
    }));
    setUploadProgress(initialProgress);
    setOverallProgress(0);
    
    const uploadPromises = fileArray.map((file, index) => uploadFile(file, index));
    
    // 监听整体进度
    const progressInterval = setInterval(() => {
      setUploadProgress(current => {
        const totalProgress = current.reduce((sum, item) => sum + item.progress, 0);
        const overall = Math.round(totalProgress / current.length);
        setOverallProgress(overall);
        return current;
      });
    }, 100);
    
    const results = await Promise.all(uploadPromises);
    clearInterval(progressInterval);
    
    if (results.some(success => success)) {
      console.log('refresh');
      onSuccess();
    }
    
    setUploading(false);
    // 保持进度显示一段时间后清除
    setTimeout(() => {
      setUploadProgress([]);
      setOverallProgress(0);
    }, 2000);
  };

  return {
    dragActive,
    uploading,
    uploadProgress,
    overallProgress,
    handleDrag,
    handleDrop,
    handleChange
  };
};