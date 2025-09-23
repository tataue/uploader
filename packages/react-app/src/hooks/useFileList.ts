import { useState, useEffect } from 'react';
import { FileInfo } from '../types/FileInfo';

const fileListUrl = './uploader';

export const useFileList = () => {
  const [needRefresh, refresh] = useState(false);
  const [fileList, setFileList] = useState<FileInfo[]>([]);

  useEffect(() => {
    fetch(fileListUrl)
      .then((res) => res.json())
      .then((data: FileInfo[]) => {
        setFileList(data);
      })
      .catch((error) => {
        console.error('获取文件列表失败:', error);
        setFileList([]);
      });
  }, [needRefresh]);

  const refreshFileList = () => {
    refresh(!needRefresh);
  };

  return {
    fileList,
    refreshFileList
  };
};