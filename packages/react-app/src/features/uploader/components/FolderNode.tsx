import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, Trash2, LogIn } from 'lucide-react';
import { FileInfo } from '../types/FileInfo';
import TreeNode from './TreeNode';

interface FolderNodeProps {
  item: FileInfo;
  onDelete: (path: string) => void;
  onDownload: (path: string) => void;
  onNavigateToDir?: (path: string) => void;
  level: number;
  isSelected?: (path: string) => boolean;
  onToggleSelect?: (path: string) => void;
}

const FolderNode: React.FC<FolderNodeProps> = ({
  item,
  onDelete,
  onDownload,
  onNavigateToDir,
  level,
  isSelected,
  onToggleSelect,
}) => {
  const [expanded, setExpanded] = useState(false);
  const itemPath = item.path || item.name;
  const selected = isSelected?.(itemPath) ?? false;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定删除 ${item.name} 吗？`)) onDelete(itemPath);
  };

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigateToDir?.(itemPath);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggleSelect?.(itemPath);
  };

  const indentStyle = { paddingLeft: `${level * 1.25}rem` };

  return (
    <div
      className={`rounded-lg p-2 transition hover:shadow-soft ${
        selected ? 'bg-brand-50 ring-1 ring-brand-200' : 'bg-white/70'
      }`}
      style={indentStyle}
    >
      <div className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-brand-50/50">
        <input
          type="checkbox"
          checked={selected}
          onChange={handleCheckboxChange}
          className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-brand-500 focus:ring-brand-500"
          aria-label={`选择 ${item.name}`}
        />
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
              isSelected={isSelected}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FolderNode;
