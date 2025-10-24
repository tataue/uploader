import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, File, Download, Trash2, LogIn } from 'lucide-react';
import { FileInfo } from '../types/FileInfo';

interface DirectoryTreeProps {
  items: FileInfo[];
  onDelete: (path: string) => void;
  onDownload: (path: string) => void;
  onNavigateToDir?: (path: string) => void;
}

interface TreeNodeProps {
  item: FileInfo;
  onDelete: (path: string) => void;
  onDownload: (path: string) => void;
  onNavigateToDir?: (path: string) => void;
  level: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ item, onDelete, onDownload, onNavigateToDir, level }) => {
  const [expanded, setExpanded] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定删除 ${item.name} 吗？`)) onDelete(item.path || item.name);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(item.path || item.name);
  };

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigateToDir?.(item.path || item.name);
  };

  const indentStyle = { paddingLeft: `${level * 1.25}rem` };

  if (item.isDir) {
    return (
      <div className="rounded-lg bg-white/70 p-2 transition hover:shadow-soft" style={indentStyle}>
        <div className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-brand-50">
          <button
            className="flex h-6 w-6 items-center justify-center rounded-md border border-transparent text-neutral-400 transition hover:border-brand-200 hover:text-brand-500"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            aria-label={expanded ? '折叠目录' : '展开目录'}
            title={expanded ? '折叠' : '展开'}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <Folder size={18} className="text-brand-500" />
          <span
            className="flex-1 cursor-pointer text-sm font-medium text-neutral-900 hover:text-brand-600"
            onClick={handleNavigate}
          >
            {item.name}
          </span>
          <button
            onClick={handleNavigate}
            className="btn-ghost h-8 w-8 rounded-full bg-white/80 p-1 text-accent-600 hover:bg-accent-50"
            title="进入目录"
            aria-label="进入目录"
          >
            <LogIn size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="btn-ghost h-8 w-8 rounded-full bg-white/80 p-1 text-danger hover:bg-danger/10"
            title="删除目录"
            aria-label="删除目录"
          >
            <Trash2 size={14} />
          </button>
        </div>
        {expanded && item.children && item.children.length > 0 && (
          <div className="mt-1 space-y-1">
            {item.children.map((child) => (
              <TreeNode
                key={child.path || child.name}
                item={child}
                onDelete={onDelete}
                onDownload={onDownload}
                onNavigateToDir={onNavigateToDir}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 rounded-lg bg-white/60 px-4 py-2 text-sm text-neutral-700 transition hover:bg-white hover:shadow-soft"
      style={indentStyle}
    >
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

const DirectoryTree: React.FC<DirectoryTreeProps> = ({ items, onDelete, onDownload, onNavigateToDir }) => {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-neutral-200/70 bg-white/80 py-10 text-neutral-500">
        <p>暂无文件</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <TreeNode
          key={item.path || item.name}
          item={item}
          onDelete={onDelete}
          onDownload={onDownload}
          onNavigateToDir={onNavigateToDir}
          level={0}
        />
      ))}
    </div>
  );
};

export default DirectoryTree;
