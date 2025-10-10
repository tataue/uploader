import React from 'react';
import { 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileArchive, 
  FileCode, 
  FileText, 
  FileSpreadsheet,
  Terminal,
  File
} from 'lucide-react';

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
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
  }
};

export const getFileIcon = (type: string): React.ReactElement => {
  const lowerType = type.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(lowerType)) {
    return <FileImage className="w-5 h-5 text-emerald-500" />;
  } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(lowerType)) {
    return <FileVideo className="w-5 h-5 text-red-500" />;
  } else if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(lowerType)) {
    return <FileAudio className="w-5 h-5 text-purple-500" />;
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(lowerType)) {
    return <FileArchive className="w-5 h-5 text-orange-500" />;
  } else if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'scss', 'less'].includes(lowerType)) {
    return <FileCode className="w-5 h-5 text-blue-500" />;
  } else if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(lowerType)) {
    return <FileText className="w-5 h-5 text-indigo-500" />;
  } else if (['xlsx', 'xls', 'csv'].includes(lowerType)) {
    return <FileSpreadsheet className="w-5 h-5 text-teal-500" />;
  } else if (['sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd'].includes(lowerType)) {
    return <Terminal className="w-5 h-5 text-slate-600" />;
  }
  return <File className="w-5 h-5 text-slate-400" />;
};