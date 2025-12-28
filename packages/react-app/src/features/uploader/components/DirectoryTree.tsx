import React from 'react';
import { FileInfo } from '../types/FileInfo';
import { SelectionState } from '../hooks/useFileSelection';
import TreeNode from './TreeNode';

interface DirectoryTreeProps {
  items: FileInfo[];
  onDelete: (path: string) => void;
  onDownload: (path: string) => void;
  onPreview: (path: string) => void;
  onNavigateToDir?: (path: string) => void;
  isSelected?: (path: string) => boolean;
  getSelectionState?: (path: string) => SelectionState;
  onToggleSelect?: (path: string) => void;
}

const DirectoryTree: React.FC<DirectoryTreeProps> = ({
  items,
  onDelete,
  onDownload,
  onPreview,
  onNavigateToDir,
  isSelected,
  getSelectionState,
  onToggleSelect,
}) => {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-neutral-200/70 bg-white/80 py-10 text-neutral-500">
        <p>暂无文件</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {items.map((item) => (
        <TreeNode
          key={item.path || item.name}
          item={item}
          onDelete={onDelete}
          onDownload={onDownload}
          onPreview={onPreview}
          onNavigateToDir={onNavigateToDir}
          level={0}
          isSelected={isSelected}
          getSelectionState={getSelectionState}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
};

export default DirectoryTree;
