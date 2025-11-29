import React from 'react';
import { FileInfo } from '../types/FileInfo';
import { SelectionState } from '../hooks/useFileSelection';
import FolderNode from './FolderNode';
import FileNode from './FileNode';

interface TreeNodeProps {
  item: FileInfo;
  onDelete: (path: string) => void;
  onDownload: (path: string) => void;
  onNavigateToDir?: (path: string) => void;
  level: number;
  isSelected?: (path: string) => boolean;
  getSelectionState?: (path: string) => SelectionState;
  onToggleSelect?: (path: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = (props) => {
  if (props.item.isDir) {
    return <FolderNode {...props} />;
  }
  return <FileNode {...props} />;
};

export default TreeNode;
