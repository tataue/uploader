import React from 'react';
import { File, Download, Trash2 } from 'lucide-react';
import { FileInfo } from '../types/FileInfo';

interface FileNodeProps {
  item: FileInfo;
  onDelete: (path: string) => void;
  onDownload: (path: string) => void;
  level: number;
  isSelected?: (path: string) => boolean;
  onToggleSelect?: (path: string) => void;
}

const FileNode: React.FC<FileNodeProps> = ({
  item,
  onDelete,
  onDownload,
  level,
  isSelected,
  onToggleSelect,
}) => {
  const itemPath = item.path || item.name;
  const selected = isSelected?.(itemPath) ?? false;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定删除 ${item.name} 吗？`)) onDelete(itemPath);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(itemPath);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggleSelect?.(itemPath);
  };

  const indentStyle = { paddingLeft: `${level * 1.25}rem` };

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-neutral-700 transition hover:bg-white hover:shadow-soft ${
        selected ? 'bg-brand-50 ring-1 ring-brand-200' : 'bg-white/60'
      }`}
      style={indentStyle}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={handleCheckboxChange}
        className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-brand-500 focus:ring-brand-500"
        aria-label={`选择 ${item.name}`}
      />
      <div className="h-6 w-6 flex-shrink-0" />
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-400">
        <File size={16} />
      </div>
      <span className="flex-1 truncate" title={item.name}>
        {item.name}
      </span>
      <span className="badge bg-neutral-100 text-neutral-500">{(item.size / 1024).toFixed(1)} KB</span>
      <button
        onClick={handleDownload}
        className="btn-ghost h-8 w-8 rounded-full bg-white/80 p-1 text-brand-500 hover:bg-brand-50"
        title="下载文件"
        aria-label="下载文件"
      >
        <Download size={14} />
      </button>
      <button
        onClick={handleDelete}
        className="btn-ghost h-8 w-8 rounded-full bg-white/80 p-1 text-danger hover:bg-danger/10"
        title="删除文件"
        aria-label="删除文件"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default FileNode;
