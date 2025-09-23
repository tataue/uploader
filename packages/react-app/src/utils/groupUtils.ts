import { FileInfo, FileGroup } from '../types/FileInfo';
import { getFileIcon } from './formatUtils';

export const groupByType = (files: FileInfo[]): FileGroup[] => {
  const groups: { [key: string]: FileInfo[] } = {};
  
  files.forEach(file => {
    const type = file.type || 'unknown';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(file);
  });

  return Object.entries(groups)
    .map(([type, files]) => ({
      label: type.toUpperCase() || 'UNKNOWN',
      files: files.sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime()),
      icon: getFileIcon(type)
    }))
    .sort((a, b) => b.files.length - a.files.length);
};

export const groupByTime = (files: FileInfo[]): FileGroup[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const groups: { [key: string]: FileInfo[] } = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: []
  };

  files.forEach(file => {
    const fileDate = new Date(file.uploadTime);
    if (fileDate >= today) {
      groups.today.push(file);
    } else if (fileDate >= yesterday) {
      groups.yesterday.push(file);
    } else if (fileDate >= thisWeek) {
      groups.thisWeek.push(file);
    } else {
      groups.older.push(file);
    }
  });

  const result: FileGroup[] = [];
  if (groups.today.length > 0) {
    result.push({ label: '今天', files: groups.today });
  }
  if (groups.yesterday.length > 0) {
    result.push({ label: '昨天', files: groups.yesterday });
  }
  if (groups.thisWeek.length > 0) {
    result.push({ label: '本周', files: groups.thisWeek });
  }
  if (groups.older.length > 0) {
    result.push({ label: '更早', files: groups.older });
  }

  return result;
};