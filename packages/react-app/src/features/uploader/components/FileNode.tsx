import React from 'react';
import { File, Download, Trash2 } from 'lucide-react';
import { FileInfo } from '../types/FileInfo';

interface FileNodeProps {
  item: FileInfo;
  onDelete: (path: string) => void;
  onDownload: (path: string) => void;
  onPreview: (path: string) => void;
  level: number;
  isSelected?: (path: string) => boolean;
  onToggleSelect?: (path: string) => void;
}

const FileNode: React.FC<FileNodeProps> = ({
  item,
  onDelete,
  onDownload,
  onPreview,
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

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview(itemPath);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggleSelect?.(itemPath);
  };

  const indentStyle = { paddingLeft: `${level * 1}rem` };

  return (
    <div
      className={`rounded px-2 py-1 transition ${
        selected ? 'bg-brand-50' : 'bg-white/60'
      }`}
      style={indentStyle}
    >
      <div className="group flex items-center gap-1.5 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={selected}
          onChange={handleCheckboxChange}
          className={`h-3.5 w-3.5 cursor-pointer rounded border-neutral-200 transition-colors hover:border-brand-400 hover:text-brand-500 checked:text-brand-500 focus:ring-brand-500 ${
            selected ? '' : 'invisible group-hover:visible'
          }`}
          aria-label={`选择 ${item.name}`}
        />
        <div className="h-5 w-5 flex-shrink-0" />
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-neutral-100 text-neutral-400">
          <File size={14} />
        </div>
        <span
          className="flex-1 truncate cursor-pointer transition-colors hover:text-brand-600 hover:underline"
          title={item.name}
          onClick={handlePreview}
        >
          {item.name}
        </span>
        <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500">
          {(item.size / 1024).toFixed(1)} KB
        </span>
        <button
          onClick={handleDownload}
          className="flex h-6 w-6 items-center justify-center rounded text-brand-500 hover:bg-brand-50"
          title="下载文件"
          aria-label="下载文件"
        >
          <Download size={14} />
        </button>
        <button
          onClick={handleDelete}
          className="flex h-6 w-6 items-center justify-center rounded text-danger hover:bg-danger/10"
          title="删除文件"
          aria-label="删除文件"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default FileNode;
