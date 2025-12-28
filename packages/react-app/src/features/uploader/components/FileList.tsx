import { useState, useMemo } from 'react';
import EmptyState from './EmptyState';
import DirectoryTree from './DirectoryTree';
import FileListHeader from './FileListHeader';
import BatchActionBar from './BatchActionBar';
import { FileInfo } from '../types/FileInfo';
import { findNodeByPath, filterTree } from '../utils/fileTreeUtils';
import { useFileSelection } from '../hooks/useFileSelection';
import { useFileActions } from '../hooks/useFileActions';

interface FileListProps {
  files: FileInfo[];
  onBatchDelete: (paths: string[]) => Promise<void>;
  currentPath?: string;
  onNavigateToDir?: (dirPath: string) => void;
}

export default function FileList({ files, onBatchDelete, currentPath = '', onNavigateToDir }: FileListProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const displayedItems = useMemo(() => {
    if (!currentPath) return files;
    const node = findNodeByPath(files, currentPath);
    return node?.children || [];
  }, [files, currentPath]);

  const filteredFiles = searchQuery ? filterTree(displayedItems, searchQuery) : displayedItems;

  const {
    selectedItems,
    selectedCount,
    isSelected,
    getSelectionState,
    toggleSelection,
    selectAll,
    clearSelection,
    isAllSelected,
  } = useFileSelection(filteredFiles, files);

  const { handleDelete, handleDownload, handlePreview, handleBatchDelete, handleBatchDownload } = useFileActions({
    selectedItems,
    selectedCount,
    onBatchDelete,
    clearSelection,
  });

  const handleNavigateToDir = (path: string): void => {
    onNavigateToDir?.(path);
  };

  const handleGoBack = (): void => {
    if (currentPath) {
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
      onNavigateToDir?.(parentPath);
    }
  };

  if (files.length === 0) return <EmptyState />;

  return (
    <section className="space-y-5">
      <FileListHeader
        currentPath={currentPath}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onGoBack={handleGoBack}
        onBreadcrumbClick={handleNavigateToDir}
        itemCount={filteredFiles.length}
      />

      <BatchActionBar
        selectedCount={selectedCount}
        isAllSelected={isAllSelected}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onBatchDelete={handleBatchDelete}
        onBatchDownload={handleBatchDownload}
      />

      {filteredFiles.length === 0 ? (
        <div className="card rounded-xl border border-dashed border-neutral-200/70 p-8 text-center text-sm text-neutral-500">
          {searchQuery ? `未找到匹配 "${searchQuery}" 的文件` : '当前目录为空'}
        </div>
      ) : (
        <div className="card p-6 backdrop-blur-sm">
          <DirectoryTree
            items={filteredFiles}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onPreview={handlePreview}
            onNavigateToDir={handleNavigateToDir}
            isSelected={isSelected}
            getSelectionState={getSelectionState}
            onToggleSelect={toggleSelection}
          />
        </div>
      )}
    </section>
  );
}
