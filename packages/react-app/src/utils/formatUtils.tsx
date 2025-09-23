import React from 'react';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
};

export const getFileIcon = (type: string): React.ReactElement => {
  const lowerType = type.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(lowerType)) {
    return <span className="text-green-500">🖼️</span>;
  } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(lowerType)) {
    return <span className="text-red-500">🎬</span>;
  } else if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(lowerType)) {
    return <span className="text-purple-500">🎵</span>;
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(lowerType)) {
    return <span className="text-orange-500">📦</span>;
  } else if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'html', 'css'].includes(lowerType)) {
    return <span className="text-blue-500">💻</span>;
  } else if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(lowerType)) {
    return <span className="text-gray-500">📄</span>;
  } else if (['xlsx', 'xls', 'csv'].includes(lowerType)) {
    return <span className="text-green-600">📊</span>;
  } else if (['dmg', 'iso', 'img'].includes(lowerType)) {
    return <span className="text-gray-600">📦</span>;
  }
  return <span className="text-gray-400">📄</span>;
};