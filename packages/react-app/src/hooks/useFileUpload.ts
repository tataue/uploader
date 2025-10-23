import { useState, useRef, useEffect } from 'react';

interface FileUploadProgress {
  fileName: string;
  progress: number;
  completed: boolean;
}

export const useFileUpload = (onSuccess: () => void, currentPath: string = '') => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const activeXHRs = useRef<XMLHttpRequest[]>([]);
  const isMountedRef = useRef(true);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      activeXHRs.current.forEach(xhr => xhr.abort());
      activeXHRs.current = [];
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

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

  const uploadFile = (file: File, index: number, relativePath?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const formData = new FormData();
      formData.append('file', file);
      
      // 区分目标目录和文件相对路径
      if (relativePath) {
        // 目录上传：relativePath 包含文件名（来自 webkitRelativePath）
        const fullPath = currentPath ? `${currentPath}/${relativePath}` : relativePath;
        formData.append('relativePath', fullPath);
        console.log(`[Upload] DIR mode: file=${file.name}, relativePath=${relativePath}, currentPath=${currentPath}, fullPath=${fullPath}`);
      } else {
        // 单文件上传：只发送目标目录
        if (currentPath) {
          formData.append('targetDir', currentPath);
        }
        console.log(`[Upload] FILE mode: file=${file.name}, currentPath=${currentPath}`);
      }
      
      const xhr = new XMLHttpRequest();
      activeXHRs.current.push(xhr);
      
      const cleanup = () => {
        const xhrIndex = activeXHRs.current.indexOf(xhr);
        if (xhrIndex > -1) {
          activeXHRs.current.splice(xhrIndex, 1);
        }
      };
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && isMountedRef.current) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(prev => {
            const updated = prev.map((item, i) => 
              i === index ? { ...item, progress } : item
            );
            const totalProgress = updated.reduce((sum, item) => sum + item.progress, 0);
            const overall = Math.round(totalProgress / updated.length);
            setOverallProgress(overall);
            return updated;
          });
        }
      });
      
      xhr.addEventListener('load', () => {
        cleanup();
        if (!isMountedRef.current) {
          resolve(false);
          return;
        }
        
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadProgress(prev => {
            const updated = prev.map((item, i) => 
              i === index ? { ...item, progress: 100, completed: true } : item
            );
            const totalProgress = updated.reduce((sum, item) => sum + item.progress, 0);
            const overall = Math.round(totalProgress / updated.length);
            setOverallProgress(overall);
            return updated;
          });
          resolve(true);
        } else {
          console.error(`${file.name} 上传失败: ${xhr.status} ${xhr.statusText}`);
          console.error(`Response: ${xhr.responseText}`);
          resolve(false);
        }
      });
      
      xhr.addEventListener('error', () => {
        cleanup();
        console.error(`${file.name} 上传失败`);
        resolve(false);
      });
      
      xhr.addEventListener('abort', () => {
        cleanup();
        resolve(false);
      });
      
      xhr.open('POST', './uploader');
      xhr.send(formData);
    });
  };

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    const fileArray = Array.from(files);
    
    const initialProgress: FileUploadProgress[] = fileArray.map((file) => ({
      fileName: (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name,
      progress: 0,
      completed: false
    }));
    setUploadProgress(initialProgress);
    setOverallProgress(0);
    
    const uploadPromises = fileArray.map((file, index) => {
      const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || undefined;
      return uploadFile(file, index, relativePath);
    });
    const results = await Promise.all(uploadPromises);
    
    if (!isMountedRef.current) return;
    
    if (results.some(success => success)) {
      onSuccess();
    }
    
    setUploading(false);
    
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      if (isMountedRef.current) {
        setUploadProgress([]);
        setOverallProgress(0);
      }
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