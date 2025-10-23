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
    if (confirm(`确定删除 ${item.name} 吗？`)) {
      onDelete(item.path || item.name);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(item.path || item.name);
  };

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigateToDir?.(item.path || item.name);
  };

  const paddingLeft = level * 20;

  if (item.isDir) {
    return (
      <div className="border-l border-slate-200">
        <div
          className="flex items-center gap-2 py-2 px-3 hover:bg-blue-50 transition-colors bg-slate-50 group"
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          <button
            className="flex-shrink-0 w-5 flex justify-center hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <Folder size={16} className="text-blue-500 flex-shrink-0" />
          <span className="flex-1 text-sm font-medium text-slate-900 cursor-pointer group-hover:underline" onClick={handleNavigate}>
            {item.name}
          </span>
          <button
            onClick={handleNavigate}
            className="p-1.5 hover:bg-green-100 rounded transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
            title="进入目录"
          >
            <LogIn size={14} className="text-green-600" />
          </button>
          <button onClick={handleDelete} className="p-1.5 hover:bg-red-100 rounded transition-colors flex-shrink-0">
            <Trash2 size={14} className="text-red-600" />
          </button>
        </div>
        {expanded && item.children && item.children.length > 0 && (
          <div className="bg-white">
            {item.children.map((child) => (
              <TreeNode
                key={child.path}
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
      className="flex items-center gap-2 py-2 px-3 hover:bg-slate-100 transition-colors border-l border-slate-200"
      style={{ paddingLeft: `${paddingLeft}px` }}
    >
      <div className="flex-shrink-0 w-5" />
      <File size={16} className="text-slate-400 flex-shrink-0" />
      <span className="flex-1 text-sm text-slate-700">{item.name}</span>
      <span className="text-xs text-slate-500 flex-shrink-0">{(item.size / 1024).toFixed(1)} KB</span>
      <button onClick={handleDownload} className="p-1.5 hover:bg-blue-100 rounded transition-colors flex-shrink-0">
        <Download size={14} className="text-blue-600" />
      </button>
      <button onClick={handleDelete} className="p-1.5 hover:bg-red-100 rounded transition-colors flex-shrink-0">
        <Trash2 size={14} className="text-red-600" />
      </button>
    </div>
  );
};

const DirectoryTree: React.FC<DirectoryTreeProps> = ({ items, onDelete, onDownload, onNavigateToDir }) => {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500">
        <p>暂无文件</p>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden divide-y divide-slate-100">
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
