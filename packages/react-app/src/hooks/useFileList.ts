import { useState, useEffect, useRef } from 'react';
import { FileInfo } from '../types/FileInfo';

const fileListUrl = './uploader';

export const useFileList = () => {
  const [needRefresh, refresh] = useState(false);
  const [fileList, setFileList] = useState<FileInfo[]>([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const abortController = new AbortController();
    
    fetch(fileListUrl, { signal: abortController.signal })
      .then((res) => res.json())
      .then((data: FileInfo[]) => {
        if (isMountedRef.current) {
          setFileList(data);
        }
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          return;
        }
        console.error('获取文件列表失败:', error);
        if (isMountedRef.current) {
          setFileList([]);
        }
      });
    
    return () => {
      isMountedRef.current = false;
      abortController.abort();
    };
  }, [needRefresh]);

  const refreshFileList = () => {
    refresh(!needRefresh);
  };

  return {
    fileList,
    refreshFileList
  };
};